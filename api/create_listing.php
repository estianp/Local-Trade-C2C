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
    $category_id = intval($data['category'] ?? 0);
    $title = trim($data['title'] ?? '');
    $description = trim($data['description'] ?? '');
    $price = floatval($data['price'] ?? 0);
    $imageFilename = null;
    
    if (!$category_id || !$title || !$description || $price <= 0) {
        echo json_encode(['success' => false, 'message' => 'All fields required with valid price']);
        exit;
    }
    
    // Handle image upload
    if (!empty($data['image'])) {
        $imageData = $data['image'];
        
        if (strpos($imageData, 'data:') === 0) {
            $imageData = substr($imageData, strpos($imageData, ',') + 1);
            $imageData = base64_decode($imageData);
        }
        
        $uploadsDir = '/var/www/html/uploads/';
        if (!is_dir($uploadsDir)) {
            mkdir($uploadsDir, 0777, true);
        }
        
        $imageFilename = uniqid() . '_' . time() . '.jpg';
        $uploadPath = $uploadsDir . $imageFilename;
        
        if (!file_put_contents($uploadPath, $imageData)) {
            echo json_encode(['success' => false, 'message' => 'Failed to save image']);
            exit;
        }
    }
    
    $sql = "INSERT INTO items (user_id, category_id, title, description, price, image_filename) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
        exit;
    }
    
    $stmt->bind_param("iissds", $user_id, $category_id, $title, $description, $price, $imageFilename);
    
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