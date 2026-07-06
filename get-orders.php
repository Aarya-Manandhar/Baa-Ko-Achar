<?php
session_start();
header('Content-Type: application/json');
require 'db.php';
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
  echo json_encode(['success' => false, 'message' => 'Not logged in.']);
  exit;
}
$stmt = $conn->prepare("SELECT id, created_at, total, items, location, phone FROM orders WHERE user_id = ? ORDER BY created_at DESC");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$orders = [];
while ($row = $result->fetch_assoc()) {
  $row['items'] = json_decode($row['items'], true);
  $orders[] = $row;
}
echo json_encode(['success' => true, 'orders' => $orders]);
$conn->close(); 