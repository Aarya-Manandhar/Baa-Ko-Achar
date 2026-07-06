<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

// Check if user is admin
if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Not authorized']);
    exit;
}

$action = $_GET['action'] ?? '';

switch ($action) {
    // Users
    case 'users':
        try {
            $stmt = $conn->prepare("SELECT id, first_name, last_name, email, role, created_at 
                                    FROM users 
                                    ORDER BY created_at DESC");
            $stmt->execute();
            $result = $stmt->get_result();
            $users = [];
            while ($row = $result->fetch_assoc()) {
                $users[] = $row;
            }
            echo json_encode(['success' => true, 'users' => $users]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Error loading users: '.$e->getMessage()]);
        }
        break;

    // Orders
    case 'orders':
        try {
            $stmt = $conn->prepare("SELECT o.*, CONCAT(u.first_name, ' ', u.last_name) as user_name 
                                    FROM orders o 
                                    LEFT JOIN users u ON o.user_id = u.id 
                                    ORDER BY o.created_at DESC");
            $stmt->execute();
            $result = $stmt->get_result();
            $orders = [];
            while ($row = $result->fetch_assoc()) {
                $orders[] = $row;
            }
            echo json_encode(['success' => true, 'orders' => $orders]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Error loading orders: '.$e->getMessage()]);
        }
        break;

    // Products
    case 'products':
        try {
            $stmt = $conn->prepare("SELECT id, name, description, price, category, spice_level, stock, image, created_at 
                                    FROM products 
                                    ORDER BY created_at DESC");
            $stmt->execute();
            $result = $stmt->get_result();
            $products = [];
            while ($row = $result->fetch_assoc()) {
                $products[] = $row;
            }
            echo json_encode(['success' => true, 'products' => $products]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Error loading products: '.$e->getMessage()]);
        }
        break;

    // Add product
    case 'add_product':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            if (isset($data['name'], $data['price'], $data['stock'], $data['category'])) {
                $stmt = $conn->prepare("INSERT INTO products (name, price, stock, category) VALUES (?, ?, ?, ?)");
                $stmt->bind_param("sdis", $data['name'], $data['price'], $data['stock'], $data['category']);
                $success = $stmt->execute();
                echo json_encode(['success' => $success]);
                exit;
            }
        }
        echo json_encode(['success' => false, 'message' => 'Invalid product data']);
        break;

    // Delete product
    case 'delete_product':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            if (isset($data['id'])) {
                $stmt = $conn->prepare("DELETE FROM products WHERE id=?");
                $stmt->bind_param("i", $data['id']);
                $success = $stmt->execute();
                echo json_encode(['success' => $success]);
                exit;
            }
        }
        echo json_encode(['success' => false, 'message' => 'Invalid product ID']);
        break;

    // Payments
    case 'payments':
        try {
            $stmt = $conn->prepare("SELECT p.*, u.first_name, u.last_name, o.total 
                                    FROM payments p
                                    LEFT JOIN users u ON p.user_id = u.id
                                    LEFT JOIN orders o ON p.order_id = o.id
                                    ORDER BY p.created_at DESC");
            $stmt->execute();
            $result = $stmt->get_result();
            $payments = [];
            while ($row = $result->fetch_assoc()) {
                $payments[] = $row;
            }
            echo json_encode(['success' => true, 'payments' => $payments]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Error loading payments: '.$e->getMessage()]);
        }
        break;

    // Update order status
    case 'update_status':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            if (isset($data['id'])) {
                $status = $data['status'] ?? 'Paid';
                $stmt = $conn->prepare("UPDATE orders SET status=? WHERE id=?");
                $stmt->bind_param("si", $status, $data['id']);
                $success = $stmt->execute();
                echo json_encode(['success' => $success]);
                exit;
            }
        }
        echo json_encode(['success' => false, 'message' => 'Invalid request']);
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

$conn->close();
?>