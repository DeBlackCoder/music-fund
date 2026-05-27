# MusicFund API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/auth/register
```

**Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "artist",
  "artistName": "DJ John",
  "phone": "+2348012345678"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "artist",
      "artistName": "DJ John",
      "verified": false
    }
  }
}
```

### Login
```http
POST /api/auth/login
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "artist"
    }
  }
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "artist",
    "artistName": "DJ John",
    "followers": 150,
    "verified": false
  }
}
```

---

## ⚙️ Platform Settings

### Get Platform Settings (Public)
```http
GET /api/settings
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadFee": 2000,
    "votePrice": 100,
    "platformCommission": 10,
    "minGoalAmount": 50000,
    "maxGoalAmount": 10000000,
    "defaultCampaignDuration": 30
  }
}
```

### Update Platform Settings (Admin Only)
```http
PUT /api/settings
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "uploadFee": 2500,
  "votePrice": 150,
  "platformCommission": 12
}
```

---

## 💳 Upload Fee Payment

### Initialize Upload Fee Payment
```http
POST /api/upload-fee/initialize
Authorization: Bearer <artist_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionRef": "UPLOAD-1234567890-ABC123",
    "amount": 2000,
    "authorizationUrl": "https://checkout.paystack.com/...",
    "accessCode": "abc123xyz"
  }
}
```

### Verify Upload Fee Payment
```http
POST /api/upload-fee/verify
Authorization: Bearer <artist_token>
```

**Body:**
```json
{
  "reference": "UPLOAD-1234567890-ABC123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Upload fee payment verified successfully",
    "verified": true,
    "amount": 2000,
    "transactionRef": "UPLOAD-1234567890-ABC123"
  }
}
```

---

## 🎵 Campaign Endpoints

### Create Campaign
```http
POST /api/campaigns/create
Authorization: Bearer <artist_token>
```

**Body:**
```json
{
  "title": "My New Song",
  "genre": "Afrobeats",
  "description": "An amazing song about love",
  "story": "This song was inspired by...",
  "goalAmount": 500000,
  "deadline": "2024-12-31T23:59:59Z",
  "tags": ["afrobeats", "love", "dance"],
  "audioFile": "https://r2.dev/audio/song.mp3",
  "coverImage": "https://r2.dev/images/cover.jpg",
  "uploadFeeTransactionRef": "UPLOAD-1234567890-ABC123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Campaign created successfully. Waiting for admin approval.",
    "campaign": {
      "id": "507f1f77bcf86cd799439011",
      "slug": "abc123xyz",
      "title": "My New Song",
      "status": "pending",
      "referralLink": "https://musicfund.com/song/abc123xyz"
    }
  }
}
```

### List Campaigns
```http
GET /api/campaigns?status=active&genre=Afrobeats&limit=20&page=1&sort=-voteCount
```

**Query Parameters:**
- `status`: active | goal_reached | all (default: active)
- `genre`: Filter by genre
- `artistId`: Filter by artist
- `limit`: Results per page (default: 20)
- `page`: Page number (default: 1)
- `sort`: -createdAt | -voteCount | -raisedAmount

