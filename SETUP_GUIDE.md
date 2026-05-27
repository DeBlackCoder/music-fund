# Quick Setup Guide

## 1. Environment Variables Setup

Create a `.env.local` file in the `my-studio` directory:

```bash
cd my-studio
touch .env.local  # On Windows: type nul > .env.local
```

Add your MongoDB connection string and other required variables:

```env
# Database (REQUIRED)
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/musicfund?retryWrites=true&w=majority

# JWT (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d

# Paystack (REQUIRED for payments)
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key

# Cloudflare R2 (REQUIRED for file uploads)
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=musicfund-uploads
R2_PUBLIC_URL=https://your-bucket.r2.dev

# Resend Email (OPTIONAL - for email notifications)
RESEND_API_KEY=re_your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 4. Create Your First Admin User

### Option A: Using MongoDB Compass or Atlas
1. Connect to your MongoDB database
2. Go to the `users` collection
3. Insert a new document:

```json
{
  "fullName": "Admin User",
  "email": "admin@example.com",
  "password": "$2a$10$YourHashedPasswordHere",
  "role": "admin",
  "isActive": true,
  "verified": true,
  "createdAt": { "$date": "2024-01-01T00:00:00.000Z" },
  "updatedAt": { "$date": "2024-01-01T00:00:00.000Z" }
}
```

### Option B: Register via API
1. Start the server
2. Go to `http://localhost:3000/auth/signup`
3. Register as an artist
4. Manually update the user's role to "admin" in MongoDB

## 5. Test Authentication

### Register a New User
1. Navigate to `http://localhost:3000/auth/signup`
2. Fill in the form:
   - Full Name
   - Email
   - Password
   - Role (Artist or Fan)
   - Artist Name (if Artist)
   - Phone Number
3. Click "Sign Up"
4. You should be redirected and logged in

### Login
1. Navigate to `http://localhost:3000/auth/login`
2. Enter your email and password
3. Click "Login"
4. You should be redirected to dashboard (artists) or discover (fans)

### Verify Navigation
- **As Guest**: Should see Home, Discover, Login, Sign Up
- **As Fan**: Should see Home, Discover, Notifications, Profile
- **As Artist**: Should see Home, Discover, Dashboard, Upload, Notifications, Profile
- **As Admin**: Should see Home, Discover, Admin, Notifications, Profile

## 6. Common Issues & Solutions

### Issue: "Please define the MONGODB_URI environment variable"
**Solution**: 
- Ensure `.env.local` file exists in `my-studio` directory
- Verify `MONGODB_URI` is set correctly
- Restart the dev server (`Ctrl+C` then `npm run dev`)

### Issue: "Cannot connect to MongoDB"
**Solution**:
- Check your MongoDB connection string is correct
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify network connectivity

### Issue: "Invalid email or password"
**Solution**:
- Verify the user exists in the database
- Check password is correct
- Try registering a new user

### Issue: Navigation not updating after login
**Solution**:
- Clear browser cache and localStorage
- Hard refresh the page (`Ctrl+Shift+R`)
- Check browser console for errors

### Issue: "Token expired" or authentication errors
**Solution**:
- Logout and login again
- Clear localStorage: `localStorage.clear()`
- Check JWT_SECRET is set in `.env.local`

## 7. MongoDB Atlas Setup (If Needed)

1. **Create Account**: Go to https://www.mongodb.com/cloud/atlas
2. **Create Cluster**: Choose free tier (M0)
3. **Create Database User**:
   - Username: your_username
   - Password: your_password (save this!)
4. **Whitelist IP**: Add `0.0.0.0/0` for development (allow all IPs)
5. **Get Connection String**:
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `musicfund`

Example connection string:
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/musicfund?retryWrites=true&w=majority
```

## 8. Paystack Setup (For Payments)

1. **Create Account**: Go to https://paystack.com
2. **Get API Keys**:
   - Go to Settings → API Keys & Webhooks
   - Copy Test Secret Key (starts with `sk_test_`)
   - Copy Test Public Key (starts with `pk_test_`)
3. **Add to `.env.local`**:
   ```env
   PAYSTACK_SECRET_KEY=sk_test_your_key_here
   PAYSTACK_PUBLIC_KEY=pk_test_your_key_here
   ```

## 9. Cloudflare R2 Setup (For File Uploads)

1. **Create Account**: Go to https://cloudflare.com
2. **Create R2 Bucket**:
   - Go to R2 → Create Bucket
   - Name: `musicfund-uploads`
3. **Get API Keys**:
   - Go to R2 → Manage R2 API Tokens
   - Create API Token
   - Copy Account ID, Access Key, and Secret Key
4. **Add to `.env.local`**:
   ```env
   R2_ACCOUNT_ID=your_account_id
   R2_ACCESS_KEY_ID=your_access_key
   R2_SECRET_ACCESS_KEY=your_secret_key
   R2_BUCKET_NAME=musicfund-uploads
   R2_PUBLIC_URL=https://your-bucket.r2.dev
   ```

## 10. Development Workflow

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run TypeScript check
npx tsc --noEmit

# Format code
npm run format  # if configured
```

## 11. Project Structure

```
my-studio/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── campaigns/    # Campaign endpoints
│   │   ├── admin/        # Admin endpoints
│   │   └── ...
│   ├── components/       # React components
│   ├── auth/            # Auth pages (login, signup)
│   ├── dashboard/       # Artist dashboard
│   ├── admin/           # Admin panel
│   └── ...
├── src/
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── models/          # MongoDB models
│   ├── middleware/      # API middleware
│   └── types/           # TypeScript types
├── .env.local           # Environment variables (create this!)
└── package.json
```

## 12. Next Steps

1. ✅ Set up environment variables
2. ✅ Install dependencies
3. ✅ Start dev server
4. ✅ Register a user
5. ✅ Test login/logout
6. ✅ Create a campaign (as artist)
7. ✅ Test voting (as fan)
8. ✅ Test admin panel (as admin)

## Need Help?

Check the following documentation files:
- `API_DOCUMENTATION.md` - Complete API reference
- `SYSTEM_ARCHITECTURE.md` - System design and flows
- `NAVBAR_AUTH_FIX.md` - Navigation and authentication details
- `ADMIN_DASHBOARD_COMPLETE.md` - Admin features
- `BUILD_COMPLETE.md` - Complete feature list

Happy coding! 🚀
