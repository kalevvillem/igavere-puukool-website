// ========================================
// IGAVERE PUUKOOL - MAIN JAVASCRIPT
// ========================================

// CART SYSTEM
let cart = [];

// Load cart from localStorage on page load
document.addEventListener('DOMContentLoaded', function() {
  loadCart();
  setActiveNavLink();
  if (document.querySelector('.plant-grid')) {
    loadPlants();
  }
});

// ========================================
// NAVIGATION
// ========================================

function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('nav a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// ========================================
// CART FUNCTIONS
// ========================================

function addToCart(plantId, plantName, plantSize, price) {
  const qtyInput = document.querySelector(`[data-plant-id="${plantId}"] .qty-value`);
  const quantity = parseInt(qtyInput.value) || 1;
  
  // Check if plant already in cart
  const existingItem = cart.find(item => item.id === plantId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: plantId,
      name: plantName,
      size: plantSize,
      price: price,
      quantity: quantity
    });
  }
  
  saveCart();
  updateCartDisplay();
  
  // Show feedback
  const btn = document.querySelector(`[data-plant-id="${plantId}"] .btn-add-cart`);
  const originalText = btn.innerText;
  btn.innerText = '✓ Lisatud!';
  setTimeout(() => {
    btn.innerText = originalText;
  }, 1000);
}

function removeFromCart(plantId) {
  cart = cart.filter(item => item.id !== plantId);
  saveCart();
  updateCartDisplay();
}

function updateCartQuantity(plantId, quantity) {
  const item = cart.find(item => item.id === plantId);
  if (item) {
    item.quantity = Math.max(1, quantity);
    saveCart();
    updateCartDisplay();
  }
}

function saveCart() {
  localStorage.setItem('igavere-cart', JSON.stringify(cart));
}

function loadCart() {
  const saved = localStorage.getItem('igavere-cart');
  cart = saved ? JSON.parse(saved) : [];
  updateCartDisplay();
}

function updateCartDisplay() {
  const cartContainer = document.getElementById('cart-floating');
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  
  if (!cartContainer) return;
  
  if (cart.length === 0) {
    cartContainer.classList.remove('active');
    return;
  }
  
  cartContainer.classList.add('active');
  
  let html = '';
  let total = 0;
  
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    
    html += `
      <div class="cart-item">
        <span class="cart-item-name">${item.name}</span>
        <span style="font-size: 0.8rem; color: #ccc;">${item.size}</span>
        <div class="cart-item-qty">
          <span>${item.quantity} tk × €${item.price.toFixed(2)}</span>
          <button onclick="removeFromCart('${item.id}')" style="background: rgba(255,255,255,0.2); border: none; color: white; cursor: pointer; padding: 2px 6px; border-radius: 3px;">X</button>
        </div>
      </div>
    `;
  });
  
  cartItems.innerHTML = html;
  cartTotal.innerHTML = `<strong>Kokku: €${total.toFixed(2)}</strong>`;
}

function clearCart() {
  if (confirm('Kas olete kindel, et soovite ostukorvi tühjendada?')) {
    cart = [];
    saveCart();
    updateCartDisplay();
  }
}

function openCheckoutForm() {
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.scrollIntoView({ behavior: 'smooth' });
    populateCartData();
  }
}

function populateCartData() {
  if (cart.length === 0) {
    alert('Ostukorv on tühi!');
    return;
  }
  
  let cartText = '';
  let total = 0;
  
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    cartText += `${item.name} (${item.size}): ${item.quantity} tk × €${item.price.toFixed(2)} = €${itemTotal.toFixed(2)}\n`;
  });
  
  cartText += `\nKokku: €${total.toFixed(2)}`;
  
  const messageField = document.getElementById('checkout-message');
  if (messageField) {
    messageField.value = cartText;
  }
}

function closeCart() {
  const cartContainer = document.getElementById('cart-floating');
  if (cartContainer) {
    cartContainer.classList.remove('active');
  }
}

// ========================================
// PLANT LOADING & FILTERING
// ========================================

let allPlants = [];

async function loadPlants() {
  try {
    const response = await fetch('/data/plants.json');
    const data = await response.json();
    allPlants = data.plants;
    renderPlants(allPlants);
    setupFilters();
  } catch (error) {
    console.error('Error loading plants:', error);
  }
}

