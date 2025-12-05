const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes.router);
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'profile.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// MongoDB Connection
// IMPORTANT: Set MONGODB_URI in .env file for security
// Never commit .env file to git
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('ERROR: MONGODB_URI environment variable is not set!');
    console.error('Please create a .env file with: MONGODB_URI=your_connection_string');
    process.exit(1);
}

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('MongoDB Connected');
        console.log('Database:', mongoose.connection.name);
    })
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        console.error('Error details:', err.message);
        console.error('Server will continue but database operations may fail.');
    });

// Start server (will work even if MongoDB connection is pending)
// For Vercel, export the app instead of listening
// Vercel will handle the serverless function
if (process.env.VERCEL) {
    module.exports = app;
} else {
    // For local development
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Open http://localhost:${PORT} in your browser`);
    });
}

