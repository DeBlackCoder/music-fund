# MusicFund System Architecture

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         MUSICFUND PLATFORM                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│     FAN      │     │    ARTIST    │     │    ADMIN     │
│              │     │              │     │              │
│ • Browse     │     │ • Upload     │     │ • Approve    │
│ • Vote       │     │ • Campaign   │     │ • Settings   │
│ • Like       │     │ • Withdraw   │     │ • Analytics  │
│ • Follow     │     │ • Analytics  │     │ • Manage     │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       └────────────────────┼────────────────────┘
                            │
                    ┌───────▼────────┐
                    │   NEXT.JS APP  │
                    │   (Frontend +  │
                    │   API Routes)  │
                    └───────┬────────┘
                            │
        ┏━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━┓
        ┃                                        ┃
┌───────▼────────┐                    ┌─────────▼─────────┐
│   MONGODB      │                    │  EXTERNAL SERVICES │
│   DATABASE     │                    │                    │
│                │                    │ • Paystack         │
│ • Users        │                    │ • Cloudflare R2    │
│ • Campaigns    │                    │ • Resend Email     │
│ • Votes        │                    │ • Google OAuth     │
│ • Transactions │                    │                    │
│ • Withdrawals  │                    │                    │
└────────────────┘                    └────────────────────┘
```

---

## 🔄 Campaign Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                      CAMPAIGN LIFECYCLE                          │
└─────────────────────────────────────────────────────────────────┘

1. ARTIST UPLOADS SONG
   │
   ├─► Pay Upload Fee (₦2,000)
   │   └─► Paystack Payment
   │       └─► Success ✓
   │
2. CAMPAIGN CREATED
   │
   ├─► Status: PENDING
   │   └─► Waiting for Admin Approval
   │
3. ADMIN REVIEWS
   │
   ├─► APPROVED ✓
   │   │
   │   ├─► Status: ACTIVE
   │   │   │
   │   │   ├─► Fans Can Vote
   │   │   │   │
   │   │   │   ├─► Vote Payment (₦100/vote)
   │   │   │   │   └─► Raised Amount Increases
   │   │   │   │
   │   │   │   └─► Goal Reached?
   │   │   │       │
   │   │   │       ├─► YES ✓
   │   │   │       │   │
   │   │   │       │   ├─► Status: GOAL_REACHED
   │   │   │       │   │   └─► Voting Closed
   │   │   │       │   │       └─► "Ready For Music Video Production"
   │   │   │       │   │
   │   │   │       │   └─► Artist Requests Withdrawal
   │   │   │       │       │
   │   │   │       │       ├─► Admin Approves
   │   │   │       │       │   └─► Funds Transferred
   │   │   │       │       │       └─► (Minus Commission)
   │   │   │       │       │
   │   │   │       │       └─► Admin Rejects
   │   │   │       │           └─► Reason Provided
   │   │   │       │
   │   │   │       └─► NO
   │   │   │           └─► Continue Accepting Votes
   │   │   │
   │   │   └─► Deadline Reached?
   │   │       │
   │   │       └─► Status: ENDED
   │   │
   │   └─► Campaign Goes Live
   │
   └─► REJECTED ✗
       └─► Reason Provided
           └─► Upload Fee Refunded (Optional)
```

---

## 💳 Payment Flows

### 1. Upload Fee Payment

```
Artist                  Platform              Paystack
  │                        │                     │
  ├─► Upload Song          │                     │
  │                        │                     │
  ├─────────────────────► │                     │
  │   Request Upload Fee   │                     │
  │                        │                     │
  │ ◄─────────────────────┤                     │
  │   Fee: ₦2,000          │                     │
  │                        │                     │
  ├─────────────────────► │                     │
  │   Initialize Payment   │                     │
  │                        │                     │
  │                        ├───────────────────► │
  │                        │  Create Transaction │
  │                        │                     │
  │                        │ ◄─────────────────┤
  │                        │  Payment URL       │
  │                        │                     │
  │ ◄─────────────────────┤                     │
  │   Redirect to Paystack │                     │
  │                        │                     │
  ├───────────────────────────────────────────► │
  │                   Pay ₦2,000                 │
  │                                              │
  │ ◄───────────────────────────────────────────┤
  │              Payment Success                 │
  │                        │                     │
  ├─────────────────────► │                     │
  │   Verify Payment       │                     │
  │                        │                     │
  │                        ├───────────────────► │
  │                        │  Verify Transaction │
  │                        │                     │
  │                        │ ◄─────────────────┤
  │                        │  Confirmed ✓        │
  │                        │                     │
  │ ◄─────────────────────┤                     │
  │   Campaign Created     │                     │
  │   Status: PENDING      │                     │
```

