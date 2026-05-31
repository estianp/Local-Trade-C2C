<?php
header('Content-Type: application/json');
session_start();
require __DIR__ . '/config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

$sql = "SELECT id, card_holder_name, card_number, expiry_date FROM payment_details WHERE user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $details = $result->fetch_assoc();
    // Mask card number
    $cardNumber = $details['card_number'];
    $masked = '**** **** **** ' . substr($cardNumber, -4);
    
    echo json_encode([
        'success' => true,
        'exists' => true,
        'card_holder_name' => $details['card_holder_name'],
        'card_number' => $masked,
        'expiry_date' => $details['expiry_date']
    ]);
} else {
    echo json_encode(['success' => true, 'exists' => false]);
}

$stmt->close();
?>