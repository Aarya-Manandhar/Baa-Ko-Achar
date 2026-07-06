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

  // Add custom cursor active class to body
  document.body.classList.add("custom-cursor-active")

  // Update cursor position
  document.addEventListener("mousemove", (e) => {
    cursor.style.left = e.clientX + "px"
    cursor.style.top = e.clientY + "px"
  })

  // Add hover effect for clickable elements
  const clickableElements = document.querySelectorAll(`
        a, button, input[type="submit"], input[type="button"], 
        .shop-now-btn, .card-button, .submit-button, 
        .quantity-controls button, .nav-links a, .logo, 
        .product-item, .featured-card, .testimonial-card,
        .product-card, .add-to-cart, .wishlist-btn,
        .auth-button, .checkout-btn, .filter-option,
        .hamburger, .prev, .next, .dot, .quantity-btn
    `)

  clickableElements.forEach((element) => {
    element.addEventListener("mouseenter", () => {
      cursor.style.backgroundImage = 'url(".vscode/PHOTOS/spoon-pointer.png")';
    })

    element.addEventListener("mouseleave", () => {
      cursor.style.backgroundImage = 'url(".vscode/PHOTOS/spoon-cursor.png")';
    })
  })

  // Add click effect
  document.addEventListener("mousedown", () => {
    cursor.style.transform = "translate(-50%, -50%) scale(0.9) rotate(-15deg)"
  })

  document.addEventListener("mouseup", () => {
    cursor.style.transform = "translate(-50%, -50%) scale(1) rotate(0deg)"
  })

  // Special effects for different elements
  const productCards = document.querySelectorAll(".product-card, .product-item")
  productCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      cursor.style.transform = "translate(-50%, -50%) scale(1.3) rotate(25deg)"
    })

    card.addEventListener("mouseleave", () => {
      cursor.style.transform = "translate(-50%, -50%) scale(1) rotate(15deg)"
    })
  })

  // Special effect for form inputs
  const inputs = document.querySelectorAll("input, textarea")
  inputs.forEach((input) => {
    input.addEventListener("mouseenter", () => {
      cursor.style.transform = "translate(-50%, -50%) scale(1.1) rotate(8deg)"
    })

    input.addEventListener("mouseleave", () => {
      cursor.style.transform = "translate(-50%, -50%) scale(1) rotate(15deg)"
    })
  })
})
