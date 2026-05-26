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

	if (!$user_id || $user_id == $_SESSION['user_id']) {
		echo json_encode(['success' => false, 'message' => 'Cannot delete this user']);
		exit;
	}

	// Delete user's listings first, then delete user
	$conn->begin_transaction();

	try {
		$sql1 = "DELETE FROM items WHERE user_id = ?";
		$stmt1 = $conn->prepare($sql1);
		$stmt1->bind_param("i", $user_id);
		$stmt1->execute();

		$sql2 = "DELETE FROM users WHERE id = ?";
		$stmt2 = $conn->prepare($sql2);
		$stmt2->bind_param("i", $user_id);
		$stmt2->execute();

		$conn->commit();
		echo json_encode(['success' => true, 'message' => 'User deleted']);
	} catch (Exception $e) {
		$conn->rollback();
		echo json_encode(['success' => false, 'message' => 'Error deleting user']);
	}
} else {
	echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>