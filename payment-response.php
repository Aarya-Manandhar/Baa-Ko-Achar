<?php
session_start();
require_once 'db.php';
$config = include('config.php');

// Force display errors for debugging - remove these two lines once it works!
ini_set('display_errors', 1);
error_reporting(E_ALL);

$secretKey = $config['khalti_secret_key'] ?? '';
$token  = $_GET['token'] ?? $_POST['token'] ?? null;
$amount = $_GET['amount'] ?? $_POST['amount'] ?? null;

// 1. Initial validation
if (!$token || !$amount) {
    $_SESSION['transaction_msg'] = '<div class="alert alert-danger">Payment failed: Parameters missing.</div>';
    header('Location: orders.html');
    exit;
}

// 2. Khalti Verification API Call
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

// 3. Process Success
if (isset($result['idx'])) {
    // Try to get IDs from session
    $user_id = $_SESSION['user_id'] ?? null;
    $pending_order_id = $_SESSION['pending_order_id'] ?? null;

    /* RECOVERY STEP: If the session was lost during redirect, 
       we find the order using the 'purchase_order_id' Khalti sends back 
       (or use the one in your database).
    */
    if (!$user_id && $pending_order_id) {
        $findUser = $conn->prepare("SELECT user_id FROM orders WHERE id = ?");
        $findUser->bind_param("i", $pending_order_id);
        $findUser->execute();
        $userData = $findUser->get_result()->fetch_assoc();
        $user_id = $userData['user_id'] ?? null;
    }

    if ($user_id) {
        // A. Update Order Status
        if ($pending_order_id) {
            $stmt = $conn->prepare("UPDATE orders SET status='paid', payment_transaction_id=? WHERE id=? AND user_id=?");
            $stmt->bind_param("sii", $result['idx'], $pending_order_id, $user_id);
        } else {
            $stmt = $conn->prepare("UPDATE orders SET status='paid', payment_transaction_id=? WHERE user_id=? ORDER BY id DESC LIMIT 1");
            $stmt->bind_param("si", $result['idx'], $user_id);
        }
        $stmt->execute();

        // B. THE FIX: Clear the user's cart
        // We use a try-catch style check here
        $stmt2 = $conn->prepare("DELETE FROM cart_items WHERE user_id=?");
        $stmt2->bind_param("i", $user_id);
        
        if (!$stmt2->execute()) {
            // This will help you see if there is a DB error like a foreign key issue
            error_log("Cart delete failed: " . $conn->error);
        }

        // C. Clean up session
        unset($_SESSION['pending_order_id']);
        unset($_SESSION['purchase_order_id']);

        $_SESSION['transaction_msg'] = '<div class="alert alert-success">Payment verified! Cart cleared.</div>';
    } else {
        $_SESSION['transaction_msg'] = '<div class="alert alert-warning">Payment received, but we lost your session. Your cart might not have cleared automatically.</div>';
    }
} else {
    $_SESSION['transaction_msg'] = '<div class="alert alert-danger">Payment verification failed.</div>';
}

// 4. Redirect to the SUCCESS page so we can show the popup
header('Location: payment-success.php');
exit;