### 2. Vote Payment

```
Fan                     Platform              Paystack
  │                        │                     │
  ├─► Select Campaign      │                     │
  │                        │                     │
  ├─► Click "Vote"         │                     │
  │                        │                     │
  ├─► Enter Vote Count     │                     │
  │   (e.g., 500 votes)    │                     │
  │                        │                     │
  ├─────────────────────► │                     │
  │   Initialize Vote      │                     │
  │                        │                     │
  │                        ├─► Calculate Amount  │
  │                        │   500 × ₦100 = ₦50,000
  │                        │                     │
  │                        ├───────────────────► │
  │                        │  Create Transaction │
  │                        │                     │
  │                        │ ◄─────────────────┤
  │                        │  Payment URL       │
  │                        │                     │
  │ ◄─────────────────────┤                     │
  │   Redirect to Paystack │                     │
  │                        │                     │
  ├───────────────────────────────────────────► │
  │                 Pay ₦50,000                  │
  │                                              │
  │ ◄───────────────────────────────────────────┤
  │              Payment Success                 │
  │                        │                     │
  ├─────────────────────► │                     │
  │   Verify Payment       │                     │
  │                        │                     │
  │                        ├───────────────────► │
  │                        │  Verify Transaction │
  │                        │                     │
  │                        │ ◄─────────────────┤
  │                        │  Confirmed ✓        │
  │                        │                     │
  │                        ├─► Record Vote       │
  │                        │   • Vote Count: 500 │
  │                        │   • Amount: ₦50,000 │
  │                        │                     │
  │                        ├─► Update Campaign   │
  │                        │   • Raised += ₦50,000
  │                        │   • Votes += 500    │
  │                        │                     │
  │                        ├─► Check Goal        │
  │                        │   Raised >= Goal?   │
  │                        │   YES ✓             │
  │                        │                     │
  │                        ├─► Update Status     │
  │                        │   GOAL_REACHED      │
  │                        │                     │
  │                        ├─► Send Notifications│
  │                        │   • Artist: Goal!   │
  │                        │   • Fan: Thank you! │
  │                        │                     │
  │ ◄─────────────────────┤                     │
  │   Vote Recorded ✓      │                     │
```

### 3. Withdrawal Flow

```
Artist                  Admin                Platform
  │                        │                     │
  ├─► Request Withdrawal   │                     │
  │   Campaign: Song X     │                     │
  │   Amount: ₦500,000     │                     │
  │                        │                     │
  ├─────────────────────► │                     │
  │                        │                     │
  │                        ├─► Calculate         │
  │                        │   Commission (10%)  │
  │                        │   = ₦50,000         │
  │                        │                     │
  │                        │   Net Amount        │
  │                        │   = ₦450,000        │
  │                        │                     │
  │                        ├─► Review Request    │
  │                        │                     │
  │                        ├─► APPROVE ✓         │
  │                        │                     │
  │                        ├───────────────────► │
  │                        │   Process Transfer  │
  │                        │                     │
  │                        │                     ├─► Paystack
  │                        │                     │   Transfer API
  │                        │                     │
  │                        │                     │ ◄─ Success ✓
  │                        │                     │
  │                        │ ◄─────────────────┤
  │                        │   Transfer Complete │
  │                        │                     │
  │ ◄─────────────────────┤                     │
  │   Withdrawal Approved  │                     │
  │   ₦450,000 Sent        │                     │
  │                        │                     │
  │ ◄─ Email Notification  │                     │
  │    Bank Alert          │                     │
```

---

## 🗃️ Database Schema Relationships

```
┌──────────────┐
│     USER     │
│              │
│ • _id        │
│ • email      │
│ • role       │
│ • artistName │
└──────┬───────┘
       │
       │ 1:N
       │
┌──────▼───────┐
│   CAMPAIGN   │
│              │
│ • _id        │
│ • artistId ──┼─► USER._id
│ • goalAmount │
│ • raised     │
│ • status     │
└──────┬───────┘
       │
       │ 1:N
       │
┌──────▼───────┐
│     VOTE     │
│              │
│ • _id        │
│ • campaignId ┼─► CAMPAIGN._id
│ • userId ────┼─► USER._id
│ • voteCount  │
│ • amount     │
└──────────────┘

┌──────────────┐
│     LIKE     │
│              │
│ • campaignId ┼─► CAMPAIGN._id
│ • userId ────┼─► USER._id
└──────────────┘

┌──────────────┐
│    FOLLOW    │
│              │
│ • followerId ┼─► USER._id (Fan)
│ • followingId┼─► USER._id (Artist)
└──────────────┘

┌──────────────┐
│ TRANSACTION  │
│              │
│ • userId ────┼─► USER._id
│ • campaignId ┼─► CAMPAIGN._id
│ • type       │
│ • amount     │
└──────────────┘

┌──────────────┐
│ WITHDRAWAL   │
│              │
│ • artistId ──┼─► USER._id
│ • campaignId ┼─► CAMPAIGN._id
│ • amount     │
│ • status     │
└──────────────┘
```

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION FLOW                         │
└─────────────────────────────────────────────────────────────────┘

