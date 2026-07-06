<?php
session_start();
$ADMIN_USER = 'admin';
$ADMIN_PASS = 'admin123'; // Change as needed
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $u = $_POST['username'] ?? '';
    $p = $_POST['password'] ?? '';
    if ($u === $ADMIN_USER && $p === $ADMIN_PASS) {
        $_SESSION['is_admin'] = true;
        header('Location: admin-dashboard.html');
        exit;
    } else {
        header('Location: admin-login.html?error=Invalid+credentials');
        exit;
    }
}
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: admin-login.html');
    exit;
} 