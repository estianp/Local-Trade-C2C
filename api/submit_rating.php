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
    
    $rater_id = $_SESSION['user_id'];
    $ratee_id = intval($data['ratee_id'] ?? 0);
    $item_id = intval($data['item_id'] ?? 0);
    $rating = intval($data['rating'] ?? 0);
    $review = trim($data['review'] ?? '');
    $rating_type = $data['rating_type'] ?? '';
    
    // Validation
    if (!$ratee_id || !$item_id || $rating < 1 || $rating > 10) {
        echo json_encode(['success' => false, 'message' => 'Invalid rating data']);
        exit;
    }
    
    if (!in_array($rating_type, ['buyer_to_seller', 'seller_to_buyer'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid rating type']);
        exit;
    }
    
    if ($rater_id == $ratee_id) {
        echo json_encode(['success' => false, 'message' => 'Cannot rate yourself']);
        exit;
    }
    
    // Verify the transaction exists
    $sql = "SELECT user_id, sold_to FROM items WHERE id = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
        exit;
    }
    $stmt->bind_param("i", $item_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Item not found']);
        $stmt->close();
        exit;
    }
    
    $item = $result->fetch_assoc();
    $stmt->close();
    
    // Verify user is part of the transaction
    if ($rating_type == 'buyer_to_seller') {
        if ($rater_id != $item['sold_to']) {
            echo json_encode(['success' => false, 'message' => 'Only buyer can rate seller']);
            exit;
        }
    } else {
        if ($rater_id != $item['user_id']) {
            echo json_encode(['success' => false, 'message' => 'Only seller can rate buyer']);
            exit;
        }
    }
    
    // Check if rating already exists
    $sql = "SELECT id FROM ratings WHERE rater_id = ? AND ratee_id = ? AND item_id = ? AND rating_type = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
        exit;
    }
    $stmt->bind_param("iiss", $rater_id, $ratee_id, $item_id, $rating_type);
    $stmt->execute();
    $result = $stmt->get_result();
    $stmt->close();
    
    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'You have already rated this user for this transaction']);
        exit;
    }
    
    // Insert rating - the trigger will automatically update average_rating and total_ratings
    $sql = "INSERT INTO ratings (rater_id, ratee_id, item_id, rating, review, rating_type) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
        exit;
    }
    
    $stmt->bind_param("iiiiss", $rater_id, $ratee_id, $item_id, $rating, $review, $rating_type);
    
    if ($stmt->execute()) {
        $stmt->close();
        // Trigger automatically updates users table - no manual function needed
        echo json_encode(['success' => true, 'message' => 'Rating submitted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error submitting rating: ' . $stmt->error]);
        $stmt->close();
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>