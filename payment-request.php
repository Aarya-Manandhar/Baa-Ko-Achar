<?php
session_start();
header('Content-Type: application/json');
require_once 'db.php';
$config = include('config.php');

$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
  echo json_encode(['success' => false, 'message' => 'Not logged in']);
  exit;
}

$location = $_POST['location'] ?? '';
$phone = $_POST['phone'] ?? '';

if (!$location || !$phone) {
  echo json_encode(['success' => false, 'message' => 'Missing delivery details']);
  exit;
}

// Compute cart total
$stmt = $conn->prepare("SELECT product_price, quantity FROM cart_items WHERE user_id=?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$res = $stmt->get_result();

$total_rupees = 0;
while ($row = $res->fetch_assoc()) {
  $total_rupees += $row['product_price'] * $row['quantity'];
}
if ($total_rupees <= 0) {
  echo json_encode(['success' => false, 'message' => 'Cart is empty']);
  exit;
}

$amount_paisa = (int)round($total_rupees * 100);

$postFields = [
  // ensure return and website URLs point to the correct project folder
  "return_url" => "http://localhost/baa/baa/baa/payment-response.php",
  "website_url" => "http://localhost/baa/baa/baa/",
  "amount" => $amount_paisa,
  "purchase_order_id" => "po_" . time(),
  "purchase_order_name" => "Cart Checkout",
  "customer_info" => [
    "name" => "Customer",
    "email" => "customer@example.com",
    "phone" => $phone
  ]
];

// Build items JSON from cart_items for record keeping
$items = [];
$stmtItems = $conn->prepare("SELECT product_id, product_name, product_price, quantity FROM cart_items WHERE user_id = ?");
$stmtItems->bind_param("i", $user_id);
$stmtItems->execute();
$resItems = $stmtItems->get_result();
while ($r = $resItems->fetch_assoc()) {
  $items[] = $r;
}
$items_json = json_encode($items);

// Create a pending order record so we can update it after payment
$purchase_order_id = 'po_' . time() . rand(1000,9999);
$total_amount = $total_rupees;
$stmtOrder = $conn->prepare("INSERT INTO orders (user_id, location, phone, items, total, status, created_at) VALUES (?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)");
$stmtOrder->bind_param("isssd", $user_id, $location, $phone, $items_json, $total_amount);
if ($stmtOrder->execute()) {
  $pending_order_id = $stmtOrder->insert_id;
  // store in session so payment-response can locate the order
  $_SESSION['pending_order_id'] = $pending_order_id;
  $_SESSION['purchase_order_id'] = $purchase_order_id;
} else {
  echo json_encode(['success' => false, 'message' => 'Failed to create order record']);
  exit;
}

$postFields = [
  "return_url" => "http://localhost/baa/baa/baa/payment-response.php",
  "website_url" => "http://localhost/baa/baa/baa/",
  "amount" => $amount_paisa,
  "purchase_order_id" => $purchase_order_id,
  "purchase_order_name" => "Cart Checkout",
  "customer_info" => [
    "name" => "Customer",
    "email" => "customer@example.com",
    "phone" => $phone
  ]
];

$jsonData = json_encode($postFields);

$curl = curl_init();
curl_setopt_array($curl, [
  CURLOPT_URL => 'https://a.khalti.com/api/v2/epayment/initiate/',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => $jsonData,
  CURLOPT_HTTPHEADER => [
    'Authorization: Key ' . $config['khalti_secret_key'],
    'Content-Type: application/json',
  ],
]);

$response = curl_exec($curl);
$error = curl_error($curl);
curl_close($curl);

if ($error) {
  echo json_encode(['success' => false, 'message' => $error]);
  exit;
}

$result = json_decode($response, true);

if (isset($result['payment_url'])) {
  echo json_encode(['success' => true, 'payment_url' => $result['payment_url']]);
} else {
  echo json_encode(['success' => false, 'message' => $result['detail'] ?? 'Unexpected response', 'raw' => $result]);
}