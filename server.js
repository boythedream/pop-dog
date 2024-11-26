const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Async function to connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://raza:raza123@ac-oqjm5c9-shard-00-00.omuik7j.mongodb.net:27017,ac-oqjm5c9-shard-00-01.omuik7j.mongodb.net:27017,ac-oqjm5c9-shard-00-02.omuik7j.mongodb.net:27017/?replicaSet=atlas-oe2erw-shard-0&ssl=true&authSource=admin');
        console.log('Connected to MongoDB');
    } catch (err) {
        console.log('Failed to connect to MongoDB', err.message);
        process.exit(1);  // Exit process with failure
    }
};

// Call the async function to connect to the database
connectDB();

// Define the leaderboard schema
const leaderboardSchema = new mongoose.Schema({
    country: { type: String, required: true, unique: true },
    clicks: { type: Number, default: 0 }
});

// Create the leaderboard model
const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

// POST: Update clicks for a user's country
app.post('/click', async (req, res) => {
    const { country } = req.body;

    try {
        let entry = await Leaderboard.findOne({ country });

        if (entry) {
            // Country already exists, increment the clicks
            entry.clicks += 1;
        } else {
            // Create a new entry for the country
            entry = new Leaderboard({ country, clicks: 1 });
        }

        await entry.save();
        res.status(200).json({ message: 'Click recorded' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to record click' });
    }
});

// GET: Retrieve the leaderboard
app.get('/leaderboard', async (req, res) => {
    try {
        const leaderboard = await Leaderboard.find().sort({ clicks: -1 });
        res.status(200).json(leaderboard);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

