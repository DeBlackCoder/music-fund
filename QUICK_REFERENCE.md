# Quick Reference Card

## 🚀 Getting Started

```bash
# 1. Navigate to project
cd my-studio

# 2. Create .env.local file
# Add your MONGODB_URI and other keys

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev

# 5. Open browser
# http://localhost:3000
```

## 🔑 Required Environment Variables

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/musicfund
JWT_SECRET=your-secret-key-minimum-32-characters
PAYSTACK_SECRET_KEY=sk_test_your_key
PAYSTACK_PUBLIC_KEY=pk_test_your_key
```

## 👥 User Roles & Access

| Role | Can Access |
|------|-----------|
| **Guest** | Home, Discover, Login, Signup |
| **Fan** | Home, Discover, Vote, Like, Follow |
| **Artist** | Home, Discover, Dashboard, Upload, Withdraw |
| **Admin** | Home, Discover, Admin Panel, Manage All |

## 📍 Important Routes

### Public
- `/` - Home page
- `/discover` - Browse campaigns
- `/song/[slug]` - Campaign details
- `/auth/login` - Login page
- `/auth/signup` - Signup page

### Protected (Requires Auth)
- `/dashboard` - Artist dashboard (artists only)
- `/upload` - Create campaign (artists only)
- `/admin` - Admin panel (admins only)
- `/admin/campaigns` - Manage campaigns (admins only)
- `/admin/withdrawals` - Manage withdrawals (admins only)
- `/admin/settings` - Platform settings (admins only)

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm start               # Start production server

# Type checking
npx tsc --noEmit        # Check TypeScript errors

# Database
# Connect via MongoDB Compass or Atlas web interface
```

## 🐛 Troubleshooting

### Can't connect to MongoDB
```bash
# Check .env.local file exists
# Verify MONGODB_URI is correct
# Restart dev server
```

### Authentication not working
```bash
# Clear localStorage: localStorage.clear()
# Check JWT_SECRET is set
# Verify user exists in database
```

### Navigation not updating
```bash
# Hard refresh: Ctrl+Shift+R
# Clear cache
# Check browser console for errors
```

## 📊 Admin Quick Actions

### Approve Campaign
1. Go to `/admin/campaigns`
2. Filter by "pending"
3. Click "Approve" button
4. Campaign becomes active

### Reject Campaign
1. Go to `/admin/campaigns`
2. Filter by "pending"
3. Click "Reject" button
4. Enter rejection reason
5. Click "Reject Campaign"

### Update Platform Settings
1. Go to `/admin/settings`
2. Update fees/limits
3. Click "Save Settings"

## 🎨 Component Usage

### VoteButton
```tsx
<VoteButton 
  campaignId="123"
  campaignSlug="my-song"
  campaignStatus="active"
  size="md"
  variant="accent"
/>
```

### SongCard
```tsx
<SongCard 
  song={songData}
  variant="default" // or "compact" or "featured"
/>
```

## 📱 API Quick Reference

### Authentication
```bash
POST /api/auth/register  # Register
POST /api/auth/login     # Login
GET  /api/auth/me        # Get current user
```

### Campaigns
```bash
GET  /api/campaigns           # List campaigns
GET  /api/campaigns/[slug]    # Get campaign
POST /api/campaigns/create    # Create campaign
```

### Admin
```bash
GET  /api/admin/analytics     # Get analytics
GET  /api/admin/campaigns     # List all campaigns
POST /api/admin/campaigns/[id]/approve  # Approve
POST /api/admin/campaigns/[id]/reject   # Reject
```

## 🎯 Testing Checklist

- [ ] Register new user
- [ ] Login successfully
- [ ] Navigation shows correct links
- [ ] Upload button visible (artists)
- [ ] Admin panel accessible (admins)
- [ ] Logout works
- [ ] Vote button works
- [ ] Campaign approval works (admin)

## 📚 Documentation Files

- `SETUP_GUIDE.md` - Detailed setup instructions
- `API_DOCUMENTATION.md` - Complete API reference
- `NAVBAR_AUTH_FIX.md` - Navigation details
- `ADMIN_DASHBOARD_COMPLETE.md` - Admin features
- `FINAL_CHANGES_SUMMARY.md` - All changes made

## 💡 Tips

1. **Always restart dev server** after changing `.env.local`
2. **Clear localStorage** if authentication seems stuck
3. **Check browser console** for error messages
4. **Use MongoDB Compass** for easy database management
5. **Test with different user roles** to verify access control

## 🆘 Need Help?

1. Check documentation files
2. Verify environment variables
3. Check MongoDB connection
4. Review browser console errors
5. Ensure dev server is running

---

**Status**: ✅ All systems operational
**Version**: 1.0.0
**Last Updated**: 2024
