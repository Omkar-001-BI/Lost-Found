import mongoose from 'mongoose';
import Item from '../models/Item.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleItems = [
    {
        name: 'Blue Backpack',
        description: 'A navy blue Jansport backpack with silver zippers',
        type: 'Lost',
        location: 'University Library',
        date: '2024-01-15',
        number: '555-0123',
        img: 'uploads/backpack.jpg'
    },
    {
        name: 'Gold Watch',
        description: 'Found a gold-colored analog watch near the cafeteria',
        type: 'Found',
        location: 'Student Center Cafeteria',
        date: '2024-01-16',
        number: '555-0124',
        img: 'uploads/watch.jpg'
    },
    {
        name: 'Student ID Card',
        description: 'Found a student ID card for John Smith',
        type: 'Found',
        location: 'Parking Lot A',
        date: '2024-01-17',
        number: '555-0125',
        img: 'uploads/id-card.jpg'
    },
    {
        name: 'Laptop Charger',
        description: 'Lost my MacBook Pro charger, 60W with a small scratch on the brick',
        type: 'Lost',
        location: 'Engineering Building Room 205',
        date: '2024-01-18',
        number: '555-0126',
        img: 'uploads/charger.jpg'
    }
];

async function seedItems() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing items
        await Item.deleteMany({});
        console.log('Cleared existing items');

        // Get a sample user or create one
        let user = await User.findOne();
        if (!user) {
            user = await User.create({
                name: 'Sample User',
                email: 'sample@example.com',
                password: 'hashedpassword123',
            });
        }

        // Add userId to each item
        const itemsWithUser = sampleItems.map(item => ({
            ...item,
            userId: user._id
        }));

        // Insert sample items
        await Item.insertMany(itemsWithUser);
        console.log('Sample items inserted successfully');

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error seeding items:', error);
        process.exit(1);
    }
}

seedItems();