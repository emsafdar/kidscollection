// ===== script.js =====
// LittleSummer · Kids Store — Complete E-Commerce with Cloudinary & Admin

(function() {
  'use strict';

  // ---------- CLOUDINARY CONFIG ----------
  // Replace these with your own Cloudinary credentials
  const CLOUDINARY = {
    BASE_URL: 'https://res.cloudinary.com/demo/image/upload/',
    // For demo, we use 'demo' cloud. To use your own:
    // BASE_URL: 'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/',
    UPLOAD_URL: 'https://api.cloudinary.com/v1_1/demo/image/upload',
    UPLOAD_PRESET: 'ml_default' // Use unsigned upload preset
  };

  // ---------- DEFAULT PRODUCTS ----------
  const DEFAULT_PRODUCTS = [
    {
      id: 1,
      name: 'Graphic Dino T',
      category: 'T-Shirt',
      price: 1299,
      description: 'Soft cotton, playful dinosaur print. Perfect for summer adventures.',
      image: 'kids/summer/t-shirt-dino',
      colors: ['#f3a683', '#f7dc6f', '#82ccdd', '#e77f67'],
      sizes: ['XS', 'S', 'M', 'L', 'XL']
    },
    {
      id: 2,
      name: 'Striped Sailor Tee',
      category: 'T-Shirt',
      price: 1199,
      description: 'Classic navy stripes, breathable fabric. A timeless summer staple.',
      image: 'kids/summer/striped-sailor',
      colors: ['#2c3e50', '#e74c3c', '#ecf0f1'],
      sizes: ['S', 'M', 'L', 'XL']
    },
    {
      id: 3,
      name: 'Cargo Denim Jeans',
      category: 'Jeans',
      price: 1899,
      description: 'Sturdy denim with cargo pockets. Durable and stylish for active kids.',
      image: 'kids/summer/cargo-jeans',
      colors: ['#5d6d7e', '#2c3e50', '#7f8c8d'],
      sizes: ['XS', 'S', 'M', 'L']
    },
    {
      id: 4,
      name: 'Lightweight Chino',
      category: 'Trousers',
      price: 1599,
      description: 'Light chino fabric, perfect for warm days. Comfortable and neat.',
      image: 'kids/summer/light-chino',
      colors: ['#d4ac0d', '#5d6d7e', '#aab7b8'],
      sizes: ['S', 'M', 'L', 'XL']
    },
    {
      id: 5,
      name: 'Palm Print Shirt',
      category: 'T-Shirt',
      price: 1349,
      description: 'Tropical palm print, 100% combed cotton. Fun and fresh.',
      image: 'kids/summer/palm-print',
      colors: ['#2ecc71', '#f39c12', '#e67e22'],
      sizes: ['XS', 'S', 'M', 'L']
    },
    {
      id: 6,
      name: 'Classic Blue Jeans',
      category: 'Jeans',
      price: 1699,
      description: 'Regular fit, classic blue denim. Everyday essential.',
      image: 'kids/summer/blue-jeans',
      colors: ['#2980b9', '#2c3e50', '#34495e'],
      sizes: ['S', 'M', 'L', 'XL']
    },
    {
      id: 7,
      name: 'Linen Blend Trousers',
      category: 'Trousers',
      price: 1499,
      description: 'Breathable linen-cotton blend. Light and airy for summer.',
      image: 'kids/summer/linen-trousers',
      colors: ['#f5cba7', '#d5dbdb', '#aeb6bf'],
      sizes: ['XS', 'S', 'M', 'L']
    },
    {
      id: 8,
      name: 'Colorblock Tee',
      category: 'T-Shirt',
      price: 1099,
      description: 'Bold colorblock design, soft jersey. Makes a statement.',
      image: 'kids/summer/colorblock-tee',
      colors: ['#e74c3c', '#3498db', '#f1c40f', '#2ecc71'],
      sizes: ['S', 'M', 'L', 'XL']
    }
  ];

  // ---------- STATE ----------
  let products = [];
  let cart = [];
  let nextProductId = 100;
  let selectedProductId = null;
  let selectedColor = '';
  let selectedSize = '';
  let isEditing = false;

  // DOM refs
  const productGrid = document.getElementById('productGrid');
  const detailPanel = document.getElementById('detailPanel');
  const detailContainer = document.getElementById('detailContainer');
  const orderPanel = document.getElementById('orderPanel');
  const adminPanel = document.getElementById('adminPanel');
  const cartSidebar = document.getElementById('cartSidebar');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartTotalPrice = document.getElementById('cartTotalPrice');
  const cartCountBadge = document.getElementById('cartCountBadge');
  const toast = document.getElementById('toast');
  const adminProductList = document.getElementById('adminProductList');

  // ---------- HELPERS ----------
  function showToast(msg, duration = 2200) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
  }

  function formatPrice(amount) {
    return '₨ ' + amount;
  }

  function getProductById(id) {
    return products.find(p => p.id === id);
  }

  function getImageUrl(imagePath) {
    return `${CLOUDINARY.BASE_URL}${imagePath}.jpg`;
  }

  // ---------- LOCAL STORAGE ----------
  function saveProducts() {
    localStorage.setItem('littleSummer_products', JSON.stringify(products));
  }

  function loadProducts() {
    const saved = localStorage.getItem('littleSummer_products');
    if (saved) {
      try {
        products = JSON.parse(saved);
        // Ensure we have valid data
        if (!products || !Array.isArray(products) || products.length === 0) {
          products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
        }
      } catch (e) {
        products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
      }
    } else {
      products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
    }
    // Set next ID
    const maxId = products.reduce((max, p) => Math.max(max, p.id), 0);
    nextProductId = maxId + 1;
    saveProducts();
  }

  function saveCart() {
    localStorage.setItem('littleSummer_cart', JSON.stringify(cart));
  }

  function loadCart() {
    const saved = localStorage.getItem('littleSummer_cart');
    if (saved) {
      try {
        cart = JSON.parse(saved);
        if (!Array.isArray(cart)) cart = [];
      } catch (e) {
        cart = [];
      }
    } else {
      cart = [];
    }
  }

  // ---------- RENDER PRODUCTS ----------
  function renderProducts() {
    if (!productGrid) return;
    
    if (products.length === 0) {
      productGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #7d8d92;">
          <i class="fas fa-box-open" style="font-size: 3rem; display: block; margin-bottom: 1rem;"></i>
          No products available. Add some from the admin panel!
        </div>
      `;
      return;
    }

    productGrid.innerHTML = products.map(p => {
      const imgUrl = getImageUrl(p.image);
      return `
        <div class="product-card" data-id="${p.id}">
          <img class="product-img" src="${imgUrl}" alt="${p.name}" loading="lazy" 
               onerror="this.src='https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,q_auto,f_auto/kids/default.jpg'" />
          <div class="product-name">${p.name}</div>
          <div class="product-category">${p.category}</div>
          <div class="product-price">${formatPrice(p.price)}</div>
          <div class="product-actions">
            <button class="detail-btn" data-id="${p.id}"><i class="fas fa-eye"></i> View</button>
            <button class="add-btn" data-id="${p.id}"><i class="fas fa-plus-circle"></i> Add</button>
          </div>
        </div>
      `;
    }).join('');

    // Attach events
    document.querySelectorAll('.detail-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id, 10);
        openDetail(id);
      });
    });
    document.querySelectorAll('.add-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id, 10);
        const product = getProductById(id);
        if (product) {
          const color = product.colors[0] || '#ccc';
          const size = product.sizes[0] || 'M';
          addToCart(product, color, size);
          showToast(`🛍️ ${product.name} added`);
        }
      });
    });
    document.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.id, 10);
        openDetail(id);
      });
    });
  }

  // ---------- DETAIL VIEW ----------
  function openDetail(id) {
    const product = getProductById(id);
    if (!product) {
      showToast('Product not found');
      return;
    }
    selectedProductId = id;
    selectedColor = product.colors[0] || '#ccc';
    selectedSize = product.sizes[0] || 'M';

    document.getElementById('productsSection').style.display = 'none';
    orderPanel.style.display = 'none';
    adminPanel.style.display = 'none';
    detailPanel.style.display = 'block';

    const imgUrl = getImageUrl(product.image);
    detailContainer.innerHTML = `
      <img class="detail-img" src="${imgUrl}" alt="${product.name}" 
           onerror="this.src='https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,q_auto,f_auto/kids/default.jpg'" />
      <div class="detail-info">
        <h2>${product.name}</h2>
        <div class="detail-category">${product.category}</div>
        <div class="detail-price">${formatPrice(product.price)}</div>
        <p style="color: #4d5e63; margin-bottom: 1rem;">${product.description}</p>

        <div class="detail-colors">
          <label>Color</label>
          <div class="color-options" id="colorOptions">
            ${product.colors.map(c => `
              <div class="color-swatch ${c === selectedColor ? 'active' : ''}" 
                   style="background: ${c};" data-color="${c}"></div>
            `).join('')}
          </div>
        </div>

        <div class="detail-sizes">
          <label>Size</label>
          <div class="size-options" id="sizeOptions">
            ${product.sizes.map(s => `
              <button class="size-btn ${s === selectedSize ? 'active' : ''}" data-size="${s}">${s}</button>
            `).join('')}
          </div>
        </div>

        <button class="detail-add-btn" id="detailAddBtn">
          <i class="fas fa-shopping-bag"></i> Add to bag — ${formatPrice(product.price)}
        </button>
      </div>
    `;

    document.querySelectorAll('.color-swatch').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        el.classList.add('active');
        selectedColor = el.dataset.color;
      });
    });

    document.querySelectorAll('.size-btn').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.size-btn').forEach(s => s.classList.remove('active'));
        el.classList.add('active');
        selectedSize = el.dataset.size;
      });
    });

    document.getElementById('detailAddBtn').addEventListener('click', () => {
      addToCart(product, selectedColor, selectedSize);
      showToast(`✅ ${product.name} (${selectedSize}, ${selectedColor}) added`);
    });

    document.getElementById('backFromDetail').addEventListener('click', closeDetail);
  }

  function closeDetail() {
    detailPanel.style.display = 'none';
    document.getElementById('productsSection').style.display = 'block';
    selectedProductId = null;
  }

  // ---------- CART ----------
  function addToCart(product, color, size) {
    const existing = cart.find(item => 
      item.id === product.id && item.color === color && item.size === size
    );
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        color: color,
        size: size,
        quantity: 1
      });
    }
    saveCart();
    updateCartUI();
  }

  function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
  }

  function clearCart() {
    cart = [];
    saveCart();
    updateCartUI();
    showToast('🗑️ Cart cleared');
  }

  function getCartTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  function getTotalItems() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function updateCartUI() {
    if (cart.length === 0) {
      cartItemsList.innerHTML = `<div class="empty-cart-msg">🛒 Cart is empty</div>`;
    } else {
      cartItemsList.innerHTML = cart.map((item, idx) => `
        <div class="cart-item">
          <div class="item-info">
            <span class="item-name">${item.name}</span>
            <span class="item-meta">${item.color} · ${item.size} × ${item.quantity}</span>
          </div>
          <span class="item-price">${formatPrice(item.price * item.quantity)}</span>
          <button class="remove-item" data-index="${idx}"><i class="fas fa-times"></i></button>
        </div>
      `).join('');

      document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.index, 10);
          removeFromCart(idx);
          showToast('🗑️ Item removed');
        });
      });
    }

    const total = getCartTotal();
    cartTotalPrice.textContent = formatPrice(total);
    const count = getTotalItems();
    cartCountBadge.textContent = count;
  }

  // ---------- ORDER ----------
  function openOrderPanel() {
    if (cart.length === 0) {
      showToast('🛒 Cart is empty. Add some items first!');
      return;
    }
    cartSidebar.classList.remove('open');
    document.getElementById('productsSection').style.display = 'none';
    detailPanel.style.display = 'none';
    adminPanel.style.display = 'none';
    orderPanel.style.display = 'block';
    document.getElementById('orderTotalDisplay').textContent = formatPrice(getCartTotal());
    document.getElementById('orderForm').reset();
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
  }

  function closeOrderPanel() {
    orderPanel.style.display = 'none';
    document.getElementById('productsSection').style.display = 'block';
  }

  function validateOrderForm() {
    let valid = true;
    const name = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();

    const nameError = document.getElementById('nameError');
    const phoneError = document.getElementById('phoneError');
    const addressError = document.getElementById('addressError');

    if (name.length < 2) {
      nameError.textContent = 'Please enter full name (min 2 chars)';
      valid = false;
    } else {
      nameError.textContent = '';
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      phoneError.textContent = 'Enter a valid phone number (at least 10 digits)';
      valid = false;
    } else {
      phoneError.textContent = '';
    }

    if (address.length < 5) {
      addressError.textContent = 'Please enter a complete address';
      valid = false;
    } else {
      addressError.textContent = '';
    }

    return valid;
  }

  function placeOrder(e) {
    e.preventDefault();
    if (!validateOrderForm()) {
      showToast('⚠️ Please fix errors in the form');
      return;
    }

    const name = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const notes = document.getElementById('orderNotes').value.trim();
    const total = getCartTotal();

    // Save order to history
    const order = {
      id: Date.now(),
      date: new Date().toISOString(),
      customer: { name, phone, address, notes },
      items: JSON.parse(JSON.stringify(cart)),
      total: total,
      status: 'pending'
    };
    
    const orders = JSON.parse(localStorage.getItem('littleSummer_orders') || '[]');
    orders.push(order);
    localStorage.setItem('littleSummer_orders', JSON.stringify(orders));

    showToast(`✅ Order placed! ${name}, pay ${formatPrice(total)} on delivery. Thank you!`, 3500);
    
    cart = [];
    saveCart();
    updateCartUI();
    closeOrderPanel();
    detailPanel.style.display = 'none';
    document.getElementById('productsSection').style.display = 'block';
  }

  // ---------- ADMIN ----------
  function openAdminPanel() {
    document.getElementById('productsSection').style.display = 'none';
    detailPanel.style.display = 'none';
    orderPanel.style.display = 'none';
    adminPanel.style.display = 'block';
    renderAdminProductList();
    resetAdminForm();
  }

  function closeAdminPanel() {
    adminPanel.style.display = 'none';
    document.getElementById('productsSection').style.display = 'block';
    resetAdminForm();
  }

  function renderAdminProductList() {
    if (products.length === 0) {
      adminProductList.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #7d8d92;">
          No products yet. Add your first product above!
        </div>
      `;
      return;
    }

    adminProductList.innerHTML = products.map(p => `
      <div class="admin-product-item">
        <div class="admin-item-info">
          <img src="${getImageUrl(p.image)}" alt="${p.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 12px;" 
               onerror="this.src='https://res.cloudinary.com/demo/image/upload/w_50,h_50,c_fill,q_auto,f_auto/kids/default.jpg'" />
          <div>
            <strong>${p.name}</strong>
            <span style="color: #7d8d92; font-size: 0.85rem; margin-left: 0.5rem;">${p.category}</span>
            <span style="font-weight: 600; margin-left: 0.5rem;">${formatPrice(p.price)}</span>
          </div>
        </div>
        <div class="admin-item-actions">
          <button class="edit-product-btn" data-id="${p.id}"><i class="fas fa-edit"></i> Edit</button>
          <button class="delete-product-btn" data-id="${p.id}"><i class="fas fa-trash"></i> Delete</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.edit-product-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        loadProductForEdit(id);
      });
    });

    document.querySelectorAll('.delete-product-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        if (confirm('Are you sure you want to delete this product?')) {
          deleteProduct(id);
        }
      });
    });
  }

  function resetAdminForm() {
    document.getElementById('adminFormTitle').textContent = 'Add New Product';
    document.getElementById('editProductId').value = '';
    document.getElementById('prodName').value = '';
    document.getElementById('prodCategory').value = 'T-Shirt';
    document.getElementById('prodPrice').value = '';
    document.getElementById('prodImage').value = '';
    document.getElementById('prodDescription').value = '';
    document.getElementById('prodColors').value = '';
    document.getElementById('prodSizes').value = '';
    isEditing = false;
    document.querySelector('.cancel-edit-btn').style.display = 'none';
  }

  function loadProductForEdit(id) {
    const product = getProductById(id);
    if (!product) return;

    isEditing = true;
    document.getElementById('adminFormTitle').textContent = 'Edit Product';
    document.getElementById('editProductId').value = product.id;
    document.getElementById('prodName').value = product.name;
    document.getElementById('prodCategory').value = product.category;
    document.getElementById('prodPrice').value = product.price;
    document.getElementById('prodImage').value = product.image;
    document.getElementById('prodDescription').value = product.description;
    document.getElementById('prodColors').value = product.colors.join(', ');
    document.getElementById('prodSizes').value = product.sizes.join(', ');
    document.querySelector('.cancel-edit-btn').style.display = 'inline-block';
    
    // Scroll to form
    document.querySelector('.admin-form-container').scrollIntoView({ behavior: 'smooth' });
  }

  function saveProductFromForm(e) {
    e.preventDefault();
    
    const name = document.getElementById('prodName').value.trim();
    const category = document.getElementById('prodCategory').value;
    const price = parseInt(document.getElementById('prodPrice').value);
    const image = document.getElementById('prodImage').value.trim();
    const description = document.getElementById('prodDescription').value.trim();
    const colorsStr = document.getElementById('prodColors').value.trim();
    const sizesStr = document.getElementById('prodSizes').value.trim();

    // Validation
    if (!name || !price || !image || !description || !colorsStr || !sizesStr) {
      showToast('⚠️ Please fill in all fields');
      return;
    }

    const colors = colorsStr.split(',').map(c => c.trim()).filter(c => c);
    const sizes = sizesStr.split(',').map(s => s.trim()).filter(s => s);

    if (colors.length === 0 || sizes.length === 0) {
      showToast('⚠️ Please enter at least one color and size');
      return;
    }

    const editId = document.getElementById('editProductId').value;
    
    if (editId) {
      // Edit existing
      const index = products.findIndex(p => p.id === parseInt(editId));
      if (index !== -1) {
        products[index] = {
          ...products[index],
          name,
          category,
          price,
          image,
          description,
          colors,
          sizes
        };
        showToast('✅ Product updated successfully!');
      }
    } else {
      // Add new
      const newProduct = {
        id: nextProductId++,
        name,
        category,
        price,
        image,
        description,
        colors,
        sizes
      };
      products.push(newProduct);
      showToast('✅ Product added successfully!');
    }

    saveProducts();
    renderProducts();
    renderAdminProductList();
    resetAdminForm();
  }

  function deleteProduct(id) {
    products = products.filter(p => p.id !== id);
    saveProducts();
    renderProducts();
    renderAdminProductList();
    showToast('🗑️ Product deleted');
  }

  // ---------- CLOUDINARY IMAGE UPLOAD ----------
  async function uploadImageToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY.UPLOAD_PRESET);

    try {
      const response = await fetch(CLOUDINARY.UPLOAD_URL, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.public_id) {
        return data.public_id;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      showToast('⚠️ Image upload failed. Please try again.');
      return null;
    }
  }

  // Add image upload functionality to admin form
  function setupImageUpload() {
    const imageInput = document.getElementById('prodImage');
    const uploadBtn = document.createElement('button');
    uploadBtn.type = 'button';
    uploadBtn.className = 'upload-image-btn';
    uploadBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Upload Image';
    uploadBtn.style.cssText = `
      background: #e07c3c;
      color: white;
      border: none;
      padding: 0.5rem 1.2rem;
      border-radius: 60px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 0.5rem;
      display: inline-block;
    `;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      showToast('⏳ Uploading image...');
      const publicId = await uploadImageToCloudinary(file);
      if (publicId) {
        document.getElementById('prodImage').value = publicId;
        showToast('✅ Image uploaded! Public ID added.');
      }
      fileInput.value = '';
    });

    const parent = imageInput.parentElement;
    parent.appendChild(fileInput);
    parent.appendChild(uploadBtn);
  }

  // ---------- INIT ----------
  function init() {
    loadProducts();
    loadCart();
    renderProducts();
    updateCartUI();
    setupImageUpload();

    // Cart toggle
    document.getElementById('cartToggleBtn').addEventListener('click', () => {
      cartSidebar.classList.toggle('open');
    });
    document.getElementById('closeCartBtn').addEventListener('click', () => {
      cartSidebar.classList.remove('open');
    });

    // Clear cart
    document.getElementById('clearCartBtn').addEventListener('click', clearCart);

    // Checkout
    document.getElementById('checkoutBtn').addEventListener('click', () => {
      cartSidebar.classList.remove('open');
      openOrderPanel();
    });

    // Back from order
    document.getElementById('backFromOrder').addEventListener('click', closeOrderPanel);

    // Order form submit
    document.getElementById('orderForm').addEventListener('submit', placeOrder);

    // Admin toggle
    document.getElementById('adminToggle').addEventListener('click', () => {
      if (adminPanel.style.display === 'block') {
        closeAdminPanel();
      } else {
        openAdminPanel();
      }
    });
    document.getElementById('backFromAdmin').addEventListener('click', closeAdminPanel);

    // Admin form submit
    document.getElementById('adminProductForm').addEventListener('submit', saveProductFromForm);
    document.getElementById('cancelEdit').addEventListener('click', resetAdminForm);

    // Close cart on outside click
    document.addEventListener('click', (e) => {
      if (cartSidebar.classList.contains('open')) {
        if (!cartSidebar.contains(e.target) && e.target.id !== 'cartToggleBtn') {
          cartSidebar.classList.remove('open');
        }
      }
    });

    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        cartSidebar.classList.remove('open');
        if (adminPanel.style.display === 'block') closeAdminPanel();
        if (detailPanel.style.display === 'block') closeDetail();
        if (orderPanel.style.display === 'block') closeOrderPanel();
      }
    });

    console.log('🛍️ LittleSummer Store initialized!');
    console.log('📦 Products:', products.length);
    console.log('🛒 Cart items:', cart.length);
  }

  // Run
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
