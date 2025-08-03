import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
    },
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification; 