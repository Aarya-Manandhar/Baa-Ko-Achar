// Shop page functionality
document.addEventListener("DOMContentLoaded", () => {
  // Only initialize on pages that include the products grid
  if (document.getElementById('productsGrid')) {
    loadProducts()
  } else {
    console.log('ℹ️ shop.js: productsGrid not present, skipping loadProducts')
  }
})

// Load products from database
async function loadProducts() {
  try {
    const response = await fetch("get-products.php")
    const data = await response.json()

    if (data.success) {
      displayProducts(data.products)
    } else {
      console.error("Failed to load products:", data.message)
    }
  } catch (error) {
    console.error("Error loading products:", error)
  }
}

// Display products in grid
function displayProducts(products) {
  const productsGrid = document.getElementById("productsGrid")
  if (!productsGrid) return

  if (products.length === 0) {
    productsGrid.innerHTML = `<p>No products available.</p>`
    return
  }

  productsGrid.innerHTML = products
    .map((product) => {
      const badges = getProductBadges(product)
      const rating = 4.2 + Math.random() * 0.8 // Generate random rating between 4.2-5.0
      const reviewCount = Math.floor(Math.random() * 200) + 50 // Random review count
      const originalPrice = Math.floor(product.price * 1.15) // Calculate original price
      const savings = originalPrice - product.price
      return `
      <div class="shop-card">
        <div class="shop-card-img-wrap">
          <div class="shop-card-badges">
            ${badges.map((badge) => `<span class="shop-badge">${badge.text}</span>`).join("")}
          </div>
          <button class="shop-card-fav" onclick="toggleWishlist(${product.id})"><i class="far fa-heart"></i></button>
          <div class="shop-card-img-placeholder">
            <img src="${product.image || 'PHOTOS/6.jpg'}" alt="${product.name}" onerror="this.src='PHOTOS/6.jpg'">
          </div>
        </div>
        <div class="shop-card-body">
          <div class="shop-card-category">${product.category} Pickles</div>
          <div class="shop-card-title">${product.name}</div>
          <div class="shop-card-desc">${product.description}</div>
          <div class="shop-card-rating">
            <span class="shop-stars">${generateStarRating(rating)}</span>
            <span class="shop-rating-text">${rating.toFixed(1)} (${reviewCount} reviews)</span>
          </div>
          <div class="shop-card-pricing">
            <span class="shop-price">Rs. ${product.price}</span>
            <span class="shop-old-price">Rs. ${originalPrice}</span>
            <span class="shop-save">Save Rs. ${savings}</span>
          </div>
          <button class="shop-add-to-cart" onclick="addToCart(${product.id})" ${product.stock === 0 ? "disabled" : ""}>
            <i class="fas fa-shopping-cart"></i> ${product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
      `
    })
    .join("")
}

// Change quantity
function changeQuantity(productId, change) {
  const qtyInput = document.getElementById(`qty-${productId}`)
  if (!qtyInput) return
  let value = parseInt(qtyInput.value) || 1
  value += change
  if (value < 1) value = 1
  if (value > parseInt(qtyInput.max)) value = parseInt(qtyInput.max)
  qtyInput.value = value
}

// Add to cart
async function addToCart(productId) {
  if (!window.authUtils.isLoggedIn()) {
    window.authUtils.showAuthModal("login")
    return
  }
  const quantity = 1
  try {
    const response = await fetch("cart.php", {
      method: "POST",
      body: new URLSearchParams({ action: "add", product_id: productId, quantity }),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
    const data = await response.json()
    if (data.success) {
      if (window.authUtils && window.authUtils.updateCartBadge) {
        window.authUtils.updateCartBadge()
      }
      showNotification('Added to cart!', 'success')
    } else {
      showNotification(data.message || "Error adding item to cart", "error")
    }
  } catch (error) {
    showNotification("Error adding item to cart", "error")
  }
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    animation: slideIn 0.3s ease;
    max-width: 300px;
  `
  if (type === "error") notification.style.background = "#f44336"
  else if (type === "success") notification.style.background = "#4caf50"
  else if (type === "warning") notification.style.background = "#ff9800"
  else notification.style.background = "#2196f3"
  document.body.appendChild(notification)
  setTimeout(() => {
    notification.remove()
  }, 3000)
}
