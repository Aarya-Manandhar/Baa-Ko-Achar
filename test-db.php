<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

try {
    // Test database connection
    $result = $conn->query("SELECT COUNT(*) as user_count FROM users");
    
    if ($result) {
        $row = $result->fetch_assoc();
        echo json_encode([
            'success' => true,
            'message' => "Database connected successfully! Found {$row['user_count']} users in database."
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Database query failed: ' . $conn->error
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database connection error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
