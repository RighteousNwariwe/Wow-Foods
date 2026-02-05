// Script to initialize menu items
import { menuService } from '../services/databaseService';
import { uploadImage } from '../config/supabase';

const initialMenuItems = [
  {
    name: "Classic Burger",
    description: "Juicy beef patty with lettuce, tomato, onion, and our special sauce",
    price: 45.00,
    category: "main",
    available: true,
    ingredients: "Beef patty, lettuce, tomato, onion, special sauce, brioche bun",
    preparationTime: "15-20 mins",
    spicy: false
  },
  {
    name: "Chicken Wrap",
    description: "Grilled chicken wrapped in a soft tortilla with fresh vegetables",
    price: 35.00,
    category: "main",
    available: true,
    ingredients: "Grilled chicken, tortilla, lettuce, tomato, cucumber, mayo",
    preparationTime: "10-15 mins",
    spicy: false
  },
  {
    name: "Veggie Pizza",
    description: "Fresh vegetables on a crispy base with mozzarella cheese",
    price: 55.00,
    category: "main",
    available: true,
    ingredients: "Pizza dough, tomato sauce, mozzarella, bell peppers, mushrooms, olives",
    preparationTime: "20-25 mins",
    spicy: false
  },
  {
    name: "Spicy Chicken Wings",
    description: "Crispy chicken wings tossed in hot sauce",
    price: 40.00,
    category: "appetizer",
    available: true,
    ingredients: "Chicken wings, hot sauce, butter, spices",
    preparationTime: "15-20 mins",
    spicy: true
  },
  {
    name: "Caesar Salad",
    description: "Crisp romaine lettuce with caesar dressing and croutons",
    price: 30.00,
    category: "appetizer",
    available: true,
    ingredients: "Romaine lettuce, caesar dressing, croutons, parmesan cheese",
    preparationTime: "5-10 mins",
    spicy: false
  },
  {
    name: "Chocolate Brownie",
    description: "Rich chocolate brownie served warm with vanilla ice cream",
    price: 25.00,
    category: "dessert",
    available: true,
    ingredients: "Chocolate, flour, butter, sugar, eggs, vanilla ice cream",
    preparationTime: "5-10 mins",
    spicy: false
  },
  {
    name: "Fresh Orange Juice",
    description: "Freshly squeezed orange juice",
    price: 15.00,
    category: "beverage",
    available: true,
    ingredients: "Fresh oranges",
    preparationTime: "2-5 mins",
    spicy: false
  },
  {
    name: "French Fries",
    description: "Crispy golden french fries with salt",
    price: 20.00,
    category: "snack",
    available: true,
    ingredients: "Potatoes, salt, oil",
    preparationTime: "10-15 mins",
    spicy: false
  }
];

// Function to initialize menu items
export const initializeMenuItems = async () => {
  try {
    console.log('Initializing menu items...');
    
    for (const item of initialMenuItems) {
      await menuService.createMenuItem(item);
      console.log(`Created menu item: ${item.name}`);
    }
    
    console.log('Menu items initialized successfully!');
    return true;
  } catch (error) {
    console.error('Error initializing menu items:', error);
    return false;
  }
};

// Run this function to initialize the menu
// initializeMenuItems();
