# Baa Ko Achar

## Project Overview

**Baa Ko Achar** is a modern e-commerce web application for selling authentic Nepali pickles. It features a user-friendly shop, cart, checkout, order history, and a secure admin dashboard for managing users and orders.

---

## Features

- User Registration & Login (AJAX, session-based)
- Product Catalog with search and filters
- Cart with add/remove/update functionality
- Checkout with address and phone collection
- Order History for users
- Admin Dashboard (hardcoded login) to view users, orders, and update order status
- Responsive, modern UI with custom branding
- Error handling and user feedback throughout

Landing Page
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/0f04c94c-89f1-4d6b-bcb1-ed48701d0349" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/11a1b2b3-a1fa-4851-959d-f3884ff37dbe" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/3ae95a28-7eb8-4065-a1ab-a34fe0e0440f" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/bdaa405a-1347-45d8-aaec-6931d2ed36c2" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/e29c1843-4bbf-410a-bfe0-b4a6102902ac" />


---

## Project Structure

```
baa/
├── PHOTOS/                # Product and branding images
│   ├── 6.jpg              # Main product image
│   ├── buff.png           # Feature image
│   ├── baa ko achar logo.png
│   ├── spoon-cursor.png   # Custom cursor
│   └── spoon-pointer.png  # Custom pointer
├── about.html             # About page
├── admin-api.php          # Admin dashboard backend API
├── admin-auth.php         # Admin login/logout/session
├── admin-dashboard.html   # Admin dashboard UI
├── admin-login.html       # Admin login page
├── cart.html              # Cart page
├── db.php                 # Database connection
├── get-orders.php         # User order history API
├── get-products.php       # Product list API
├── index.html             # Homepage
├── login.html             # User login page
├── orders.html            # User order history page
├── script.js              # Shared frontend JS
├── shop.html              # Shop page
├── shop.js                # Shop-specific JS
├── signup.html            # User signup page
├── signup.php             # User signup backend
├── styles.css             # Main CSS
└── (other PHP/JS as needed)
```

---

## Setup Instructions

### Prerequisites
- **XAMPP** or any LAMP/WAMP stack (PHP, MySQL, Apache)
- **Composer** (optional, for PHP dependencies)

### Steps

1. **Clone or copy the project** into your XAMPP `htdocs` directory:
   ```
   C:\xampp\htdocs\baa
   ```

2. **Create the database:**
   - Import the provided `setup.sql` file into phpMyAdmin or via MySQL CLI.
   - This creates tables: `users`, `products`, `cart_items`, `orders`.

3. **Configure database connection:**
   - Edit `db.php` if your MySQL credentials differ from default (`root`/no password).

4. **Start Apache and MySQL** from XAMPP control panel.

5. **Access the site:**
   - Open [http://localhost/baa/index.html](http://localhost/baa/index.html)

---

## Database Schema

**Tables:**
- `users`: id, first_name, last_name, email, password (hashed), role, created_at
- `products`: id, name, description, price, category, spice_level, image, stock, created_at
- `cart_items`: id, user_id, product_id, product_name, product_image, product_price, quantity, created_at, updated_at
- `orders`: id, user_id, items (JSON), total, status, location, phone, created_at

**Admin user** is inserted by default (see below).

---

## Frontend Guide

### Main Pages

- **index.html**: Homepage with hero, features, testimonials.
- **shop.html**: Product catalog, search, filters, add to cart.
- **cart.html**: View/update cart, proceed to checkout.
- **orders.html**: View past orders (must be logged in).
- **about.html**: Brand story and mission.

### Authentication

- **login.html**: User login (AJAX, session-based)
- **signup.html**: User registration (AJAX)
- **Navbar**: Shows login/signup or user dropdown based on session

### Modals

- Login and signup modals are available on shop and other pages for quick access.

---

## Backend Guide

### Key PHP Files

- **db.php**: Central DB connection (edit credentials here)
- **signup.php**: Handles user registration (validates, hashes password)
- **login.php**: Handles user login (validates, sets session)
- **get-products.php**: Returns product list as JSON
- **get-orders.php**: Returns logged-in user's orders as JSON
- **admin-api.php**: Returns all users/orders for admin, allows order status update

### Sessions

- PHP sessions are used for user and admin authentication.
- Always ensure `session_start()` is present at the top of PHP files that use sessions.

---

## Admin Dashboard

### Access

- Go to: [http://localhost/baa/admin-login.html](http://localhost/baa/admin-login.html)
- **Default credentials:**
  - Username: `admin`
  - Password: `admin123`
- Credentials are hardcoded in `admin-auth.php` (change as needed).

### Features

- View all users (id, name, email, role, created_at)
- View all orders (with user name, address, phone, items, status, date)
- Update order status (e.g., Pending, Shipped, Delivered)
- View order details in a modal popup

---

## Customization

- **Branding:** Replace images in `PHOTOS/` as needed (logo, product, feature images).
- **Products:** Add/edit products in the database (`products` table).
- **Theme:** Edit `styles.css` for color, layout, and custom effects.
- **Admin credentials:** Change in `admin-auth.php`.

---
   <img width="1919" height="649" alt="image" src="https://github.com/user-attachments/assets/43618b9d-a9eb-4430-a0f3-87e7cb8cd219" />
   <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/88be4bd1-73ee-4077-87b0-a133e44a7ef6" />


## Troubleshooting

- **Images not showing:** Ensure image paths in the database match files in `PHOTOS/`.
- **Login/session issues:** Make sure `session_start()` is at the top of all relevant PHP files.
- **AJAX errors:** Check browser console and network tab for error messages.
- **Database errors:** Check `db.php` credentials and that the database is imported correctly.

---

## Credits

- **Frontend:** Modern HTML5, CSS3, and vanilla JS (with some AJAX)
- **Backend:** PHP (procedural), MySQL
- **Icons:** FontAwesome
- **Fonts:** Google Fonts (Poppins)
- **Theme:** Custom, inspired by Nepali culture and Baa Ko Achar branding

---

## Contact

For support or questions, contact the project maintainer or leave an issue in your project repository.

---

**Enjoy your modern, robust, and beautiful Baa Ko Achar e-commerce site!** 
