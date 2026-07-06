<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require 'db.php';

$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
  echo json_encode(['success' => false, 'message' => 'Not logged in.']);
  exit;
}

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$product_id = $_POST['product_id'] ?? $_GET['product_id'] ?? '';
$quantity = $_POST['quantity'] ?? 1;

switch ($action) {
  case 'add':
      if (!$product_id) {
          echo json_encode(['success' => false, 'message' => 'No product specified.']);
          exit;
      }
      
      // Verify product exists and get stock
      $stmt = $conn->prepare("SELECT id, name, price, stock, image FROM products WHERE id = ?");
      $stmt->bind_param("i", $product_id);
      $stmt->execute();
      $product = $stmt->get_result()->fetch_assoc();
      
      if (!$product) {
          echo json_encode(['success' => false, 'message' => 'Product not found.']);
          exit;
      }
      
      if ($product['stock'] < $quantity) {
          echo json_encode(['success' => false, 'message' => 'Insufficient stock.']);
          exit;
      }
      
      // Check if item already in cart
      $stmt = $conn->prepare("SELECT id, quantity FROM cart_items WHERE user_id=? AND product_id=?");
      $stmt->bind_param("ii", $user_id, $product_id);
      $stmt->execute();
      $stmt->store_result();
      
      if ($stmt->num_rows > 0) {
          // Update existing item
          $stmt->bind_result($cart_id, $old_qty);
          $stmt->fetch();
          $new_qty = $old_qty + $quantity;
          
          if ($new_qty > $product['stock']) {
              echo json_encode(['success' => false, 'message' => 'Cannot add more items. Stock limit reached.']);
              exit;
          }
          
          $stmt2 = $conn->prepare("UPDATE cart_items SET quantity=?, updated_at=CURRENT_TIMESTAMP WHERE id=?");
          $stmt2->bind_param("ii", $new_qty, $cart_id);
          $stmt2->execute();
      } else {
          // Add new item
          $stmt2 = $conn->prepare("INSERT INTO cart_items (user_id, product_id, product_name, product_image, product_price, quantity) VALUES (?, ?, ?, ?, ?, ?)");
          $stmt2->bind_param("iissdi", $user_id, $product_id, $product['name'], $product['image'], $product['price'], $quantity);
          $stmt2->execute();
      }
      
      echo json_encode(['success' => true, 'message' => 'Item added to cart!']);
      break;

  case 'update':
      if (!$product_id || $quantity < 1) {
          echo json_encode(['success' => false, 'message' => 'Invalid quantity.']);
          exit;
      }
      
      // Check stock before updating
      $stmt = $conn->prepare("SELECT stock FROM products WHERE id = ?");
      $stmt->bind_param("i", $product_id);
      $stmt->execute();
      $product = $stmt->get_result()->fetch_assoc();
      
      if (!$product || $quantity > $product['stock']) {
          echo json_encode(['success' => false, 'message' => 'Insufficient stock.']);
          exit;
      }
      
      $stmt = $conn->prepare("UPDATE cart_items SET quantity=?, updated_at=CURRENT_TIMESTAMP WHERE user_id=? AND product_id=?");
      $stmt->bind_param("iii", $quantity, $user_id, $product_id);
      $stmt->execute();
      
      echo json_encode(['success' => true, 'message' => 'Cart updated!']);
      break;

  case 'remove':
      if (!$product_id) {
          echo json_encode(['success' => false, 'message' => 'No product specified.']);
          exit;
      }
      
      $stmt = $conn->prepare("DELETE FROM cart_items WHERE user_id=? AND product_id=?");
      $stmt->bind_param("ii", $user_id, $product_id);
      $stmt->execute();
      
      echo json_encode(['success' => true, 'message' => 'Item removed from cart!']);
      break;

  case 'get':
      $stmt = $conn->prepare("
          SELECT 
              c.product_id,
              c.quantity,
              c.product_name,
              c.product_price,
              c.product_image,
              c.product_id as id,
              (c.product_price * c.quantity) as total_price
          FROM cart_items c 
          WHERE c.user_id = ?
          ORDER BY c.created_at DESC
      ");
      $stmt->bind_param("i", $user_id);
      $stmt->execute();
      $result = $stmt->get_result();
      $items = [];
      $total_amount = 0;
      while ($row = $result->fetch_assoc()) {
          $items[] = $row;
          $total_amount += $row['total_price'];
      }
      echo json_encode([
          'success' => true, 
          'items' => $items,
          'total_amount' => $total_amount,
          'item_count' => count($items)
      ]);
      break;

  case 'clear':
      $stmt = $conn->prepare("DELETE FROM cart_items WHERE user_id=?");
      $stmt->bind_param("i", $user_id);
      $stmt->execute();
      
      echo json_encode(['success' => true, 'message' => 'Cart cleared!']);
      break;

  case 'checkout':
      $location = trim($_POST['location'] ?? '');
      $phone = trim($_POST['phone'] ?? '');
      if (!$location || !$phone) {
          echo json_encode(['success' => false, 'message' => 'Location and phone are required.']);
          exit;
      }
      // Get cart items
      $stmt = $conn->prepare("SELECT c.product_id, c.quantity, p.price FROM cart_items c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?");
      $stmt->bind_param("i", $user_id);
      $stmt->execute();
      $result = $stmt->get_result();
      $items = [];
      $total = 0;
      while ($row = $result->fetch_assoc()) {
          $items[] = $row;
          $total += $row['price'] * $row['quantity'];
      }
      if (empty($items)) {
          echo json_encode(['success' => false, 'message' => 'Your cart is empty.']);
          exit;
      }
      // Insert order
      $order_items_json = json_encode($items);
      $stmt = $conn->prepare("INSERT INTO orders (user_id, location, phone, items, total, status) VALUES (?, ?, ?, ?, ?, 'pending')");
      $stmt->bind_param("isssd", $user_id, $location, $phone, $order_items_json, $total);
      if ($stmt->execute()) {
          // Clear cart
          $stmt2 = $conn->prepare("DELETE FROM cart_items WHERE user_id=?");
          $stmt2->bind_param("i", $user_id);
          $stmt2->execute();
          echo json_encode(['success' => true, 'message' => 'Order placed successfully!']);
      } else {
          echo json_encode(['success' => false, 'message' => 'Failed to place order.']);
      }
      break;

  default:
      echo json_encode(['success' => false, 'message' => 'Invalid action.']);
}

$conn->close();
?>