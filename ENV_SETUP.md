# Environment Variables Setup

## Required Environment Variables

Create a `.env` file in the root directory with the following:

```
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.f79pbvq.mongodb.net/forex24?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
BASE_URL=http://localhost:3000
PORT=3000
```

## Security Notes

- **Never commit the `.env` file to git**
- The `.env` file is already in `.gitignore`
- Always use environment variables for sensitive data
- Change default values in production

