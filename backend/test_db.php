<?php
$conn = new mysqli("localhost", "root", "", "dootea_db");

if ($conn->connect_error) {
    die("Kết nối thất bại: " . $conn->connect_error);
}

echo "Kết nối database thành công!";
?>