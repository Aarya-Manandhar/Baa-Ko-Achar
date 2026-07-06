<?php
$servername = "localhost";
$username = "root";
$password = ""; // default for XAMPP is empty
$dbname = "baa_ko_achar"; // <-- change this to your actual database name

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?> 