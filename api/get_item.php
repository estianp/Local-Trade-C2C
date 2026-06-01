<?php
header('Content-Type: application/json');
require __DIR__ . '/config.php';

$item_id = intval($_GET['id'] ?? 0);

if (!$item_id) {
    echo json_encode(['success' => false, 'message' => 'Item ID required']);
    exit;
}

$sql = "SELECT i.id, i.user_id, i.title, i.description, i.price, i.image_filename, 
        i.is_sold, i.sold_to, i.created_at, 
        u.username, c.name as category,
        CONCAT('uploads/', i.image_filename) as image_url
        FROM items i 
        JOIN users u ON i.user_id = u.id 
        JOIN categories c ON i.category_id = c.id 
        WHERE i.id = ?";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Database error']);
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

// Ensure numeric types
$item['id'] = intval($item['id']);
$item['user_id'] = intval($item['user_id']);
$item['price'] = floatval($item['price']);
$item['is_sold'] = intval($item['is_sold']);
$item['sold_to'] = $item['sold_to'] ? intval($item['sold_to']) : null;

echo json_encode(['success' => true, 'item' => $item]);
?>