// Shop page functionality with improved debugging
let allProducts = []
let filteredProducts = []
let currentCategory = "all"
let currentSpiceLevel = "all"
let searchQuery = ""

window.authUtils = {
  isLoggedIn: function() {
    // Synchronous check using localStorage/sessionStorage or fallback to AJAX (not ideal for sync, but for demo)
    // We'll use a cached value for now, and update it on page load
    return window.__userLoggedIn === true;
  },
  showAuthModal: function(type) {
    // Show modal if present, fallback to redirect
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.classList.add('active');
      document.getElementById('authModalOverlay')?.classList.add('active');
      if (type === 'login') {
        document.getElementById('loginFormModal').style.display = 'block';
        document.getElementById('signupFormModal').style.display = 'none';
      } else {
        document.getElementById('loginFormModal').style.display = 'none';
        document.getElementById('signupFormModal').style.display = 'block';
      }
    } else {
      window.location.href = type === 'login' ? 'login.html' : 'signup.html';
    }
  },
  updateCartBadge: function() {
    // Optionally update cart badge
    // (implement as needed)
  }
};

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Script initialized")

  // Only run product-related initialization on pages that include the products grid
  const productsGrid = document.getElementById("productsGrid")
  if (productsGrid) {
    console.log("🚀 Shop page detected, initializing product UI...")
    loadProducts()
    initializeFilters()
  } else {
    console.log("ℹ️ productsGrid not found — skipping product initialization")
  }
})

// Load products from database with better error handling
async function loadProducts() {
  console.log("📦 Loading products...")

  try {
    const response = await fetch("get-products.php")
    console.log("📡 Response status:", response.status)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const text = await response.text()
    console.log("📄 Raw response:", text)

    let data
    try {
      data = JSON.parse(text)
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError)
      console.error("📄 Response text:", text)
      showErrorMessage("Invalid response from server. Check console for details.")
      return
    }

    console.log("📊 Parsed data:", data)

    if (data.success) {
      allProducts = data.products || []
      filteredProducts = [...allProducts]
      console.log(`✅ Loaded ${allProducts.length} products`)
      displayProducts(filteredProducts)
      updateResultsCount()
    } else {
      console.error("❌ Server error:", data.message)
      showErrorMessage("Failed to load products: " + (data.message || "Unknown error"))
    }
  } catch (error) {
    console.error("❌ Network error:", error)
    showErrorMessage("Network error: " + error.message)
  }
}

