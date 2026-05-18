<?php
session_start();
require 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$user_id = $_SESSION['user_id'];
$username = trim($data['username'] ?? '');

if (!$username) {
    echo json_encode(['success' => false, 'message' => 'Username is required']);
    exit;
}

$stmt = $conn->prepare("UPDATE users SET username = ? WHERE id = ?");
$stmt->bind_param("si", $username, $user_id);

if ($stmt->execute()) {
    $_SESSION['username'] = $username;
    echo json_encode(['success' => true, 'message' => 'Profile updated']);
} else {
    echo json_encode(['success' => false, 'message' => 'Update failed']);
}
?>