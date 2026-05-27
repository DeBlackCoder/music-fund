# MusicFund Platform - Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/musicfund?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Paystack
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key

# Cloudflare R2
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=musicfund-uploads
R2_PUBLIC_URL=https://your-bucket.r2.dev

# Resend Email
RESEND_API_KEY=re_your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📊 Platform Overview

### User Roles

1. **Fan**
   - Browse and discover songs
   - Vote for artists (paid)
   - Like songs
   - Follow artists
   - View leaderboards

2. **Artist**
   - Upload songs
   - Create campaigns
   - Pay upload fee
   - Set funding goals
   - Track votes and earnings
   - Request withdrawals
   - View analytics

3. **Admin**
   - Approve/reject campaigns
   - Set platform fees
   - Manage withdrawals
   - View platform analytics
   - Manage users

---

## 💰 Payment Flow

### Upload Fee (Artist → Platform)
1. Artist uploads song
2. System calculates upload fee (admin-controlled)
3. Artist pays via Paystack
4. Campaign created with status "pending"
5. Admin reviews and approves

### Voting (Fan → Artist)
1. Fan clicks "Vote" button
2. Selects number of votes
3. System calculates amount (votes × vote price)
4. Fan pays via Paystack
5. Vote recorded
6. Campaign raised amount updated
7. If goal reached → status changes to "goal_reached"

### Withdrawal (Platform → Artist)
1. Artist requests withdrawal
2. System calculates commission
3. Admin reviews request
4. Admin approves
5. Funds transferred to artist's bank account

---

## 🗄️ Database Models

### User
- Full name, email, password
- Role: artist | fan | admin
- Profile image, bio, social links
- Followers/following count

### Campaign
- Title, audio file, cover image
- Goal amount, raised amount
- Vote count, like count
- Status: pending | active | goal_reached | rejected | ended
- Upload fee paid status
- Deadline, analytics

### Vote
- Campaign ID, User ID
- Vote count, amount paid
- Transaction reference
- Paystack reference

### Transaction
- User ID, Campaign ID
- Type: upload_fee | vote | withdrawal | commission
- Amount, status
- Transaction reference

### Withdrawal
- Artist ID, Campaign ID
- Amount, commission, net amount
- Bank details
- Status: pending | approved | rejected | processed

### PlatformSettings
- Upload fee
- Vote price
- Platform commission %
- Min/max goal amounts

---

## 🔑 API Endpoints (To Be Built)

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Campaigns
- `POST /api/campaigns/create` - Create campaign
- `GET /api/campaigns` - List campaigns
- `GET /api/campaigns/[slug]` - Get campaign details

### Voting
- `POST /api/vote/initialize` - Initialize payment
- `POST /api/vote/verify` - Verify and record vote

### Admin
- `GET /api/admin/campaigns` - List all campaigns
- `PUT /api/admin/campaigns/[id]/approve` - Approve
- `PUT /api/admin/settings` - Update settings

---

## 🎨 Frontend Components

### Existing (Need Updates)
- `SongCard` - Display campaign card
- `Hero` - Landing page hero
- `Navbar` - Navigation
- `MusicPlayer` - Audio player

### To Be Created
- `VoteButton` - Vote with payment
- `PaymentModal` - Payment interface
- `AdminDashboard` - Admin panel
- `WithdrawalForm` - Request withdrawal
- `CampaignUpload` - Upload song form

---

## 📈 Key Features

### For Artists
✅ Upload songs with cover art
✅ Set fundraising goals
✅ Track votes in real-time
✅ View campaign analytics
✅ Request withdrawals
✅ Share campaign links

### For Fans
✅ Discover new music
✅ Vote for favorite artists
✅ Like and share songs
✅ Follow artists
✅ View leaderboards

### For Admins
✅ Approve campaigns
✅ Set platform fees
✅ Manage withdrawals
✅ View analytics
✅ Control platform settings

---

## 🔐 Security Features

- Password hashing with bcrypt
- JWT authentication
- Role-based access control
- Secure payment processing
- Transaction verification
- Input validation

---

## 📧 Email Notifications

- Welcome email on registration
- Campaign approved notification
- Goal reached notification
- New vote notification
- Withdrawal status updates

---

## 🎯 Next Development Steps

See `RESTRUCTURING_PROGRESS.md` for detailed next steps.

Priority:
1. Build authentication API routes
2. Build campaign API routes
3. Build voting system with Paystack
4. Build admin dashboard
5. Update frontend components
6. Testing and deployment

---

## 📞 Support

For questions or issues, refer to:
- `RESTRUCTURING_PROGRESS.md` - Detailed progress
- `.env.example` - Environment variables
- Model files in `src/models/` - Database schema

---

## 🎵 Let's Build Something Amazing!

This platform will help upcoming artists raise funds for their music videos through fan support. Every vote brings them closer to their dreams!
