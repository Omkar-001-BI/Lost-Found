import mongoose from "mongoose";

const ItemsSchema = new mongoose.Schema({
    // Sample items for testing
    /*
    Example items:
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
    }
    */
    name: 
    { type: String, default: 'No Name' },

    userId: 
    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    description: 
    { type: String, default: 'Withouth description' },
    
    type:
    { type: String, enum: ['Lost', 'Found'], required: true },
    
    location:
    {type: String, required: true},
    
    date: 
    { type: String, required: true },

    number: { type: String, required: true },
    
    img: [
        {
            type: String,
            default:
                'https://i.ibb.co/DpZ3qy2/Untitled-design-10.png',
        },
    ],
    createdAt: { type: Date, default: Date.now },
})

const Item = mongoose.model('Item', ItemsSchema)
export default Item