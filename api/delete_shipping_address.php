<?php
header('Content-Type: application/json');
session_start();
require __DIR__ . '/config.php';

if (!isset($_SESSION['user_id'])) {
	echo json_encode(['success' => false, 'message' => 'Not logged in']);
	exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
	$user_id = $_SESSION['user_id'];

	$sql = "DELETE FROM shipping_addresses WHERE user_id = ?";
	$stmt = $conn->prepare($sql);
	$stmt->bind_param("i", $user_id);

	if ($stmt->execute()) {
		echo json_encode(['success' => true, 'message' => 'Shipping address deleted']);
	} else {
		echo json_encode(['success' => false, 'message' => 'Error deleting shipping address']);
	}
	$stmt->close();
} else {
	echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>