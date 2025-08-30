# Admin Dashboard Guide

This guide explains how to set up and use the admin functionality for managing users, tokens, and payment issues.

## Features

### 🔐 Admin Authentication
- Only users with `isAdmin: true` can access admin features
- Admin status is checked on every API request
- Non-admin users are redirected to the home page

### 👥 User Management
- View all users in the system
- See user details including tokens, admin status, and account status
- Edit user information (name, tokens, admin status, active status)
- View user statistics (total transcriptions, completed transcriptions, tokens spent/earned)

### 📊 User Analytics
- View user's transcription history
- See spending history with detailed transaction logs
- Track token usage patterns
- Monitor user activity

### 💰 Token Management
- Directly modify user token balances
- Grant or deduct tokens as needed
- All token changes are logged in spending history
- Automatic balance updates

### 🚨 Payment Failure Handling
- Grant tokens to users when payment processing fails
- Document payment failure reasons
- Track Stripe session IDs for reference
- Maintain audit trail of compensation

## Setup Instructions

### 1. Set Up Your First Admin User

Run the admin setup script to make an existing user an admin:

```bash
# Make sure you're in the project root directory
cd /path/to/your/transcribe/project

# Run the setup script with your email
node scripts/setup-admin.js your-email@example.com
```

**Example:**
```bash
node scripts/setup-admin.js admin@mycompany.com
```

### 2. Access the Admin Dashboard

1. Sign in with your admin account
2. You'll see an "Admin" link in the header (shield icon)
3. Click the Admin link or navigate to `/admin`
4. The dashboard will load with all user management features

## Usage Guide

### Viewing Users

1. **User List**: The left sidebar shows all users with their basic information
2. **User Selection**: Click on any user to view detailed information
3. **User Status**: Look for admin badges and inactive status indicators

### Managing User Information

1. **Edit User Details**: Click on a user and modify their information in the form
2. **Token Management**: Change token balance directly
3. **Admin Status**: Toggle admin privileges for other users
4. **Account Status**: Activate/deactivate user accounts

### Handling Payment Failures

1. **Payment Failure Form**: Use the form at the bottom of the admin dashboard
2. **Required Fields**:
   - User ID (copy from user list)
   - Tokens to Grant (number of tokens to compensate)
   - Reason (description of the payment failure)
   - Stripe Session ID (optional, for reference)
3. **Submit**: Click "Grant Tokens for Payment Failure" to process

### User Analytics

When you select a user, you can see:

- **Statistics**: Total transcriptions, completion rate, token usage
- **Recent Transcriptions**: List of user's transcription history
- **Spending History**: Detailed log of all token transactions

## API Endpoints

### Admin Users
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/users/[id]` - Get specific user details (admin only)
- `PATCH /api/admin/users/[id]` - Update user information (admin only)

### Payment Failure Handling
- `POST /api/admin/payment-failure` - Grant tokens for payment failure (admin only)

## Security Considerations

### Admin Access Control
- Admin status is verified on every API request
- Non-admin users cannot access admin endpoints
- Admin status is stored in the database, not in session

### Token Management
- All token changes are logged in spending history
- Admin actions are tracked with descriptions
- Token balance updates are atomic operations

### Audit Trail
- All admin actions are logged
- Payment failure compensations are documented
- User changes are tracked with timestamps

## Troubleshooting

### "Admin access required" Error
- Make sure you've run the setup script with your email
- Verify your user has `isAdmin: true` in the database
- Check that you're signed in with the correct account

### User Not Found
- Verify the user ID is correct
- Check that the user exists in the database
- Ensure the user ID format is valid (24-character MongoDB ObjectId)

### Token Update Fails
- Check that the token amount is a valid number
- Verify the user exists and is active
- Look for any database connection issues

## Database Schema

### User Model Updates
```javascript
{
  // ... existing fields
  isAdmin: boolean,        // Admin privileges
  isActive: boolean,        // Account status
  // ... other fields
}
```

### Spending History Updates
```javascript
{
  // ... existing fields
  action: 'admin_token_grant' | 'admin_token_deduction' | 'payment_failure_compensation',
  // ... other fields
}
```

## Best Practices

### Admin Management
- Only grant admin access to trusted users
- Regularly review admin privileges
- Use admin features responsibly

### Token Management
- Document reasons for token grants/deductions
- Be consistent with compensation amounts
- Monitor token usage patterns

### Payment Failures
- Investigate payment failures thoroughly
- Grant appropriate compensation amounts
- Keep detailed records of all compensations

### Security
- Never share admin credentials
- Log out when finished with admin tasks
- Monitor admin activity regularly

## Support

If you encounter issues with the admin functionality:

1. Check the browser console for errors
2. Verify your admin status in the database
3. Ensure all API endpoints are accessible
4. Check the server logs for detailed error messages

For additional help, refer to the main application logs or contact your system administrator.
