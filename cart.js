// 1. Initial Authentication and Page Load Check
document.addEventListener("DOMContentLoaded", () => {
  fetch('user-info.php')
    .then(res => res.json())
    .then(data => {
      window.__userLoggedIn = !!data.logged_in;
      renderNavbarUserState(data);
      checkCartAccess();
    });
});

// Manage Navbar State (Login/Logout buttons)
function renderNavbarUserState(data) {
  const actions = document.getElementById('nav-auth-actions');
  if (!actions) return;

  if (data.logged_in) {
    actions.innerHTML = `
      <a href="orders.html" class="nav-icon-link"><i class="fas fa-box"></i></a>
      <a href="cart.html" class="nav-icon-link active"><i class="fas fa-shopping-cart"></i></a>
      <a href="logout.php" class="btn btn-outline">Logout</a>
    `;
  } else {
    actions.innerHTML = `
      <a href="index.html" class="btn btn-primary nav-login-btn">Login</a>
      <a href="cart.html" class="nav-icon-link"><i class="fas fa-shopping-cart"></i></a>
    `;
  }
}

// 2. Cart Access Control
function checkCartAccess() {
  const loginRequired = document.getElementById("loginRequired");
  const cartContent = document.getElementById("cartContent");
  const cartSummary = document.getElementById("cartSummaryCard");

  if (window.__userLoggedIn) {
    if (loginRequired) loginRequired.style.display = "none";
    if (cartContent) cartContent.style.display = "block";
    if (cartSummary) cartSummary.style.display = "flex";
    loadCartItems();
  } else {
    if (loginRequired) loginRequired.style.display = "block";
    if (cartContent) cartContent.style.display = "none";
    if (cartSummary) cartSummary.style.display = "none";
  }
}

// 3. Data Loading
async function loadCartItems() {
  try {
    const response = await fetch("cart.php?action=get");
    const data = await response.json();

    if (data.success) {
      displayCartItems(data.items);
      updateCartSummary(data.items, data.total_amount);
    }
  } catch (error) {
    console.error("Error loading cart:", error);
  }
}

// 4. Display Logic (Using your Modern CSS Classes)
function displayCartItems(items) {
  const cartList = document.getElementById("cartItemsList");
  if (!cartList) return;

  if (items.length === 0) {
    cartList.innerHTML = `
      <div style="text-align:center; padding: 60px 20px;">
        <i class="fas fa-shopping-cart" style="font-size: 4rem; color: #eee; margin-bottom: 20px;"></i>
        <h2>Your Cart is Empty</h2>
        <p>Browse our shop to add delicious pickles!</p>
        <a href="shop.html" class="checkout-btn-modern" style="display:inline-block; width:auto; text-decoration:none; margin-top:20px;">Go to Shop</a>
      </div>`;
    return;
  }

  cartList.innerHTML = items.map(item => `
    <div class="cart-item">
      <div class="item-image">
        <img src="${item.product_image || 'PHOTOS/6.jpg'}" alt="${item.product_name}">
      </div>
      <div class="item-details">
        <h3>${item.product_name}</h3>
        <p>Price: Rs. ${item.product_price}</p>
        <div class="item-quantity" style="margin-top: 10px;">
          <button class="quantity-btn" onclick="updateCartQuantity(${item.product_id}, ${item.quantity - 1})">-</button>
          <input type="number" class="quantity-input" value="${item.quantity}" readonly>
          <button class="quantity-btn" onclick="updateCartQuantity(${item.product_id}, ${item.quantity + 1})">+</button>
        </div>
      </div>
      <div class="item-price">Rs. ${(item.product_price * item.quantity).toFixed(2)}</div>
      <button class="remove-item" onclick="removeFromCart(${item.product_id})">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>
  `).join("");
}

// 5. Quantity and Removal Actions
async function updateCartQuantity(productId, newQuantity) {
  if (newQuantity < 1) return removeFromCart(productId);

  const formData = new FormData();
  formData.append("action", "update");
  formData.append("product_id", productId);
  formData.append("quantity", newQuantity);

  const res = await fetch("cart.php", { method: "POST", body: formData });
  const data = await res.json();
  if (data.success) loadCartItems();
}

async function removeFromCart(productId) {
  if (!confirm("Remove this item from your cart?")) return;

  const formData = new FormData();
  formData.append("action", "remove");
  formData.append("product_id", productId);

  const res = await fetch("cart.php", { method: "POST", body: formData });
  const data = await res.json();
  if (data.success) {
    loadCartItems();
    showNotification("Item removed", "success");
  }
}

// 6. Summary and Checkout Logic
function updateCartSummary(items, totalAmount) {
  const subtotal = totalAmount || items.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
  const total = subtotal; // Assuming Free Delivery as per your UI

  document.getElementById("subtotalAmount").textContent = `Rs. ${subtotal.toFixed(2)}`;
  document.getElementById("totalAmount").textContent = `Rs. ${total.toFixed(2)}`;
}

function openCheckoutModal() {
  const modal = document.createElement('div');
  modal.className = 'checkout-modal-overlay';
  modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:10000;";
  
  modal.innerHTML = `
    <div style="background:white; padding:32px; border-radius:24px; width:100%; max-width:400px; box-shadow: 0 20px 50px rgba(0,0,0,0.2);">
      <h2 style="margin-bottom:20px; color:#333;">Delivery Details</h2>
      <form id="checkoutForm">
        <div style="margin-bottom:15px;">
          <label style="display:block; margin-bottom:5px; color:#666;">Full Delivery Address</label>
          <input type="text" name="location" required style="width:100%; padding:12px; border:1.5px solid #eee; border-radius:12px;">
        </div>
        <div style="margin-bottom:25px;">
          <label style="display:block; margin-bottom:5px; color:#666;">Phone Number</label>
          <input type="tel" name="phone" placeholder="98XXXXXXXX" required style="width:100%; padding:12px; border:1.5px solid #eee; border-radius:12px;">
        </div>
        <button type="submit" class="checkout-btn-modern">Pay via Khalti</button>
        <button type="button" onclick="this.closest('.checkout-modal-overlay').remove()" style="width:100%; background:none; border:none; margin-top:15px; color:#999; cursor:pointer;">Cancel</button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('checkoutForm').onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const res = await fetch('payment-request.php', { method: 'POST', body: formData });
    const data = await res.json();

    if (data.success && data.payment_url) {
      window.location.href = data.payment_url;
    } else {
      showNotification(data.message || "Checkout failed", "error");
    }
  };
}

function showNotification(message, type = "info") {
  const note = document.createElement("div");
  note.style.cssText = `position:fixed; top:20px; right:20px; padding:15px 25px; border-radius:12px; color:white; z-index:11000; font-weight:500; background:${type==='success'?'#4caf50':'#f44336'}; box-shadow:0 10px 20px rgba(0,0,0,0.1);`;
  note.textContent = message;
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 3000);
}