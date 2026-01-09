# Woow Foods E-commerce Website

A modern React e-commerce website for Woow Foods, a restaurant serving healthy and affordable food to CPUT students and staff across Cape Town campuses.

## Features

- 🍔 **Product Catalog** - Browse menu items including kotas, vetkoeks, gatsbys, burgers, and beverages
- 🛒 **Shopping Cart** - Add items, adjust quantities, and manage your cart
- 💳 **Checkout Process** - Complete order form with delivery information
- 📦 **Order Confirmation** - Order summary and confirmation page
- 🎉 **Catering Services** - Request catering quotes for events
- ℹ️ **About Page** - Learn about Woow Foods' story and journey
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices

## Tech Stack

- **React 18** - UI library
- **React Router 6** - Routing
- **Vite** - Build tool and dev server
- **Context API** - State management for cart
- **CSS3** - Styling with modern design

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
woow-foods-ecommerce/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Header.jsx       # Navigation header
│   │   ├── Footer.jsx       # Site footer
│   │   ├── ProductCard.jsx  # Product display card
│   │   └── CartItem.jsx     # Cart item component
│   ├── pages/               # Page components
│   │   ├── Home.jsx         # Homepage
│   │   ├── Products.jsx     # Product listing page
│   │   ├── Cart.jsx         # Shopping cart page
│   │   ├── Checkout.jsx     # Checkout page
│   │   ├── OrderConfirmation.jsx  # Order confirmation
│   │   ├── Catering.jsx     # Catering services
│   │   └── About.jsx        # About page
│   ├── context/             # Context providers
│   │   └── CartContext.jsx  # Shopping cart state
│   ├── data/                # Data files
│   │   └── products.js      # Product data
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── index.html               # HTML template
├── package.json             # Dependencies
└── vite.config.js          # Vite configuration
```

## Features in Detail

### Shopping Cart
- Add/remove items
- Adjust quantities
- Real-time total calculation
- Free delivery for orders over R100
- Cart persistence (state managed in context)

### Checkout Process
- Form validation
- Delivery information collection
- Campus selection (CPUT locations)
- Special instructions support
- Order summary sidebar

### Product Catalog
- Category filtering (All Items, Meals, Beverages)
- Search functionality
- Responsive grid layout
- Product details and pricing

## Business Information

Woow Foods operates in:
- CPUT Cape Town Campus (7:30 AM - 7:30 PM)
- CPUT Bellville Campus
- CPUT D6 Campus

The business offers:
- Daily cafeteria operations
- Weekend catering services
- On-site staff for events
- Traditional Cape Town favorites

## Future Enhancements

Potential improvements for the future:
- Backend API integration
- Payment gateway integration
- User authentication
- Order tracking
- Email notifications
- Inventory management
- Admin dashboard
- Delivery tracking

## License

This project is created for Woow Foods business use.
