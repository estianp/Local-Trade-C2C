<?php
header('Content-Type: application/json');
session_start();
require __DIR__ . '/config.php';

if (!isset($_SESSION['user_id'])) {
	echo json_encode(['success' => false, 'message' => 'Not logged in']);
	exit;
}

$item_id = intval($_GET['item_id'] ?? 0);

if (!$item_id) {
	echo json_encode(['success' => false, 'message' => 'Item ID required']);
	exit;
}

$user_id = $_SESSION['user_id'];

// Check if buyer already rated this seller for this item
$sql = "SELECT id FROM ratings WHERE rater_id = ? AND item_id = ? AND rating_type = 'buyer_to_seller'";
$stmt = $conn->prepare($sql);

if (!$stmt) {
	echo json_encode(['success' => false, 'message' => 'Database error']);
	exit;
}

$stmt->bind_param("ii", $user_id, $item_id);
$stmt->execute();
$result = $stmt->get_result();
$stmt->close();

$already_rated = $result->num_rows > 0;

echo json_encode([
	'success' => true,
	'already_rated' => $already_rated
]);
?>