**Response:**
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "id": "507f1f77bcf86cd799439011",
        "slug": "abc123xyz",
        "title": "My New Song",
        "artist": {
          "id": "507f1f77bcf86cd799439012",
          "name": "John Doe",
          "artistName": "DJ John",
          "avatar": "https://...",
          "verified": false
        },
        "coverImage": "https://...",
        "genre": "Afrobeats",
        "goalAmount": 500000,
        "raisedAmount": 250000,
        "voteCount": 2500,
        "status": "active",
        "daysLeft": 15
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  }
}
```

### Get Campaign Details
```http
GET /api/campaigns/abc123xyz
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "slug": "abc123xyz",
    "title": "My New Song",
    "artist": {
      "id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "artistName": "DJ John",
      "avatar": "https://...",
      "verified": false,
      "bio": "Upcoming artist...",
      "followers": 150
    },
    "audioFile": "https://...",
    "coverImage": "https://...",
    "description": "An amazing song...",
    "goalAmount": 500000,
    "raisedAmount": 250000,
    "voteCount": 2500,
    "likeCount": 320,
    "status": "active",
    "daysLeft": 15,
    "topVoters": [
      {
        "userId": "...",
        "name": "Jane Doe",
        "avatar": "https://...",
        "totalVotes": 500,
        "totalAmount": 50000
      }
    ],
    "analytics": {
      "views": 1500,
      "clicks": 300,
      "uniqueVisitors": 800
    }
  }
}
```

### Like Campaign
```http
POST /api/campaigns/abc123xyz/like
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Campaign liked successfully",
    "liked": true,
    "likeCount": 321
  }
}
```

### Unlike Campaign
```http
DELETE /api/campaigns/abc123xyz/like
Authorization: Bearer <token>
```

---

## 🗳️ Voting Endpoints

### Initialize Vote Payment
```http
POST /api/vote/initialize
Authorization: Bearer <token>
```

**Body:**
```json
{
  "campaignId": "507f1f77bcf86cd799439011",
  "voteCount": 500
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionRef": "VOTE-1234567890-ABC123",
    "voteCount": 500,
    "votePrice": 100,
    "totalAmount": 50000,
    "authorizationUrl": "https://checkout.paystack.com/...",
    "accessCode": "abc123xyz"
  }
}
```

### Verify Vote Payment
```http
POST /api/vote/verify
Authorization: Bearer <token>
```

**Body:**
```json
{
  "reference": "VOTE-1234567890-ABC123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Vote verified and recorded successfully",
    "verified": true,
    "voteCount": 500,
    "amount": 50000,
    "goalReached": true
  }
}
```

---

## 👥 Follow System

### Follow Artist
```http
POST /api/follow/507f1f77bcf86cd799439012
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Successfully followed artist",
    "following": true
  }
}
```

### Unfollow Artist
```http
DELETE /api/follow/507f1f77bcf86cd799439012
Authorization: Bearer <token>
```

---

## 🔔 Notifications

### Get Notifications
```http
GET /api/notifications?unreadOnly=true&limit=20&page=1
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "...",
        "type": "new_vote",
        "title": "New Vote Received!",
        "message": "Jane Doe voted 100 times for your song",
        "read": false,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "unreadCount": 5,
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  }
}
```

### Mark Notification as Read
```http
PUT /api/notifications/507f1f77bcf86cd799439011/read
Authorization: Bearer <token>
```

### Mark All as Read
```http
PUT /api/notifications/mark-all-read
Authorization: Bearer <token>
```

---

## 💰 Withdrawal Endpoints

### Request Withdrawal (Artist)
```http
POST /api/withdrawal/request
Authorization: Bearer <artist_token>
```

**Body:**
```json
{
  "campaignId": "507f1f77bcf86cd799439011",
  "bankDetails": {
    "accountName": "John Doe",
    "accountNumber": "0123456789",
    "bankName": "GTBank",
    "bankCode": "058"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Withdrawal request submitted successfully",
    "withdrawal": {
      "id": "...",
      "amount": 500000,
      "platformCommission": 50000,
      "netAmount": 450000,
      "status": "pending"
    }
  }
}
```

---

## 👨‍💼 Admin Endpoints

### List All Campaigns (Admin)
```http
GET /api/admin/campaigns?status=pending&limit=50&page=1
Authorization: Bearer <admin_token>
```

### Approve Campaign
```http
POST /api/admin/campaigns/507f1f77bcf86cd799439011/approve
Authorization: Bearer <admin_token>
```

### Reject Campaign
```http
POST /api/admin/campaigns/507f1f77bcf86cd799439011/reject
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "reason": "Content does not meet our guidelines"
}
```

### List Withdrawals (Admin)
```http
GET /api/admin/withdrawals?status=pending
Authorization: Bearer <admin_token>
```

### Approve Withdrawal
```http
POST /api/admin/withdrawals/507f1f77bcf86cd799439011/approve
Authorization: Bearer <admin_token>
```

### Reject Withdrawal
```http
POST /api/admin/withdrawals/507f1f77bcf86cd799439011/reject
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "reason": "Invalid bank details"
}
```

### Get Platform Analytics
```http
GET /api/admin/analytics
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 5000,
      "totalArtists": 500,
      "totalFans": 4500,
      "totalCampaigns": 200,
      "activeCampaigns": 50,
      "totalVotes": 50000
    },
    "financial": {
      "totalRaised": 50000000,
      "platformEarnings": 5000000,
      "uploadFeesCollected": 400000,
      "totalRevenue": 5400000
    },
    "topArtists": [...],
    "charts": {
      "revenueByMonth": [...],
      "genreDistribution": [...]
    }
  }
}
```

---

## 🏆 Leaderboard

### Get Leaderboard
```http
GET /api/leaderboard?type=votes&period=weekly&limit=10
```

**Query Parameters:**
- `type`: votes | raised | followers | likes
- `period`: daily | weekly | monthly | all
- `limit`: Number of results (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "votes",
    "period": "weekly",
    "leaderboard": [
      {
        "rank": 1,
        "campaign": {
          "id": "...",
          "slug": "...",
          "title": "My Song",
          "coverImage": "https://..."
        },
        "artist": {
          "id": "...",
          "name": "John Doe",
          "artistName": "DJ John",
          "avatar": "https://...",
          "verified": false
        },
        "voteCount": 5000,
        "raisedAmount": 500000
      }
    ]
  }
}
```

---

## 📊 Artist Dashboard

### Get Artist Dashboard Stats
```http
GET /api/artist/dashboard
Authorization: Bearer <artist_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalCampaigns": 5,
      "activeCampaigns": 2,
      "goalReachedCampaigns": 2,
      "totalRaised": 1000000,
      "totalVotes": 10000,
      "totalWithdrawn": 800000,
      "followerCount": 150
    },
    "recentCampaigns": [...],
    "recentVotes": [...],
    "charts": {
      "monthlyEarnings": [...]
    }
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Rate Limiting

API rate limits (to be implemented):
- Public endpoints: 100 requests/minute
- Authenticated endpoints: 200 requests/minute
- Admin endpoints: 500 requests/minute
