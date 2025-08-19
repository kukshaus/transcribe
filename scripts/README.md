# Database Scripts

This directory contains utility scripts for database management.

## 🧹 Database Cleanup Script

**⚠️ DANGER: This script deletes ALL data from the database!**

### Files:
- `cleanup-database.js` - Node.js version (standalone)
- `cleanup-database.ts` - TypeScript version (uses project utilities)

### Usage:

```bash
# Show what will be deleted (safe - just shows info)
npm run db:cleanup

# Actually perform the cleanup (DESTRUCTIVE!)
npm run db:cleanup:confirm
```

### What gets deleted:
- 👥 **users** - All user accounts and profiles
- 📝 **transcriptions** - All transcription records
- 💰 **spendingHistory** - All token transaction records  
- 💳 **payments** - All payment and purchase records
- 👤 **anonymousUsers** - All anonymous session data

### Safety Features:
1. **Environment Check** - Only runs in development environments
2. **Production Protection** - Blocks execution against production databases
3. **Confirmation Required** - Must use `--confirm` flag to actually run
4. **URI Validation** - Checks for production-like keywords in database URI

### Environment Variables Required:
- `MONGODB_URI` - Your MongoDB connection string
- `NODE_ENV` - Must be: development, dev, local, or debug

### Example Output:
```
🧹 DATABASE CLEANUP SCRIPT
==================================================
📍 Environment: development
🔗 Database: transcriber

🗑️  Cleaning collection: users
   ✅ Deleted 5 documents
🗑️  Cleaning collection: transcriptions  
   ✅ Deleted 12 documents
🗑️  Cleaning collection: spendingHistory
   ✅ Deleted 25 documents

🎉 DATABASE CLEANUP COMPLETED!
📊 Total documents deleted: 42
```

### When to Use:
- 🧪 Testing new features
- 🐛 Debugging data-related issues  
- 🔄 Resetting development environment
- 🧹 Cleaning up test data

### When NOT to Use:
- ❌ **NEVER** on production databases
- ❌ **NEVER** on databases with important data
- ❌ **NEVER** without confirming you have backups

---

**Remember**: Once you run this script, all data is permanently deleted and cannot be recovered unless you have backups!