function renderPlants(plants) {
  const grid = document.querySelector('.plant-grid');
  if (!grid) return;
  
  grid.innerHTML = plants.map(plant => `
    <div class="plant-card fade-in" data-plant-id="${plant.id}">
      ${plant.on_sale ? `<span class="plant-badge">PAKKUMINE</span>` : ''}
      <div class="plant-header">
        <img src="${plant.image}" alt="${plant.estonian_name}" class="plant-img" onerror="this.src='images/placeholder.jpg'">
      </div>
      <div class="plant-body">
        <h3 class="plant-name">${plant.estonian_name}</h3>
        <p class="plant-scientific">${plant.scientific_name}</p>
        <div class="plant-size">📏 ${plant.size}</div>
        
        <div class="plant-price-section">
          ${plant.on_sale ? `
            <span class="plant-price-old">€${plant.base_price.toFixed(2)}</span>
            <span class="plant-discount">-${Math.round((1 - plant.sale_price / plant.base_price) * 100)}%</span>
            <div class="plant-price">€${plant.sale_price.toFixed(2)}</div>
          ` : `
            <div class="plant-price">€${plant.base_price.toFixed(2)}</div>
          `}
          <div style="font-size: 0.85rem; margin-top: 0.5rem; color: #666;">
            ${plant.on_sale ? `Pakkumise hind. Tavahind €${plant.base_price.toFixed(2)}` : 'Kogusepõhised allahindlused'}
          </div>
        </div>
        
        <div class="qty-selector">
          <button onclick="decreaseQty('${plant.id}')">-</button>
          <input type="number" min="1" value="1" class="qty-value" id="qty-${plant.id}">
          <button onclick="increaseQty('${plant.id}')">+</button>
        </div>
        
        <div class="plant-buttons">
          <button class="btn btn-primary btn-small btn-add-cart" onclick="addToCart('${plant.id}', '${plant.estonian_name}', '${plant.size}', ${plant.on_sale ? plant.sale_price : plant.base_price})">
            + Lisa korvi
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function increaseQty(plantId) {
  const input = document.getElementById(`qty-${plantId}`);
  input.value = parseInt(input.value) + 1;
}

function decreaseQty(plantId) {
  const input = document.getElementById(`qty-${plantId}`);
  if (parseInt(input.value) > 1) {
    input.value = parseInt(input.value) - 1;
  }
}

function setupFilters() {
  const categories = [...new Set(allPlants.map(p => p.category))];
  const filterHTML = categories.map(cat => `
    <label>
      <input type="checkbox" value="${cat}" onchange="filterPlants()">
      ${getCategoryLabel(cat)}
    </label>
  `).join('<br>');
  
  const filterContainer = document.getElementById('plant-filters');
  if (filterContainer) {
    filterContainer.innerHTML = filterHTML;
  }
}

function filterPlants() {
  const selectedCategories = Array.from(document.querySelectorAll('#plant-filters input[type="checkbox"]:checked')).map(cb => cb.value);
  const searchTerm = document.getElementById('plant-search')?.value.toLowerCase() || '';
  
  let filtered = allPlants;
  
  if (selectedCategories.length > 0) {
    filtered = filtered.filter(plant => selectedCategories.includes(plant.category));
  }
  
  if (searchTerm) {
    filtered = filtered.filter(plant => 
      plant.estonian_name.toLowerCase().includes(searchTerm) ||
      plant.scientific_name.toLowerCase().includes(searchTerm)
    );
  }
  
  renderPlants(filtered);
}

function getCategoryLabel(cat) {
  const labels = {
    'põõsas': '🌿 Põõsad',
    'lehtpuu': '🌳 Lehtpuud',
    'okaspuu': '🌲 Okaspuud',
    'püsilill': '🌸 Püsililled'
  };
  return labels[cat] || cat;
}

// ========================================
// FORM SUBMISSION
// ========================================

function handleContactSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  
  // Convert to object
  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    message: formData.get('message')
  };
  
  // Create mailto link or submit via email service
  // For now, we'll use Formspree which is free
  // You can change this email in the form action
  
  alert('Aitäh! Teie päringu saatmine on alanud. Oodake...', 'success');
  form.submit();
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
