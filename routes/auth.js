const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// IMPORTANT: Set JWT_SECRET in .env file for security
// Never commit .env file to git
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('ERROR: JWT_SECRET environment variable is not set!');
    console.error('Please create a .env file with: JWT_SECRET=your_secret_key');
    process.exit(1);
}

// SMTP Configuration for GoDaddy
const transporter = nodemailer.createTransport({
    host: 'smtpout.secureserver.net',
    port: 465,
    secure: true,
    auth: {
        user: 'support@forex24.vip',
        pass: 'Forex24@5668'
    }
});

// Generate random username (FX10 + 4 random digits)
async function generateUsername() {
    let username;
    let exists = true;
    
    // Keep generating until we find a unique username
    while (exists) {
        const randomNo = crypto.randomInt(1000, 9999);
        username = `FX10${randomNo}`;
        
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            exists = false;
        }
    }
    
    return username;
}

// Send verification email
async function sendVerificationEmail(email, token, username, otp) {
    // Always use BASE_URL if set (should be custom domain), otherwise use Vercel URL or localhost
    let baseUrl;
    if (process.env.BASE_URL) {
        baseUrl = process.env.BASE_URL.replace(/\/$/, ''); // Remove trailing slash
    } else if (process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`;
    } else {
        baseUrl = 'http://localhost:3000';
    }
    
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;
    
    const mailOptions = {
        from: 'support@forex24.vip',
        to: email,
        subject: 'Verify Your Forex24 Account',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0066ff;">Welcome to Forex24!</h2>
                <p>Thank you for signing up. Please verify your email address to activate your account.</p>
                <p><strong>Your username:</strong> ${username}</p>
                <p><strong>Your verification OTP:</strong> <span style="font-size: 24px; font-weight: bold; color: #0066ff; letter-spacing: 3px;">${otp}</span></p>
                <p style="margin-top: 20px;">Click the button below to verify your email:</p>
                <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #00d4ff, #0066ff); color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Verify Email</a>
                <p>Or copy and paste this link in your browser:</p>
                <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
                <p style="margin-top: 20px; padding: 15px; background: #f5f7fa; border-radius: 6px;"><strong>Alternative:</strong> If the link doesn't work, you can verify using the OTP code above at <a href="${baseUrl}/verify-otp" style="color: #0066ff;">${baseUrl}/verify-otp</a></p>
                <p>If you didn't create this account, please ignore this email.</p>
            </div>
        `
    };

    try {
        console.log('Attempting to send verification email to:', email);
        console.log('Using base URL:', baseUrl);
        console.log('Verification URL:', verificationUrl);
        
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully! Message ID:', info.messageId);
        return true;
    } catch (error) {
        console.error('Email send error:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response
        });
        return false;
    }
}

// Signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Generate verification token, OTP, and username
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
        const username = await generateUsername();

        // Create user
        const user = new User({
            name,
            email,
            password,
            username,
            emailVerificationToken: verificationToken,
            emailVerificationOTP: otp,
            otpExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // OTP expires in 24 hours
            isEmailVerified: false
        });

        await user.save();

        // Send verification email
        const emailSent = await sendVerificationEmail(email, verificationToken, username, otp);
        
        if (!emailSent) {
            console.error('Failed to send verification email, but user was created');
            // Still return success, but log the issue
        }

        res.json({ 
            message: 'Account created! Please check your email to verify your account.',
            username: username,
            emailSent: emailSent
        });
    } catch (error) {
        console.error('Signup error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Server error. Please try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Verify Email
router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.send(`
                <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h2 style="color: #ff0000;">Invalid verification link</h2>
                        <p>Please check your email for the correct verification link.</p>
                        <a href="/login" style="color: #0066ff;">Go to Login</a>
                    </body>
                </html>
            `);
        }

        const user = await User.findOne({ emailVerificationToken: token });

        if (!user) {
            return res.send(`
                <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h2 style="color: #ff0000;">Invalid or expired verification link</h2>
                        <p>Please request a new verification email.</p>
                        <a href="/login" style="color: #0066ff;">Go to Login</a>
                    </body>
                </html>
            `);
        }

        if (user.isEmailVerified) {
            return res.send(`
                <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h2 style="color: #0066ff;">Email already verified</h2>
                        <p>Your email has already been verified. You can now login.</p>
                        <a href="/login" style="color: #0066ff;">Go to Login</a>
                    </body>
                </html>
            `);
        }

        // Verify email
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        await user.save();

        res.send(`
            <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h2 style="color: #00aa00;">Email Verified Successfully!</h2>
                    <p>Your account has been activated. Your username is: <strong>${user.username}</strong></p>
                    <p>You can now login to your account.</p>
                    <a href="/login" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #00d4ff, #0066ff); color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">Go to Login</a>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).send(`
            <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h2 style="color: #ff0000;">Verification failed</h2>
                    <p>An error occurred. Please try again later.</p>
                    <p>You can also verify using OTP at <a href="/verify-otp" style="color: #0066ff;">/verify-otp</a></p>
                    <a href="/login" style="color: #0066ff;">Go to Login</a>
                </body>
            </html>
        `);
    }
});

// Verify Email with OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ error: 'Email already verified' });
        }

        // Check if OTP matches and is not expired
        if (user.emailVerificationOTP !== otp) {
            return res.status(401).json({ error: 'Invalid OTP code' });
        }

        if (user.otpExpiresAt && new Date() > user.otpExpiresAt) {
            return res.status(401).json({ error: 'OTP has expired. Please request a new one.' });
        }

        // Verify email
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationOTP = undefined;
        user.otpExpiresAt = undefined;
        await user.save();

        res.json({ 
            message: 'Email verified successfully!',
            username: user.username
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            console.log('Login attempt: User not found for email:', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            console.log('Login attempt: Email not verified for:', email);
            return res.status(401).json({ error: 'Please verify your email before logging in' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Login attempt: Password mismatch for:', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('Login successful for:', email, 'Admin:', user.isAdmin);

        // Generate token
        const token = jwt.sign(
            { userId: user._id, email: user.email, isAdmin: user.isAdmin },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

module.exports = { router, authenticateToken };

