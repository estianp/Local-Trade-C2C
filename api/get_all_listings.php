<?php
header('Content-Type: application/json');
session_start();
require __DIR__ . '/config.php';

// Check if user is admin
if (!isset($_SESSION['user_id']) || !isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
	echo json_encode(['success' => false, 'message' => 'Unauthorized']);
	exit;
}

$sql = "SELECT i.id, i.title, i.description, i.price, i.category_id, i.user_id, 
		i.created_at, i.is_sold, u.username, c.name as category_name 
		FROM items i 
		JOIN users u ON i.user_id = u.id 
		JOIN categories c ON i.category_id = c.id 
		ORDER BY i.created_at DESC";
$result = $conn->query($sql);

if ($result) {
	$listings = [];
	while ($row = $result->fetch_assoc()) {
		$listings[] = $row;
	}
	echo json_encode(['success' => true, 'listings' => $listings]);
} else {
	echo json_encode(['success' => false, 'message' => 'Database error']);
}
?>