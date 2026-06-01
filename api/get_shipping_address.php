<?php
header('Content-Type: application/json');
session_start();
require __DIR__ . '/config.php';

if (!isset($_SESSION['user_id'])) {
	echo json_encode(['success' => false, 'message' => 'Not logged in']);
	exit;
}

$user_id = $_SESSION['user_id'];

$sql = "SELECT id, full_name, phone_number, street_address, city, province, postal_code FROM shipping_addresses WHERE user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
	$address = $result->fetch_assoc();
	echo json_encode(['success' => true, 'exists' => true, 'address' => $address]);
} else {
	echo json_encode(['success' => true, 'exists' => false]);
}

$stmt->close();
?>