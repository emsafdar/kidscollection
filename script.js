// ===== script.js =====
// LittleSummer · Kids Store — Complete E-Commerce Logic

(function() {
  'use strict';

  // ---------- CLOUDINARY BASE (public demo) ----------
  const CLOUDINARY_BASE = 'https://res.cloudinary.com/demo/image/upload/w_500,h_500,c_fill,q_auto,f_auto/';

  // ---------- PRODUCT CATALOG ----------
  const PRODUCTS = [
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
  let cart = []; // each item: { id, name, price, image, color, size, quantity }
  let selectedProductId = null; // for detail view
  let selectedColor = '';
  let selectedSize = '';

  // DOM refs
  const productGrid = document.getElementById('productGrid');
  const detailPanel = document.getElementById('detailPanel');
  const detailContainer = document.getElementById('detailContainer');
  const orderPanel = document.getElementById('orderPanel');
  const cartSidebar = document.getElementById('cartSidebar');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartTotalPrice = document.getElementById('cartTotalPrice');
  const cartCountBadge = document.getElementById('cartCountBadge');
  const toast = document.getElementById('toast');

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
    return PRODUCTS.find(p => p.id === id);
  }

  // ---------- RENDER PRODUCTS ----------
  function renderProducts() {
    productGrid.innerHTML = PRODUCTS.map(p => {
      const imgUrl = `${CLOUDINARY_BASE}${p.image}.jpg`;
      return `
        <div class="product-card" data-id="${p.id}">
          <img class="product-img" src="${imgUrl}" alt="${p.name}" loading="lazy" onerror="this.src='${CLOUDINARY_BASE}kids/default.jpg'" />
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
          // Use first color and size as default for quick add
          const color = product.colors[0] || '#ccc';
          const size = product.sizes[0] || 'M';
          addToCart(product, color, size);
          showToast(`🛍️ ${product.name} added`);
        }
      });
    });
    // Click on card → open detail
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
    if (!product) return;
    selectedProductId = id;
    selectedColor = product.colors[0] || '#ccc';
    selectedSize = product.sizes[0] || 'M';

    // Hide other panels, show detail
    document.getElementById('productsSection').style.display = 'none';
    orderPanel.style.display = 'none';
    detailPanel.style.display = 'block';

    const imgUrl = `${CLOUDINARY_BASE}${product.image}.jpg`;
    detailContainer.innerHTML = `
      <img class="detail-img" src="${imgUrl}" alt="${product.name}" onerror="this.src='${CLOUDINARY_BASE}kids/default.jpg'" />
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

    // Color selection
    document.querySelectorAll('.color-swatch').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        el.classList.add('active');
        selectedColor = el.dataset.color;
      });
    });

    // Size selection
    document.querySelectorAll('.size-btn').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.size-btn').forEach(s => s.classList.remove('active'));
        el.classList.add('active');
        selectedSize = el.dataset.size;
      });
    });

    // Add from detail
    document.getElementById('detailAddBtn').addEventListener('click', () => {
      addToCart(product, selectedColor, selectedSize);
      showToast(`✅ ${product.name} (${selectedSize}, ${selectedColor}) added`);
    });

    // Close detail
    document.getElementById('backFromDetail').addEventListener('click', closeDetail);
  }

  function closeDetail() {
    detailPanel.style.display = 'none';
    document.getElementById('productsSection').style.display = 'block';
    selectedProductId = null;
  }

  // ---------- CART ----------
  function addToCart(product, color, size) {
    // Check if same product with same color & size exists → increase quantity
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
    updateCartUI();
  }

  function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
  }

  function clearCart() {
    cart = [];
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
    // Cart items list
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

    // Total & badge
    const total = getCartTotal();
    cartTotalPrice.textContent = formatPrice(total);
    const count = getTotalItems();
    cartCountBadge.textContent = count;
  }

  // ---------- ORDER / CHECKOUT ----------
  function openOrderPanel() {
    if (cart.length === 0) {
      showToast('🛒 Cart is empty. Add some items first!');
      return;
    }
    // Close cart sidebar
    cartSidebar.classList.remove('open');

    // Show order panel
    document.getElementById('productsSection').style.display = 'none';
    detailPanel.style.display = 'none';
    orderPanel.style.display = 'block';

    // Update order total
    document.getElementById('orderTotalDisplay').textContent = formatPrice(getCartTotal());

    // Pre-fill any previous values? Keep it clean.
    document.getElementById('orderForm').reset();
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
  }

  function closeOrderPanel() {
    orderPanel.style.display = 'none';
    document.getElementById('productsSection').style.display = 'block';
  }

  // ---------- FORM VALIDATION ----------
  function validateOrderForm() {
    let valid = true;
    const name = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();

    const nameError = document.getElementById('nameError');
    const phoneError = document.getElementById('phoneError');
    const addressError = document.getElementById('addressError');

    // Name
    if (name.length < 2) {
      nameError.textContent = 'Please enter full name (min 2 chars)';
      valid = false;
    } else {
      nameError.textContent = '';
    }

    // Phone (simple: at least 10 digits)
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      phoneError.textContent = 'Enter a valid phone number (at least 10 digits)';
      valid = false;
    } else {
      phoneError.textContent = '';
    }

    // Address
    if (address.length < 5) {
      addressError.textContent = 'Please enter a complete address';
      valid = false;
    } else {
      addressError.textContent = '';
    }

    return valid;
  }

  // ---------- PLACE ORDER ----------
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

    // Simulate order placement
    showToast(`✅ Order placed! ${name}, pay ${formatPrice(total)} on delivery. Thank you!`, 3500);

    // Clear cart & reset
    cart = [];
    updateCartUI();
    closeOrderPanel();
    // Also close detail if open
    detailPanel.style.display = 'none';
    document.getElementById('productsSection').style.display = 'block';

    // Log order (for demo)
    console.log('📦 ORDER:', { name, phone, address, notes, total, items: cart });
  }

  // ---------- EVENT BINDING ----------
  function init() {
    renderProducts();
    updateCartUI();

    // Cart toggle
    document.getElementById('cartToggleBtn').addEventListener('click', () => {
      cartSidebar.classList.toggle('open');
    });
    document.getElementById('closeCartBtn').addEventListener('click', () => {
      cartSidebar.classList.remove('open');
    });

    // Clear cart
    document.getElementById('clearCartBtn').addEventListener('click', clearCart);

    // Checkout → order panel
    document.getElementById('checkoutBtn').addEventListener('click', () => {
      cartSidebar.classList.remove('open');
      openOrderPanel();
    });

    // Back from order
    document.getElementById('backFromOrder').addEventListener('click', closeOrderPanel);

    // Order form submit
    document.getElementById('orderForm').addEventListener('submit', placeOrder);

    // Close cart on outside click (simple)
    document.addEventListener('click', (e) => {
      if (cartSidebar.classList.contains('open')) {
        if (!cartSidebar.contains(e.target) && e.target.id !== 'cartToggleBtn') {
          cartSidebar.classList.remove('open');
        }
      }
    });

    // Keyboard shortcuts: ESC to close cart
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        cartSidebar.classList.remove('open');
      }
    });

    // If detail is open and we click back from order, ensure detail is hidden
    // Already handled by closeOrderPanel
  }

  // Run when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
