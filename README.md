# 🍔 Wow Foods - E-Commerce Platform

A **full-featured e-commerce web application** for a local fast-food restaurant expanding its digital presence across Cape Town. Built with modern web technologies, this platform demonstrates production-ready features including user authentication, real-time order management, payment processing, and an admin dashboard.

**Live Demo:** [https://wow-foods-5edc4.web.app/](https://wow-foods-5edc4.web.app/)

---

## ✨ Key Features

### 🛍️ Customer-Facing
- **Product Catalog** - Browse menu items with detailed descriptions and pricing
- **Shopping Cart** - Add/remove items with real-time cart updates
- **User Authentication** - Email/password and Google Sign-In integration
- **Secure Checkout** - Multi-step checkout process with order validation
- **Payment Processing** - Flexible payment methods with proof upload support
- **Order Tracking** - Real-time order status updates
- **User Profiles** - Personalized user profiles with order history
- **Catering Services** - Dedicated catering inquiries for bulk orders

### 👨‍💼 Admin Features
- **Admin Dashboard** - Comprehensive order management interface
- **Order Management** - View, update, and track all orders in real-time
- **Protected Routes** - Role-based access control for admin functionality
- **Real-Time Updates** - Live order status notifications

### 🎨 Technical Highlights
- **Responsive Design** - Mobile-first approach with CSS Grid and Flexbox
- **Modern UI/UX** - Clean, professional interface with brand consistency
- **Form Validation** - Client-side validation with user-friendly error handling
- **File Upload** - Support for payment proof and profile image uploads
- **Real-Time Database** - Firebase Realtime Database for instant updates

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|---------------|
| **Frontend** | React 18, React Router v6, JSX |
| **Styling** | CSS3 (Grid, Flexbox, Animations) |
| **Build Tool** | Vite (Lightning-fast builds) |
| **Backend & Auth** | Firebase (Authentication & Realtime Database) |
| **Storage** | Firebase Cloud Storage (Images & Payment Proofs) |
| **Hosting** | Firebase Hosting |

**Languages:** JavaScript (68.6%), CSS (29.3%), HTML (2.1%)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Firebase project credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/RighteousNwariwe/Wow-Foods.git
cd Wow-Foods

# Install dependencies
npm install

# Set up Firebase configuration
# Create src/config/firebase.js with your Firebase credentials

# Start development server
npm run dev
```

### Build for Production
```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
src/
├── components/        # Reusable React components
│   ├── Header.jsx
│   ├── Footer.jsx
│   └── ProtectedRoute.jsx
├── pages/            # Page components
│   ├── Home.jsx
│   ├── Products.jsx
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   ├── Payment.jsx
│   ├── OrderConfirmation.jsx
│   ├── Login.jsx
│   ├── Profile.jsx
│   ├── AdminDashboard.jsx
│   ├── TrackOrder.jsx
│   └── Catering.jsx
├── context/          # React Context for state management
│   ├── CartContext.jsx
│   └── AuthContext.jsx
├── services/         # Database and API services
│   └── databaseService.js
├── config/           # Configuration files
│   └── firebase.js
├── App.jsx
└── main.jsx
```

---

## 🎯 Core Functionality

### Authentication System
- Email/password authentication
- Google Sign-In integration
- User registration with profile creation
- Admin authentication with role-based access
- Persistent session management

### Shopping Cart
- Add/remove products
- Real-time cart state management
- Order total calculation
- Cart persistence across sessions

### Order Management
- Order creation with validation
- Real-time order tracking
- Payment proof submission
- Order confirmation notifications
- Admin order status updates

### Database Schema (Firebase Realtime Database)
```
├── users/          # User profiles and preferences
├── orders/         # Order records with status tracking
└── menu/           # Menu items and pricing
```

---

## 🔐 Security Features

- **Protected Routes** - Admin pages require authentication
- **Role-Based Access Control** - Different user types (customer, student, staff)
- **Firebase Authentication** - Secure user authentication
- **File Size Validation** - Prevents malicious file uploads
- **Input Validation** - Form validation on client-side

---

## 🎨 Design Highlights

- **Color Scheme**: Professional black, red (#DC2626), and gold (#FFD700)
- **Typography**: Clear hierarchy with font-weight variations
- **Responsive Layouts**: CSS Grid and Flexbox for all screen sizes
- **Interactive Elements**: Hover effects and smooth transitions
- **Accessibility**: Semantic HTML and proper ARIA labels

---

## 📊 Business Value

This project demonstrates:
- **Real-world e-commerce implementation** for a growing restaurant chain
- **Digital transformation** enabling online ordering and catering services
- **Scalability** - Architecture supports multi-branch expansion
- **Customer engagement** through personalized profiles and order tracking
- **Business intelligence** via admin dashboard and order analytics

---

## 🔄 Recent Updates

- ✅ Multi-step checkout process implementation
- ✅ Real-time order tracking system
- ✅ Admin dashboard with order management
- ✅ Payment proof upload feature
- ✅ Firebase hosting deployment

---

## 📈 Future Enhancements

- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] SMS order notifications
- [ ] Customer reviews and ratings
- [ ] Loyalty program system
- [ ] Analytics dashboard for business insights
- [ ] Mobile app (React Native)
- [ ] Advanced search and filtering
- [ ] Inventory management system

---

## 💡 Developer Skills Demonstrated

✓ **Frontend Development** - React hooks, context API, component composition  
✓ **State Management** - Context API for global state  
✓ **Routing** - React Router for multi-page navigation  
✓ **Firebase Integration** - Auth, Realtime Database, Cloud Storage  
✓ **Form Handling** - Complex forms with validation  
✓ **Responsive Design** - Mobile-first CSS approach  
✓ **Real-time Updates** - Firestore listeners for live data  
✓ **File Uploads** - Image and document handling  
✓ **Build Tools** - Vite configuration and optimization  
✓ **Version Control** - Git and GitHub workflows  

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request with improvements or bug fixes.

---

## 📧 Contact

**Developer:** [Righteous Nwariwe](https://github.com/RighteousNwariwe)  
**Live Website:** [Wow Foods](https://wow-foods-5edc4.web.app/)

---

**Thank you for checking out Wow Foods! 🚀**
