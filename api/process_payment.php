<?php
session_start();
require 'config.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
	echo json_encode(['success' => false, 'message' => 'Not logged in']);
	exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$item_id = $data['item_id'] ?? null;
$buyer_id = $_SESSION['user_id'];

if (!$item_id) {
	echo json_encode(['success' => false, 'message' => 'Invalid item']);
	exit;
}

$stmt = $conn->prepare("SELECT id, user_id, is_sold FROM items WHERE id = ?");
$stmt->bind_param("i", $item_id);
$stmt->execute();
$result = $stmt->get_result();
$item = $result->fetch_assoc();

if (!$item) {
	echo json_encode(['success' => false, 'message' => 'Item not found']);
	exit;
}

if ($item['is_sold']) {
	echo json_encode(['success' => false, 'message' => 'Item already sold']);
	exit;
}

if ($item['user_id'] == $buyer_id) {
	echo json_encode(['success' => false, 'message' => 'Cannot buy your own listing']);
	exit;
}

$update_stmt = $conn->prepare("UPDATE items SET is_sold = 1, sold_to = ?, sold_at = NOW() WHERE id = ?");
$update_stmt->bind_param("ii", $buyer_id, $item_id);

if ($update_stmt->execute()) {
	echo json_encode(['success' => true, 'message' => 'Payment successful']);
} else {
	echo json_encode(['success' => false, 'message' => 'Failed to process payment']);
}
?>