// Show error message in products grid
function showErrorMessage(message) {
  const productsGrid = document.getElementById("productsGrid")
  if (productsGrid) {
    productsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #f44336; margin-bottom: 20px;"></i>
        <h3 style="color: #333; margin-bottom: 10px;">Error Loading Products</h3>
        <p style="color: #666; margin-bottom: 20px;">${message}</p>
        <button onclick="loadProducts()" style="background: var(--primary-color); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
          Try Again
        </button>
      </div>
    `
  }
}

// Update the filter categories to match the new products
function initializeFilters() {
  console.log("🔧 Initializing filters...")

  // Category filters
  const categoryFilters = document.querySelectorAll("[data-category]")
  categoryFilters.forEach((filter) => {
    filter.addEventListener("click", () => {
      categoryFilters.forEach((f) => f.classList.remove("active"))
      filter.classList.add("active")
      currentCategory = filter.dataset.category
      filterProducts()
    })
  })

  // Spice level filters
  const spiceFilters = document.querySelectorAll("[data-spice]")
  spiceFilters.forEach((filter) => {
    filter.addEventListener("click", () => {
      spiceFilters.forEach((f) => f.classList.remove("active"))
      filter.classList.add("active")
      currentSpiceLevel = filter.dataset.spice
      filterProducts()
    })
  })

  // Category checkboxes
  const categoryCheckboxes = document.querySelectorAll('input[name="category"]')
  categoryCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      console.log("📋 Category filter changed")
      filterProducts()
    })
  })

  // Spice level checkboxes
  const spiceCheckboxes = document.querySelectorAll('input[name="spice"]')
  spiceCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      console.log("🌶️ Spice filter changed")
      filterProducts()
    })
  })

  // Price range inputs
  const minPriceInput = document.getElementById("minPrice")
  const maxPriceInput = document.getElementById("maxPrice")

  if (minPriceInput) minPriceInput.addEventListener("input", filterProducts)
  if (maxPriceInput) maxPriceInput.addEventListener("input", filterProducts)

  // Search functionality
  const searchInput = document.getElementById("searchInput")
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.toLowerCase()
      console.log("🔍 Search query:", searchQuery)
      filterProducts()
    })
  }

  console.log("✅ Filters initialized")
}

// Update filter products function to handle checkboxes and price range
function filterProducts() {
  console.log("🔄 Filtering products...")

  // Get selected categories
  const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(
    (cb) => cb.value,
  )

  // Get selected spice levels
  const selectedSpiceLevels = Array.from(document.querySelectorAll('input[name="spice"]:checked')).map((cb) => cb.value)

  // Get price range
  const minPrice = Number.parseFloat(document.getElementById("minPrice")?.value) || 0
  const maxPrice = Number.parseFloat(document.getElementById("maxPrice")?.value) || Number.POSITIVE_INFINITY

  filteredProducts = allProducts.filter((product) => {
    // Category filter
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category)

    // Spice level filter
    const spiceMatch = selectedSpiceLevels.length === 0 || selectedSpiceLevels.includes(product.spice_level)

    // Price filter
    const priceMatch = product.price >= minPrice && product.price <= maxPrice

    // Search filter
    const searchMatch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery) ||
      product.description.toLowerCase().includes(searchQuery) ||
      product.category.toLowerCase().includes(searchQuery)

    return categoryMatch && spiceMatch && priceMatch && searchMatch
  })

  console.log(`🎯 Filtered to ${filteredProducts.length} products`)
  displayProducts(filteredProducts)
  updateResultsCount()
}

// Update results count
function updateResultsCount() {
  const resultsCount = document.getElementById("resultsCount")
  if (resultsCount) {
    resultsCount.textContent = `Showing ${filteredProducts.length} of ${allProducts.length} products`
  }
}

// Enhanced product badges function
function getProductBadges(product) {
  const badges = []

  // Add badges based on product properties
  if (product.spice_level === "hot") badges.push({ text: "🌶️ Hot", class: "hot" })
  if (product.spice_level === "medium") badges.push({ text: "🌶️ Medium", class: "medium" })
  if (product.spice_level === "mild") badges.push({ text: "🌿 Mild", class: "mild" })

  if (product.stock > 40) badges.push({ text: "⭐ Bestseller", class: "bestseller" })
  if (product.stock < 20) badges.push({ text: "⚡ Limited", class: "limited" })

  if (product.category === "gundruk" || product.category === "bamboo")
    badges.push({ text: "🏔️ Traditional", class: "traditional" })
  if (product.category === "fish" || product.category === "dried-fish" || product.category === "chicken")
    badges.push({ text: "🍖 Protein", class: "protein" })
  if (product.price > 400) badges.push({ text: "👑 Premium", class: "premium" })

  // Special Nepali categories
  if (product.category === "gundruk") badges.push({ text: "🦠 Probiotic", class: "probiotic" })
  if (product.category === "garlic") badges.push({ text: "💪 Immunity", class: "immunity" })

  return badges
}

// Generate star rating HTML
function generateStarRating(rating) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  let starsHTML = ""

  // Full stars
  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<i class="fas fa-star star"></i>'
  }

  // Half star
  if (hasHalfStar) {
    starsHTML += '<i class="fas fa-star-half-alt star"></i>'
  }

  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<i class="far fa-star star empty"></i>'
  }

  return starsHTML
}

// Display products in grid
function displayProducts(products) {
  console.log(`🎨 Displaying ${products.length} products`)
  const productsGrid = document.getElementById("productsGrid")

  if (!productsGrid) {
    console.error("❌ Products grid element not found!")
    return
  }

  if (products.length === 0) {
    productsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
        <i class="fas fa-search" style="font-size: 3rem; color: #ddd; margin-bottom: 20px;"></i>
        <h3 style="color: #666; margin-bottom: 10px;">No products found</h3>
        <p style="color: #999;">Try adjusting your filters or search terms</p>
      </div>
    `
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
        <div class="product-card">
          <div class="product-image">
            <img src="${product.image || ".vscode/PHOTOS/6.jpg"}" alt="${product.name}" onerror="this.src='.vscode/PHOTOS/6.jpg'">
            <div class="product-badges">
              ${badges.map((badge) => `<span class="badge ${badge.class}">${badge.text}</span>`).join("")}
            </div>
            <button class="wishlist-btn" onclick="toggleWishlist(${product.id})">
              <i class="far fa-heart"></i>
            </button>
          </div>
          <div class="product-info">
            <div class="product-category">${product.category} Pickles</div>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-rating">
              <div class="stars">
                ${generateStarRating(rating)}
              </div>
              <span class="rating-text">${rating.toFixed(1)} (${reviewCount} reviews)</span>
            </div>
            <div class="product-pricing">
              <span class="current-price">Rs. ${product.price}</span>
              <span class="original-price">Rs. ${originalPrice}</span>
              <span class="savings">Save Rs. ${savings}</span>
            </div>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id})" ${product.stock === 0 ? "disabled" : ""}>
              <i class="fas fa-shopping-cart"></i>
              ${product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        </div>
      `
    })
    .join("")

  console.log("✅ Products displayed successfully")
}

// Toggle wishlist
function toggleWishlist(productId) {
  const wishlistBtn = event.target.closest(".wishlist-btn")
  const icon = wishlistBtn.querySelector("i")

  if (icon.classList.contains("far")) {
    icon.classList.remove("far")
    icon.classList.add("fas")
    wishlistBtn.style.background = "#ff6b35"
    wishlistBtn.style.color = "white"
  } else {
    icon.classList.remove("fas")
    icon.classList.add("far")
    wishlistBtn.style.background = "white"
    wishlistBtn.style.color = "#333"
  }
}

// Add to cart (existing function)
async function addToCart(productId) {
  if (!window.authUtils || !window.authUtils.isLoggedIn()) {
    if (window.authUtils) {
      window.authUtils.showAuthModal("login")
    } else {
      alert("Please login to add items to cart")
    }
    return
  }

  const quantity = 1 // Default quantity

  try {
    const formData = new FormData()
    formData.append("action", "add")
    formData.append("product_id", productId)
    formData.append("quantity", quantity)

    const response = await fetch("cart.php", {
      method: "POST",
      body: formData,
    })

    const data = await response.json()

    if (data.success) {
      // Update cart badge
      if (window.authUtils) {
        window.authUtils.updateCartBadge()
      }

      // Show success message
      const btn = event.target
      const originalText = btn.innerHTML
      btn.innerHTML = '<i class="fas fa-check"></i> Added!'
      btn.style.background = "#4caf50"

      setTimeout(() => {
        btn.innerHTML = originalText
        btn.style.background = "#ff6b35"
      }, 2000)
    } else {
      alert("Error: " + data.message)
    }
  } catch (error) {
    console.error("Error adding to cart:", error)
    alert("Error adding item to cart")
  }
}

// On page load, set window.__userLoggedIn by checking user-info.php
fetch('user-info.php').then(r => r.json()).then(data => {
  window.__userLoggedIn = !!data.logged_in;
});

// Custom Spoon Cursor from cursor.js for all pages
(function() {
  document.addEventListener("DOMContentLoaded", () => {
    // Check if device is mobile
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth <= 768

    // Don't initialize custom cursor on mobile devices
    if (isMobile) {
      return
    }

    // Create single custom cursor element
    const cursor = document.createElement("div")
    cursor.className = "custom-cursor"
    document.body.appendChild(cursor)
    document.body.classList.add("custom-cursor-active")

    // Update cursor position
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px"
      cursor.style.top = e.clientY + "px"
    })

    // Add hover effect for clickable elements
    function setPointerCursor() {
      cursor.style.backgroundImage = 'url("PHOTOS/spoon-pointer.png")';
    }
    function setDefaultCursor() {
      cursor.style.backgroundImage = 'url("PHOTOS/spoon-cursor.png")';
    }
    setDefaultCursor();

    document.addEventListener("mouseover", (e) => {
      let el = e.target;
      while (el) {
        if (
          el.tagName === 'A' ||
          el.tagName === 'BUTTON' ||
          el.onclick ||
          el.classList.contains('btn') ||
          el.classList.contains('shop-add-to-cart') ||
          el.classList.contains('wishlist-btn')
        ) {
          setPointerCursor();
          return;
        }
        el = el.parentElement;
      }
      setDefaultCursor();
    });

    // Add click effect
    document.addEventListener("mousedown", () => {
      cursor.style.transform = "translate(-50%, -50%) scale(0.9) rotate(-15deg)"
    })
    document.addEventListener("mouseup", () => {
      cursor.style.transform = "translate(-50%, -50%) scale(1) rotate(0deg)"
    })

    // Special effects for product cards
    document.addEventListener("mouseover", (e) => {
      let el = e.target;
      while (el) {
        if (el.classList && (el.classList.contains("product-card") || el.classList.contains("product-item"))) {
          cursor.style.transform = "translate(-50%, -50%) scale(1.3) rotate(25deg)";
          return;
        }
        el = el.parentElement;
      }
    });
    document.addEventListener("mouseout", (e) => {
      cursor.style.transform = "translate(-50%, -50%) scale(1) rotate(0deg)";
    });

    // Special effect for form inputs
    document.addEventListener("mouseover", (e) => {
      let el = e.target;
      while (el) {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          cursor.style.transform = "translate(-50%, -50%) scale(1.1) rotate(8deg)";
          return;
        }
        el = el.parentElement;
      }
    });
  });
})();
