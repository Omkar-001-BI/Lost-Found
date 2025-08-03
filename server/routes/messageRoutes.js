import express from 'express';
import { validateJWT } from '../middlewares/validateToken.js';
import { sendMessage, getConversation } from '../controllers/Messages/MessageController.js';

const router = express.Router();

// Send a new message
router.post('/send', validateJWT, sendMessage);

// Get conversation between two users
router.get('/conversation/:userId', validateJWT, getConversation);

export default router;