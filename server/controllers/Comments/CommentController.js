import Comment from '../../models/Comment.js';
import Item from '../../models/Item.js';
import Notification from '../../models/Notification.js';
import User from '../../models/User.js';

// Add a new comment to an item
export const addComment = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { userId, text } = req.body;
        if (!text) {
            return res.status(400).json({ ok: false, msg: 'Comment text is required' });
        }
        const comment = new Comment({ itemId, userId, text });
        await comment.save();

        // Fetch the item to get the owner, name, and type
        const item = await Item.findById(itemId);
        // Fetch the commenter to get their nickname
        const commenter = await User.findById(userId);
        if (item && commenter && item.userId.toString() !== userId) {
            // Debug logs
            console.log('Commenter:', commenter);
            const notifMsg = `${commenter.nickname} commented on your item '${item.name}'`;
            console.log('Notification message:', notifMsg);
            // Create a notification for the item owner
            await Notification.create({
                userId: item.userId,
                type: 'comment',
                message: notifMsg,
                itemId: item._id,
                fromUserId: userId,
                itemName: item.name,
                itemType: item.type,
            });
        }

        res.status(201).json({ ok: true, comment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Failed to add comment' });
    }
};

// Get all comments for an item
export const getCommentsByItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const comments = await Comment.find({ itemId }).populate('userId', 'nickname img');
        res.status(200).json({ ok: true, comments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Failed to fetch comments' });
    }
};

// Delete a comment (by comment owner or admin)
export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        // Optionally, check if req.id === comment.userId or is admin
        await Comment.findByIdAndDelete(commentId);
        res.status(200).json({ ok: true, msg: 'Comment deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Failed to delete comment' });
    }
}; 