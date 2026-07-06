<?php
session_start();
header('Content-Type: application/json');
require_once 'db.php';

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

if (!$email || !$password) {
    echo json_encode(['success' => false, 'message' => 'Email and password required.']);
    exit;
}

$stmt = $conn->prepare('SELECT id, password, first_name FROM users WHERE email = ? LIMIT 1');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if ($user && password_verify($password, $user['password'])) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_name'] = $user['first_name'];
    echo json_encode(['success' => true, 'message' => 'Login successful!', 'user' => $user['first_name']]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
}
$conn->close(); 