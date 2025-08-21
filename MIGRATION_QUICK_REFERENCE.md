# Migration Quick Reference

## 🚀 Essential Migration Commands (Run in Order)

```bash
# 1. Setup database indexes for performance
node scripts/setup-transcriber-indexes.js

# 2. Migrate audio files from embedded to GridFS
node scripts/migrate-audio-to-gridfs.js

# 3. Verify migration success
node scripts/check-audio-storage.js

# 4. Test API endpoints
node scripts/test-api.js
```

## 📋 Pre-Migration Checklist
- [ ] Database backup created
- [ ] Environment variables set in production
- [ ] Application in maintenance mode

## ✅ Post-Migration Verification
- [ ] Main page loads transcriptions
- [ ] No console errors
- [ ] Audio playback works
- [ ] API returns `{transcriptions: [...], pagination: {...}}`

## 🚨 If Issues Occur
```bash
# Check database connection
node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"

# Check database structure
node scripts/check-transcriber-db.js

# Check user transcriptions
node scripts/check-transcription-users.js
```

## 📊 Expected Results
- **Before:** Large documents with embedded audio (slow queries)
- **After:** Small documents + GridFS audio (fast queries)
- **Performance:** 10-100x faster loading times
