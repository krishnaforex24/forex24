# Forex24 Investment Platform

A full-stack investment platform with user authentication, email verification, and admin panel.

## Features

- User signup and login with email verification
- User profile page showing balance and withdrawal information
- Admin panel to manage all users
- SMTP email integration with GoDaddy
- MongoDB database integration
- Secure authentication with JWT tokens

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional, defaults are set in server.js):
```
MONGODB_URI=mongodb+srv://personalkrishna17_db_user:hpyl8qrrWUk6hmyC@cluster0.f79pbvq.mongodb.net/forex24?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
BASE_URL=http://localhost:3000
PORT=3000
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## User Flow

1. **Sign Up**: Users create an account with name, email, and password
2. **Email Verification**: Users receive an email with verification link and their username (forex24 + random number)
3. **Login**: After verification, users can login
4. **Profile**: Users can view their balance, withdrawals, and account information
5. **Admin Panel**: Admins can view and edit all user accounts

## Admin Access

To create an admin user, you need to manually set `isAdmin: true` in the MongoDB database for a user account.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify-email?token=...` - Verify email

### User
- `GET /api/user/profile` - Get user profile (requires auth)
- `PUT /api/user/profile` - Update user profile (requires auth)

### Admin
- `GET /api/admin/users` - Get all users (requires admin)
- `GET /api/admin/users/:id` - Get single user (requires admin)
- `PUT /api/admin/users/:id` - Update user (requires admin)
- `DELETE /api/admin/users/:id` - Delete user (requires admin)

## Email Configuration

SMTP settings are configured for GoDaddy:
- Host: smtpout.secureserver.net
- Port: 465
- From: support@forex24.vip

Make sure the email credentials are correct in `routes/auth.js`.

