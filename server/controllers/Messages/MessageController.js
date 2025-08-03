import Message from '../../models/Message.js';

// Send a new message
export const sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, text, itemId } = req.body;
        const message = new Message({
            senderId,
            receiverId,
            text,
            itemId
        });
        await message.save();
        
        // Populate sender and receiver information
        const populatedMessage = await Message.findById(message._id)
            .populate('senderId', 'nickname fullname image')
            .populate('receiverId', 'nickname fullname image');

        res.status(201).json({ ok: true, message: populatedMessage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Failed to send message' });
    }
};

// Get conversation between two users
export const getConversation = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId: userId },
                { senderId: userId, receiverId: currentUserId }
            ]
        })
        .sort({ createdAt: 1 })
        .populate('senderId', 'nickname fullname image')
        .populate('receiverId', 'nickname fullname image')
        .populate('itemId', 'name images');

        res.status(200).json({ ok: true, messages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Failed to fetch conversation' });
    }
};