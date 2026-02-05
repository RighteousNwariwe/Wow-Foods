import React, { useState, useEffect } from 'react';
import { menuService } from '../services/databaseService';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';
import './MenuManagement.css';

// Firebase Storage image functions
const uploadImageToFirebase = async (file, folder = 'menu-images') => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading image to Firebase:', error);
    throw error;
  }
};

const deleteImageFromFirebase = async (imageUrl) => {
  try {
    if (!imageUrl || imageUrl.includes('placeholder')) {
      return true;
    }

    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);

    return true;
  } catch (error) {
    console.error('Error deleting image from Firebase:', error);
    throw error;
  }
};

const updateImageInFirebase = async (oldImageUrl, newFile) => {
  try {
    // Delete old image if it exists
    if (oldImageUrl && !oldImageUrl.includes('placeholder')) {
      await deleteImageFromFirebase(oldImageUrl);
    }

    // Upload new image
    return await uploadImageToFirebase(newFile);
  } catch (error) {
    console.error('Error updating image in Firebase:', error);
    throw error;
  }
};

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

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'main',
    available: true,
    image: null,
    imagePreview: null,
    ingredients: '',
    preparationTime: '',
    spicy: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchMenuItems();

    // Set up real-time listener
    const unsubscribe = menuService.onMenuChange((items) => {
      setMenuItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const items = await menuService.getAllMenuItems();
      setMenuItems(items);

      // If no items exist, initialize with default items
      if (items.length === 0) {
        console.log('No menu items found. Initializing with default items...');
        for (const item of initialMenuItems) {
          await menuService.createMenuItem(item);
        }
        // Fetch again after initialization
        const initializedItems = await menuService.getAllMenuItems();
        setMenuItems(initializedItems);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.imagePreview || '';

      // Upload image to Firebase Storage if new image is provided
      if (formData.image) {
        if (editingItem && editingItem.imageUrl) {
          imageUrl = await updateImageInFirebase(editingItem.imageUrl, formData.image);
        } else {
          imageUrl = await uploadImageToFirebase(formData.image);
        }
      }

      const itemData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        available: formData.available,
        imageUrl: imageUrl,
        ingredients: formData.ingredients,
        preparationTime: formData.preparationTime,
        spicy: formData.spicy
      };

      if (editingItem) {
        await menuService.updateMenuItem(editingItem.id, itemData);
      } else {
        await menuService.createMenuItem(itemData);
      }

      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Error saving menu item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      available: item.available,
      image: null,
      imagePreview: item.imageUrl || null,
      ingredients: item.ingredients || '',
      preparationTime: item.preparationTime || '',
      spicy: item.spicy || false
    });
    setShowForm(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        // Delete image from Firebase Storage if it exists
        if (item.imageUrl && !item.imageUrl.includes('placeholder')) {
          await deleteImageFromFirebase(item.imageUrl);
        }

        await menuService.deleteMenuItem(item.id);
      } catch (error) {
        console.error('Error deleting menu item:', error);
        alert('Error deleting menu item. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'main',
      available: true,
      image: null,
      imagePreview: null,
      ingredients: '',
      preparationTime: '',
      spicy: false
    });
    setEditingItem(null);
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'appetizer', 'main', 'dessert', 'beverage', 'snack'];

  if (loading && menuItems.length === 0) {
    return (
      <div className="menu-management-loading">
        <div className="loading-spinner"></div>
        <p>Loading menu items...</p>
      </div>
    );
  }

  return (
    <div className="menu-management">
      <div className="menu-header">
        <h2>Menu Management</h2>
        <button
          className="btn-add-item"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <span>➕</span> Add New Item
        </button>
      </div>

      {/* Search and Filter */}
      <div className="menu-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="menu-grid">
        {filteredItems.map(item => (
          <div key={item.id} className={`menu-item-card ${!item.available ? 'unavailable' : ''}`}>
            <div className="item-image">
              <img
                src={item.imageUrl || '/placeholder-food.jpg'}
                alt={item.name}
                onError={(e) => {
                  e.target.src = '/placeholder-food.jpg';
                }}
              />
              {!item.available && <div className="unavailable-badge">Unavailable</div>}
            </div>
            <div className="item-details">
              <h3>{item.name}</h3>
              <p className="item-description">{item.description}</p>
              <div className="item-meta">
                <span className="price">R{item.price.toFixed(2)}</span>
                <span className="category">{item.category}</span>
                {item.spicy && <span className="spicy-badge">🌶️ Spicy</span>}
              </div>
              {item.preparationTime && (
                <div className="prep-time">⏱️ {item.preparationTime}</div>
              )}
              <div className="item-actions">
                <button
                  className="btn-edit"
                  onClick={() => handleEdit(item)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(item)}
                >
                  🗑️ Delete
                </button>
                <button
                  className={`btn-toggle ${item.available ? 'btn-disable' : 'btn-enable'}`}
                  onClick={() => handleEdit({ ...item, available: !item.available })}
                >
                  {item.available ? '🔒 Disable' : '✅ Enable'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="no-items">
          <p>No menu items found</p>
          <button onClick={() => setShowForm(true)}>Add your first item</button>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="menu-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Item Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  required
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="appetizer">Appetizer</option>
                    <option value="main">Main Course</option>
                    <option value="dessert">Dessert</option>
                    <option value="beverage">Beverage</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Preparation Time</label>
                  <input
                    type="text"
                    name="preparationTime"
                    value={formData.preparationTime}
                    onChange={handleInputChange}
                    placeholder="e.g., 15-20 mins"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Ingredients</label>
                <input
                  type="text"
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleInputChange}
                  placeholder="e.g., Chicken, Rice, Vegetables"
                />
              </div>

              <div className="form-group">
                <label>Item Image</label>
                <div className="image-upload">
                  {formData.imagePreview ? (
                    <div className="image-preview">
                      <img src={formData.imagePreview} alt="Preview" />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          image: null,
                          imagePreview: null
                        }))}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        id="image-upload"
                      />
                      <label htmlFor="image-upload">
                        📷 Click to upload image
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="available"
                      checked={formData.available}
                      onChange={handleInputChange}
                    />
                    Available for order
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="spicy"
                      checked={formData.spicy}
                      onChange={handleInputChange}
                    />
                    Spicy item
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? 'Saving...' : (editingItem ? 'Update Item' : 'Add Item')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
