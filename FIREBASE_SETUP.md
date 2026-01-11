# Firebase Database Rules Setup

## Important: Database Rules Configuration

For the order placement to work, you need to configure Firebase Realtime Database rules to allow read and write access.

### Steps to Fix Database Rules:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `wow-foods-5edc4`
3. Navigate to **Realtime Database** → **Rules**
4. Update the rules to allow read/write access:

```json
{
  "rules": {
    "orders": {
      ".read": true,
      ".write": true
    }
  }
}
```

**For Production (More Secure):**

```json
{
  "rules": {
    "orders": {
      ".read": true,
      ".write": true,
      "$orderId": {
        ".validate": "newData.hasChildren(['id', 'items', 'total', 'date', 'status'])"
      }
    }
  }
}
```

### Testing Rules:

After updating the rules, try placing an order again. The error should be resolved.

### Common Error Codes:

- **PERMISSION_DENIED**: Database rules are blocking the operation
- **UNAVAILABLE**: Database is temporarily unavailable or network issue
- **DISCONNECTED**: No internet connection

If you continue to see errors, check the browser console (F12) for detailed error messages.
