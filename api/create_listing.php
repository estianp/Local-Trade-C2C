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
    $title = trim($data['title'] ?? '');
    $description = trim($data['description'] ?? '');
    $price = floatval($data['price'] ?? 0);
    $image = !empty($data['image']) ? $data['image'] : null;
    
    if (!$title || !$description || $price <= 0) {
        echo json_encode(['success' => false, 'message' => 'All fields required with valid price']);
        exit;
    }
    
    $sql = "INSERT INTO items (user_id, title, description, price, image) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
        exit;
    }
    
    $stmt->bind_param("issds", $user_id, $title, $description, $price, $image);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Item listed successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to list item: ' . $stmt->error]);
    }
    
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>