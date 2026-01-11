# Firebase Database Verification Guide

## How to Verify Firebase is Working

### 1. Check Browser Console

1. Open your website: `https://woowfoods.netlify.app`
2. Press **F12** (or right-click → Inspect) to open Developer Tools
3. Go to the **Console** tab
4. Look for these messages:
   - ✅ `Firebase initialized successfully` - Firebase is connected
   - ✅ `Order saved successfully to Firebase: [ORDER_ID]` - Order was saved
   - ✅ `Generated order number: [ORDER_NUMBER]` - Order number generation working

### 2. Check Firebase Console (Real-time Data)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **wow-foods-5edc4**
3. Navigate to **Realtime Database** → **Data** tab
4. You should see a structure like this:

```
orders/
  ├── 20250115-000/
  │   ├── id: "20250115-000"
  │   ├── name: "John Doe"
  │   ├── email: "john@example.com"
  │   ├── phone: "+27123456789"
  │   ├── campus: "d6"
  │   ├── address: "Building A, Room 101"
  │   ├── items: [...]
  │   ├── subtotal: 45.00
  │   ├── deliveryFee: 25.00
  │   ├── total: 70.00
  │   ├── status: "pending"
  │   ├── date: "2025-01-15T10:30:00.000Z"
  │   ├── createdAt: "2025-01-15T10:30:00.000Z"
  │   └── updatedAt: "2025-01-15T10:30:00.000Z"
  ├── 20250115-001/
  │   └── ...
  └── 20250115-002/
      └── ...
```

### 3. Test Order Placement

1. Add items to cart
2. Go to checkout
3. Fill in the form
4. Place order
5. Check browser console for success messages
6. Check Firebase Console - you should see the new order appear in real-time

### 4. Verify Order Number Incrementing

**How it works:**

- Order numbers reset daily at midnight
- Format: `YYYYMMDD-XXX` (e.g., `20250115-000`, `20250115-001`)
- First order of the day: `000`
- Second order of the day: `001`
- Third order of the day: `002`
- And so on...

**To test:**

1. Place first order → Should get `20250115-000`
2. Place second order → Should get `20250115-001`
3. Place third order → Should get `20250115-002`
4. Check Firebase Console to see all orders with sequential numbers

## What Data is Stored in Firebase?

Each order contains:

### Customer Information

- `name` - Customer's full name
- `email` - Customer's email address
- `phone` - Customer's phone number
- `campus` - Selected campus (d6, mowbray, cape-town, etc.)
- `address` - Delivery/pickup address
- `specialInstructions` - Any special instructions

### Order Details

- `id` - Unique order number (e.g., "20250115-000")
- `items` - Array of ordered items with:
  - `id` - Product ID
  - `name` - Product name
  - `price` - Product price
  - `quantity` - Quantity ordered
- `subtotal` - Order subtotal (before delivery fee)
- `deliveryFee` - Delivery fee (0 if pickup or free delivery)
- `deliveryOption` - "pickup" or "delivery"
- `total` - Total order amount

### Order Status

- `status` - Current status:
  - `pending` - Awaiting payment verification
  - `verified` - Payment verified
  - `in_preparation` - Being prepared
  - `ready_for_collection` - Ready for pickup
  - `out_for_delivery` - On the way
  - `delivered` - Completed
- `verified` - Boolean (true if payment verified)
- `verifiedAt` - Timestamp when verified

### Payment Proof

- `proofOfPayment` - Base64 encoded image (if uploaded)
- `proofSubmitted` - Boolean
- `proofSubmittedAt` - Timestamp

### Timestamps

- `date` - Order creation date
- `createdAt` - When order was created
- `updatedAt` - Last update timestamp

## Troubleshooting

### If orders aren't appearing in Firebase:

1. **Check Database Rules:**

   - Go to Firebase Console → Realtime Database → Rules
   - Should have: `".read": true, ".write": true` under `orders`

2. **Check Browser Console:**

   - Look for error messages
   - Common errors:
     - `PERMISSION_DENIED` → Database rules issue
     - `UNAVAILABLE` → Network/Firebase issue
     - `Database not initialized` → Firebase config issue

3. **Check Network Tab:**

   - Open Developer Tools → Network tab
   - Filter by "firebase"
   - Look for failed requests (red)

4. **Verify Firebase Config:**
   - Check `src/config/firebase.js`
   - Ensure all credentials are correct
   - Check that database URL is correct

### If order numbers aren't incrementing:

1. Check browser console for:

   - `Generated order number: [NUMBER]`
   - `Orders from today: [COUNT]`
   - `Today's order IDs: [LIST]`

2. Verify orders are being saved with correct dates
3. Check that `date` or `createdAt` field exists in saved orders
4. Ensure timezone is correct (orders use UTC)

## Real-time Updates

Firebase automatically syncs data across all devices:

- When admin updates order status → User sees update immediately
- When user places order → Admin sees it immediately
- No page refresh needed!

## Security Note

For production, consider updating database rules to be more secure:

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
