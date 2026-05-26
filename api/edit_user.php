<?php
header('Content-Type: application/json');
session_start();
require __DIR__ . '/config.php';

// Check if user is admin
if (!isset($_SESSION['user_id']) || !isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
	echo json_encode(['success' => false, 'message' => 'Unauthorized']);
	exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
	$data = json_decode(file_get_contents("php://input"), true);

	$user_id = intval($data['user_id'] ?? 0);
	$is_admin = isset($data['is_admin']) ? (bool)$data['is_admin'] : false;

	if (!$user_id) {
		echo json_encode(['success' => false, 'message' => 'Invalid user ID']);
		exit;
	}

	$sql = "UPDATE users SET is_admin = ? WHERE id = ?";
	$stmt = $conn->prepare($sql);
	$stmt->bind_param("ii", $is_admin, $user_id);

	if ($stmt->execute()) {
		echo json_encode(['success' => true, 'message' => 'User updated']);
	} else {
		echo json_encode(['success' => false, 'message' => 'Database error']);
	}
	$stmt->close();
} else {
	echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>