1. REGISTRATION
   │
   ├─► User submits form
   │   • Full Name
   │   • Email
   │   • Password
   │   • Role (Artist/Fan)
   │
   ├─► Validate input
   │   └─► Check email uniqueness
   │
   ├─► Hash password (bcrypt)
   │
   ├─► Create user in database
   │
   ├─► Generate JWT token
   │   • userId
   │   • email
   │   • role
   │
   ├─► Send welcome email
   │
   └─► Return token + user data

2. LOGIN
   │
   ├─► User submits credentials
   │   • Email
   │   • Password
   │
   ├─► Find user by email
   │
   ├─► Compare password (bcrypt)
   │   │
   │   ├─► Match ✓
   │   │   │
   │   │   ├─► Generate JWT token
   │   │   │
   │   │   └─► Return token + user data
   │   │
   │   └─► No Match ✗
   │       └─► Return error

3. GOOGLE OAUTH
   │
   ├─► User clicks "Sign in with Google"
   │
   ├─► Redirect to Google
   │
   ├─► User authorizes
   │
   ├─► Google returns profile
   │
   ├─► Check if user exists (by googleId or email)
   │   │
   │   ├─► Exists
   │   │   └─► Login user
   │   │
   │   └─► New User
   │       └─► Create account
   │           └─► Login user
   │
   └─► Return token + user data

4. PROTECTED ROUTES
   │
   ├─► Request with Authorization header
   │   Bearer <token>
   │
   ├─► Verify JWT token
   │   │
   │   ├─► Valid ✓
   │   │   │
   │   │   ├─► Extract user data
   │   │   │
   │   │   ├─► Check role permissions
   │   │   │
   │   │   └─► Allow access
   │   │
   │   └─► Invalid ✗
   │       └─► Return 401 Unauthorized
```

---

## 📊 Admin Dashboard Data Flow

```
Admin Dashboard
       │
       ├─► Platform Statistics
       │   │
       │   ├─► Total Users (Artists + Fans)
       │   ├─► Active Campaigns
       │   ├─► Total Raised
       │   ├─► Platform Earnings (Commissions)
       │   └─► Pending Approvals
       │
       ├─► Campaign Management
       │   │
       │   ├─► List Pending Campaigns
       │   │   └─► Approve/Reject
       │   │
       │   ├─► List Active Campaigns
       │   │   └─► View Details
       │   │
       │   └─► List Completed Campaigns
       │       └─► View Analytics
       │
       ├─► Withdrawal Management
       │   │
       │   ├─► List Pending Withdrawals
       │   │   └─► Approve/Reject
       │   │
       │   └─► List Processed Withdrawals
       │       └─► View History
       │
       ├─► Platform Settings
       │   │
       │   ├─► Upload Fee: ₦2,000
       │   ├─► Vote Price: ₦100
       │   ├─► Commission: 10%
       │   ├─► Min Goal: ₦50,000
       │   └─► Max Goal: ₦10,000,000
       │
       └─► Analytics
           │
           ├─► Revenue Chart
           ├─► User Growth
           ├─► Top Artists
           └─► Top Campaigns
```

---

## 🎯 Key Business Rules

1. **Upload Fee**
   - Artist must pay before campaign creation
   - Fee is admin-controlled
   - Non-refundable (unless campaign rejected)

2. **Voting**
   - Only available for ACTIVE campaigns
   - Minimum 1 vote
   - Price per vote is admin-controlled
   - Payment via Paystack

3. **Goal Reached**
   - Automatic when: raisedAmount >= goalAmount
   - Voting immediately closes
   - Status changes to "goal_reached"
   - Artist can request withdrawal

4. **Withdrawal**
   - Only for goal_reached campaigns
   - Platform takes commission %
   - Requires admin approval
   - Transferred via Paystack

5. **Campaign Approval**
   - Admin must approve before going live
   - Can reject with reason
   - Rejected campaigns cannot accept votes

---

This architecture ensures a secure, scalable, and efficient music crowdfunding platform!
