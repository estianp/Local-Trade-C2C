<?php
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
require __DIR__ . '/config.php';

$itemId = $_GET['id'] ?? null;

if (!$itemId) {
    echo json_encode(['success' => false, 'message' => 'No item ID provided']);
    exit;
}

$sql = "SELECT items.id, items.title, items.description, items.price, items.image_filename, items.is_sold, users.username, categories.name AS category, items.created_at FROM items JOIN users ON items.user_id = users.id JOIN categories ON items.category_id = categories.id WHERE items.id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $itemId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $item = $result->fetch_assoc();
    $item['image_url'] = $item['image_filename'] ? '/uploads/' . $item['image_filename'] : null;
    echo json_encode(['success' => true, 'item' => $item]);
} else {
    echo json_encode(['success' => false, 'message' => 'Item not found']);
}

$stmt->close();
?>