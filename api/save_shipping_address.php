<?php
header('Content-Type: application/json');
session_start();
require __DIR__ . '/config.php';

if (!isset($_SESSION['user_id'])) {
	echo json_encode(['success' => false, 'message' => 'Not logged in']);
	exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
	$data = json_decode(file_get_contents("php://input"), true);

	$user_id = $_SESSION['user_id'];
	$full_name = trim($data['full_name'] ?? '');
	$phone_number = trim($data['phone_number'] ?? '');
	$street_address = trim($data['street_address'] ?? '');
	$city = trim($data['city'] ?? '');
	$province = trim($data['province'] ?? '');
	$postal_code = trim($data['postal_code'] ?? '');

	// Validation
	if (!$full_name || !$phone_number || !$street_address || !$city || !$province || !$postal_code) {
		echo json_encode(['success' => false, 'message' => 'All fields required']);
		exit;
	}

	// Check if address already exists
	$sql = "SELECT id FROM shipping_addresses WHERE user_id = ?";
	$stmt = $conn->prepare($sql);
	$stmt->bind_param("i", $user_id);
	$stmt->execute();
	$result = $stmt->get_result();

	if ($result->num_rows > 0) {
		// Update existing
		$sql = "UPDATE shipping_addresses SET full_name = ?, phone_number = ?, street_address = ?, city = ?, province = ?, postal_code = ? WHERE user_id = ?";
		$stmt = $conn->prepare($sql);
		$stmt->bind_param("ssssssi", $full_name, $phone_number, $street_address, $city, $province, $postal_code, $user_id);
	} else {
		// Insert new
		$sql = "INSERT INTO shipping_addresses (user_id, full_name, phone_number, street_address, city, province, postal_code) VALUES (?, ?, ?, ?, ?, ?, ?)";
		$stmt = $conn->prepare($sql);
		$stmt->bind_param("issssss", $user_id, $full_name, $phone_number, $street_address, $city, $province, $postal_code);
	}

	if ($stmt->execute()) {
		echo json_encode(['success' => true, 'message' => 'Shipping address saved successfully']);
	} else {
		echo json_encode(['success' => false, 'message' => 'Error saving shipping address']);
	}
	$stmt->close();
} else {
	echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>