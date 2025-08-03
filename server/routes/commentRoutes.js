import express from 'express';
import { addComment, getCommentsByItem, deleteComment } from '../controllers/Comments/CommentController.js';

const router = express.Router();

// Add a comment to an item
router.post('/:itemId', addComment);

// Get all comments for an item
router.get('/:itemId', getCommentsByItem);

// Delete a comment
router.delete('/:commentId', deleteComment);

export default router; 