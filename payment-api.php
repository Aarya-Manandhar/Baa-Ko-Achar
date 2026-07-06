<?php
session_start();
require_once 'db.php';
$config = include('config.php');

$secretKey = $config['khalti_secret_key'] ?? '';
if (!$secretKey) {
  $_SESSION['transaction_msg'] = '<div class="alert alert-danger">Missing Khalti secret key.</div>';
  header('Location: orders.html');
  exit;
}

$token  = $_GET['token'] ?? $_POST['token'] ?? null;
$amount = $_GET['amount'] ?? $_POST['amount'] ?? null;

if (!$token || !$amount) {
  $_SESSION['transaction_msg'] = '<div class="alert alert-danger">Invalid payment parameters.</div>';
  header('Location: orders.html');
  exit;
}

// Verify with Khalti
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://khalti.com/api/v2/payment/verify/");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
  'token' => $token,
  'amount' => $amount
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Key " . $secretKey]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);

if (isset($result['idx'])) {
  $user_id = $_SESSION['user_id'] ?? null;
  $txn_id  = $result['idx'];
  $amt     = $amount / 100; // Khalti sends paisa, convert to rupees

  if ($user_id) {
    // Preferentially update the pending order we created earlier
    $pending_order_id = $_SESSION['pending_order_id'] ?? null;
    if ($pending_order_id) {
      // Update order
      $stmt = $conn->prepare("UPDATE orders SET status='Paid', payment_transaction_id=? WHERE id=? AND user_id=?");
      $stmt->bind_param("sii", $txn_id, $pending_order_id, $user_id);
      $stmt->execute();

      // Insert payment record
      $stmt2 = $conn->prepare("INSERT INTO payments (order_id, user_id, amount, method, transaction_id, status, paid_at) 
                               VALUES (?, ?, ?, 'Khalti', ?, 'Successful', NOW())");
      $stmt2->bind_param("iids", $pending_order_id, $user_id, $amt, $txn_id);
      $stmt2->execute();
    } else {
      // Fallback: update latest order for user
      $stmt = $conn->prepare("UPDATE orders SET status='Paid', payment_transaction_id=? WHERE user_id=? ORDER BY id DESC LIMIT 1");
      $stmt->bind_param("si", $txn_id, $user_id);
      $stmt->execute();

      // Get latest order id
      $order_id = $conn->insert_id;

      // Insert payment record
      $stmt2 = $conn->prepare("INSERT INTO payments (order_id, user_id, amount, method, transaction_id, status, paid_at) 
                               VALUES (?, ?, ?, 'Khalti', ?, 'Successful', NOW())");
      $stmt2->bind_param("iids", $order_id, $user_id, $amt, $txn_id);
      $stmt2->execute();
    }

    // Clear the user's cart
    $stmt3 = $conn->prepare("DELETE FROM cart_items WHERE user_id=?");
    $stmt3->bind_param("i", $user_id);
    $stmt3->execute();

    // Clean up session keys
    unset($_SESSION['pending_order_id']);
    unset($_SESSION['purchase_order_id']);
  }

  $_SESSION['transaction_msg'] = '<div class="alert alert-success">Payment verified and order placed successfully.</div>';
} else {
  $_SESSION['transaction_msg'] = '<div class="alert alert-danger">Payment verification failed.</div>';
}

header('Location: orders.html');
?>