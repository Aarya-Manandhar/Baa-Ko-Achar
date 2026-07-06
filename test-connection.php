<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🔧 PHP Connection Test</h1>";

// Test 1: PHP is working
echo "<h2>✅ PHP is working!</h2>";
echo "PHP Version: " . phpversion() . "<br>";
echo "Current time: " . date('Y-m-d H:i:s') . "<br><br>";

// Test 2: Database connection
echo "<h2>Database Test:</h2>";
try {
    $host = 'localhost';
    $user = 'root';
    $pass = '';
    $dbname = 'baa_ko_achar';

    $conn = new mysqli($host, $user, $pass, $dbname);

    if ($conn->connect_error) {
        echo "❌ Connection failed: " . $conn->connect_error . "<br>";
    } else {
        echo "✅ Database connected successfully!<br>";
        
        // Check if users table exists
        $result = $conn->query("SHOW TABLES LIKE 'users'");
        if ($result->num_rows > 0) {
            echo "✅ Users table exists<br>";
            
            // Count users
            $result = $conn->query("SELECT COUNT(*) as count FROM users");
            $row = $result->fetch_assoc();
            echo "Users in database: " . $row['count'] . "<br>";
        } else {
            echo "❌ Users table does not exist<br>";
            echo "<strong>You need to create the database tables first!</strong><br>";
        }
    }
    $conn->close();
} catch (Exception $e) {
    echo "❌ Database error: " . $e->getMessage() . "<br>";
}

// Test 3: Session test
echo "<h2>Session Test:</h2>";
session_start();
if (isset($_SESSION['test'])) {
    echo "✅ Session working: " . $_SESSION['test'] . "<br>";
} else {
    $_SESSION['test'] = 'Session is working!';
    echo "✅ Session created. Refresh to test.<br>";
}

// Test 4: POST test
echo "<h2>POST Test:</h2>";
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo "✅ POST request received<br>";
    echo "POST data: <pre>" . print_r($_POST, true) . "</pre>";
} else {
    echo "No POST data. Try the form below:<br>";
    echo '<form method="POST"><input type="text" name="test" value="Hello"><button type="submit">Test POST</button></form>';
}
?>
