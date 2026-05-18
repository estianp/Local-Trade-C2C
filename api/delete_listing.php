<?php
session_start();
require 'config.php';

if (!isset($_SESSION['user_id'])) {
	echo json_encode(['success' => false, 'message' => 'Not logged in']);
	exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$listing_id = $data['id'];
$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("DELETE FROM items WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $listing_id, $user_id);

if ($stmt->execute()) {
	echo json_encode(['success' => true, 'message' => 'Listing deleted']);
} else {
	echo json_encode(['success' => false, 'message' => 'Delete failed']);
}
?>