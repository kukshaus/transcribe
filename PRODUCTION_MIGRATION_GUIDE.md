# Production Migration Guide

This guide outlines all the scripts that need to be run to migrate your transcription application to production, including the audio file migration from embedded storage to GridFS.

## 🚨 Pre-Migration Checklist

Before running any migration scripts, ensure:
- [ ] Database backup is created
- [ ] Application is in maintenance mode (if applicable)
- [ ] All environment variables are properly set in production
- [ ] MongoDB connection string points to production database

## 📋 Migration Scripts (Run in Order)

### 1. Database Index Setup
**Script:** `scripts/setup-transcriber-indexes.js`
**Purpose:** Creates performance indexes for faster queries
**What it does:**
- Creates compound indexes for `userId + createdAt` and `userFingerprint + createdAt`
- Adds indexes for `status`, `url`, and text search
- All indexes are created in background mode (non-blocking)

**Command:**
```bash
node scripts/setup-transcriber-indexes.js
```

**Expected Output:**
```
✓ Created index: userId_createdAt_desc
✓ Created index: userFingerprint_createdAt_desc
✓ Created index: status
✓ Created index: url
✓ Created index: content_text_search
🎉 Database indexes setup completed!
```

### 2. Audio File Migration to GridFS
**Script:** `scripts/migrate-audio-to-gridfs.js`
**Purpose:** Moves embedded audio files from transcription documents to GridFS storage
**What it does:**
- Finds all transcriptions with embedded `audioFile.data`
- Uploads audio files to GridFS
- Updates transcription documents with `gridfsId` and `storageType: 'gridfs'`
- Removes the large `audioFile.data` field
- Significantly reduces document size and improves query performance

**Command:**
```bash
node scripts/migrate-audio-to-gridfs.js
```

**Expected Output:**
```
Found 11 transcriptions with embedded audio files
✓ Migrated: audio_1755690660153.mp3 (6.4 MB)
✓ Migrated: audio_1755690660154.mp3 (5.2 MB)
...
🎉 Migration completed! 11 audio files moved to GridFS
```

### 3. Verification Scripts (Optional but Recommended)

#### A. Check Audio Storage Status
**Script:** `scripts/check-audio-storage.js`
**Purpose:** Verifies that audio files were properly migrated
**Command:**
```bash
node scripts/check-audio-storage.js
```

**Expected Output:**
```
📊 Audio Storage Summary:
- Total transcriptions: 11
- GridFS storage: 11
- Embedded storage: 0
- Missing audio: 0
```

#### B. Check Database Structure
**Script:** `scripts/check-transcriber-db.js`
**Purpose:** Verifies database collections and document structure
**Command:**
```bash
node scripts/check-transcriber-db.js
```

#### C. Check User Transcriptions
**Script:** `scripts/check-transcription-users.js`
**Purpose:** Lists all transcriptions grouped by user
**Command:**
```bash
node scripts/check-transcription-users.js
```

## 🔧 Post-Migration Verification

### 1. Test API Endpoints
**Script:** `scripts/test-api.js`
**Purpose:** Tests if the transcriptions API is working correctly
**Command:**
```bash
node scripts/test-api.js
```

**Expected Output:**
```
Testing transcriptions API...
Response status: 200
Response data structure: ['transcriptions', 'pagination']
Transcriptions count: 11
```

### 2. Manual Testing Checklist
- [ ] Main page loads transcriptions overview
- [ ] Individual transcription pages load correctly
- [ ] Audio playback works (streams from GridFS)
- [ ] No console errors in browser
- [ ] API responses have correct structure (`{transcriptions: [...], pagination: {...}}`)

## 🚀 Production Deployment Steps

### 1. Code Deployment
```bash
# Deploy your updated code to production
git push origin main
# or your deployment method
```

### 2. Environment Variables
Ensure these are set in production:
```env
MONGODB_URI=mongodb://your-production-connection-string
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.com
# ... other required env vars
```

### 3. Database Migration
```bash
# SSH to production server or run in production environment
cd /path/to/your/app

# Run migrations in order
node scripts/setup-transcriber-indexes.js
node scripts/migrate-audio-to-gridfs.js

# Verify migration
node scripts/check-audio-storage.js
```

### 4. Restart Application
```bash
# Restart your production application
npm run build
npm start
# or your production restart command
```

## 📊 Performance Improvements After Migration

- **Query Speed:** 10-100x faster due to smaller document sizes
- **Memory Usage:** Significantly reduced MongoDB memory footprint
- **Network Transfer:** Faster API responses due to projection optimization
- **Scalability:** Better performance with large numbers of transcriptions
- **Storage Efficiency:** GridFS handles large files more efficiently

## 🚨 Rollback Plan

If issues occur, you can rollback by:
1. Restoring database from backup
2. Reverting code changes
3. Running the old version without GridFS migration

## 📞 Troubleshooting

### Common Issues:
1. **"Index already exists" errors:** Safe to ignore, indexes are already created
2. **"MONGODB_URI: Not set"** errors:** Check environment variables
3. **"Cannot do exclusion on field data"** errors:** Migration already completed
4. **"hint provided does not correspond to existing index"** errors:** Run index setup script

### Debug Commands:
```bash
# Check MongoDB connection
node -e "require('dotenv').config({path:'.env.local'}); console.log(process.env.MONGODB_URI)"

# Check database collections
node scripts/check-transcriber-db.js

# Test API endpoint
curl http://localhost:3000/api/transcriptions
```

## 📝 Migration Log Template

Keep track of your migration:

```markdown
## Migration Log - [DATE]

### Pre-Migration
- [ ] Database backup created
- [ ] Environment variables verified
- [ ] Application in maintenance mode

### Migration Steps
- [ ] Indexes created: [TIME]
- [ ] Audio migration completed: [TIME]
- [ ] Verification scripts passed: [TIME]

### Post-Migration
- [ ] Application restarted: [TIME]
- [ ] API endpoints tested: [TIME]
- [ ] Manual testing completed: [TIME]

### Issues Encountered
- None / [List any issues]

### Migration Status: ✅ COMPLETED / ❌ FAILED
```

---

**⚠️ Important:** Always test migrations in a staging environment first before running in production!
