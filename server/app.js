import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import userRoutes from './routes/userRoutes.js';
import ItemRoutes from './routes/ItemRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import Message from './models/Message.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    exposedHeaders: ["Content-Length", "X-Confirm-Delete"]
  },
  // Add Socket.IO specific configurations
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});
app.use(express.json())
// Configure CORS middleware with more comprehensive options
// Configure CORS for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Confirm-Delete'],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())


app.use('/users', userRoutes)

app.use('/Items', ItemRoutes)

app.use('/comments', commentRoutes)

app.use('/notifications', notificationRoutes)

app.use('/messages', messageRoutes)


const port = process.env.PORT || 4000;
const db = process.env.DB;

// Production configuration


mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('join', (userId) => {
        socket.join(userId);
        console.log('User joined room:', userId);
      });

      socket.on('get_message_history', async ({ userId, otherUserId, itemId }) => {
        try {
          const messages = await Message.find({
            $or: [
              { senderId: userId, receiverId: otherUserId },
              { senderId: otherUserId, receiverId: userId }
            ],
            ...(itemId !== 'no-item' && { itemId })
          })
          .populate('senderId', 'nickname fullname image')
          .populate('receiverId', 'nickname fullname image')
          .sort({ createdAt: 1 });

          socket.emit('message_history', messages);
        } catch (error) {
          console.error('Error fetching message history:', error);
        }
      });

      socket.on('send_message', async (messageData) => {
        try {
          const { senderId, receiverId, text, itemId } = messageData;
          
          if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
            socket.emit('message_error', { error: 'Invalid user ID format' });
            return;
          }

          const message = new Message({
            senderId: new mongoose.Types.ObjectId(senderId),
            receiverId: new mongoose.Types.ObjectId(receiverId),
            text,
            itemId: itemId && itemId !== 'no-item' ? itemId : undefined,
            createdAt: new Date()
          });
          
          const savedMessage = await message.save();
          const populatedMessage = await Message.findById(savedMessage._id)
            .populate('senderId', 'nickname fullname image')
            .populate('receiverId', 'nickname fullname image');

          // Emit to sender's room
          io.to(senderId).emit('message_sent', populatedMessage);
          
          // Emit to receiver's room
          io.to(receiverId).emit('receive_message', populatedMessage);

          // Trigger conversation update for both users
          [senderId, receiverId].forEach(userId => {
            socket.broadcast.to(userId).emit('conversation_updated');
          });
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('message_error', { error: 'Failed to send message' });
        }
      });

      socket.on('get_conversations', async (userId) => {
        try {
          if (!mongoose.Types.ObjectId.isValid(userId)) {
            socket.emit('error', { msg: 'Invalid user ID format' });
            return;
          }

          const userObjectId = new mongoose.Types.ObjectId(userId);
          const conversations = await Message.aggregate([
            {
              $match: {
                $or: [{ senderId: userObjectId }, { receiverId: userObjectId }]
              }
            },
            {
              $sort: { createdAt: -1 }
            },
            {
              $group: {
                _id: {
                  $cond: [
                    { $eq: ["$senderId", userObjectId] },
                    "$receiverId",
                    "$senderId"
                  ]
                },
                lastMessage: { $first: "$$ROOT" }
              }
            },
            {
              $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'otherUser'
              }
            },
            {
              $unwind: '$otherUser'
            },
            {
              $project: {
                _id: '$_id',
                otherUser: {
                  _id: '$otherUser._id',
                  nickname: '$otherUser.nickname',
                  fullname: '$otherUser.fullname',
                  image: '$otherUser.image'
                },
                lastMessage: {
                  _id: '$lastMessage._id',
                  text: '$lastMessage.text',
                  senderId: '$lastMessage.senderId',
                  receiverId: '$lastMessage.receiverId',
                  createdAt: '$lastMessage.createdAt',
                  itemId: '$lastMessage.itemId'
                }
              }
            },
            {
              $sort: { 'lastMessage.createdAt': -1 }
            }
          ]);

          socket.emit('conversations_list', conversations);
        } catch (error) {
          console.error('Error fetching conversations:', error);
          socket.emit('error', { msg: 'Failed to fetch conversations' });
        }
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    httpServer.listen(port, () => console.log('Connection done and running on PORT :' + port));
  })
  .catch((err) => console.log(err.message));

