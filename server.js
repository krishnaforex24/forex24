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

app.get('/verify-otp', (req, res) => {
    res.sendFile(path.join(__dirname, 'verify-otp.html'));
});

// Serve all other HTML pages
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/plans', (req, res) => {
    res.sendFile(path.join(__dirname, 'plans.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

app.get('/faq', (req, res) => {
    res.sendFile(path.join(__dirname, 'faq.html'));
});

app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'privacy.html'));
});

app.get('/terms', (req, res) => {
    res.sendFile(path.join(__dirname, 'terms.html'));
});

// Fallback: serve HTML files by name (without .html extension)
app.get('/:page', (req, res, next) => {
    const page = req.params.page;
    // Only serve if it's an HTML file and not an API route
    if (!page.startsWith('api') && !page.includes('.')) {
        const filePath = path.join(__dirname, `${page}.html`);
        res.sendFile(filePath, (err) => {
            if (err) {
                // If file doesn't exist, continue to next middleware
                next();
            }
        });
    } else {
        next();
    }
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
// Export app for Vercel serverless functions
// For local development, start the server
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Open http://localhost:${PORT} in your browser`);
    });
}

// Export for Vercel
module.exports = app;

