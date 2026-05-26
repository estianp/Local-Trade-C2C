<?php
header('Content-Type: application/json');
session_start();
require __DIR__ . '/config.php';

// Check if user is admin
if (!isset($_SESSION['user_id']) || !isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
	echo json_encode(['success' => false, 'message' => 'Unauthorized']);
	exit;
}

$sql = "SELECT id, username, email, created_at, is_admin FROM users ORDER BY created_at DESC";
$result = $conn->query($sql);

if ($result) {
	$users = [];
	while ($row = $result->fetch_assoc()) {
		$users[] = $row;
	}
	echo json_encode(['success' => true, 'users' => $users]);
} else {
	echo json_encode(['success' => false, 'message' => 'Database error']);
}
?>