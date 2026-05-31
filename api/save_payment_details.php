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
    $card_holder_name = trim($data['card_holder_name'] ?? '');
    $card_number = trim($data['card_number'] ?? '');
    $expiry_date = trim($data['expiry_date'] ?? '');
    $cvv = trim($data['cvv'] ?? '');
    
    // Basic validation
    if (!$card_holder_name || !$card_number || !$expiry_date || !$cvv) {
        echo json_encode(['success' => false, 'message' => 'All fields required']);
        exit;
    }
    
    // Validate card number (basic Luhn algorithm would be better)
    if (strlen(preg_replace('/\s/', '', $card_number)) < 13 || strlen(preg_replace('/\s/', '', $card_number)) > 19) {
        echo json_encode(['success' => false, 'message' => 'Invalid card number']);
        exit;
    }
    
    // Validate expiry format (MM/YY)
    if (!preg_match('/^\d{2}\/\d{2}$/', $expiry_date)) {
        echo json_encode(['success' => false, 'message' => 'Expiry format must be MM/YY']);
        exit;
    }
    
    // Validate CVV
    if (!preg_match('/^\d{3,4}$/', $cvv)) {
        echo json_encode(['success' => false, 'message' => 'Invalid CVV']);
        exit;
    }
    
    // Check if payment details already exist
    $sql = "SELECT id FROM payment_details WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        // Update existing
        $sql = "UPDATE payment_details SET card_holder_name = ?, card_number = ?, expiry_date = ?, cvv = ? WHERE user_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssssi", $card_holder_name, $card_number, $expiry_date, $cvv, $user_id);
    } else {
        // Insert new
        $sql = "INSERT INTO payment_details (user_id, card_holder_name, card_number, expiry_date, cvv) VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("issss", $user_id, $card_holder_name, $card_number, $expiry_date, $cvv);
    }
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Payment details saved successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error saving payment details']);
    }
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>