<?php
header('Content-Type: application/json');
session_start();
require __DIR__ . '/config.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $item_id = intval($data['item_id'] ?? 0);
    $user_id = $_SESSION['user_id'];
    
    if (!$item_id) {
        echo json_encode(['success' => false, 'message' => 'Invalid item ID']);
        exit;
    }
    
    // Check if item belongs to the user
    $check_sql = "SELECT user_id FROM items WHERE id = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("i", $item_id);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    $item = $result->fetch_assoc();
    $check_stmt->close();
    
    // User can only delete their own listings (or admins can delete any)
    if (!$item || ($item['user_id'] != $user_id && !($_SESSION['is_admin'] ?? false))) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    
    $sql = "DELETE FROM items WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $item_id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Listing deleted']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
    }
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>