<?php
session_start();
require 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];
$stmt = $conn->prepare("SELECT id, title, description, price, image_filename FROM items WHERE user_id = ? ORDER BY created_at DESC");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$listings = [];

while ($row = $result->fetch_assoc()) {
    $row['image_url'] = $row['image_filename'] ? '/uploads/' . $row['image_filename'] : null;
    unset($row['image_filename']);
    $listings[] = $row;
}

echo json_encode(['success' => true, 'listings' => $listings]);
?>