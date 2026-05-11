<?php
header('Content-Type: application/json');
require __DIR__ . '/config.php';

$sql = "SELECT DISTINCT items.category_id, categories.name FROM items JOIN categories ON items.category_id = categories.id WHERE categories.parent_id IS NOT NULL ORDER BY RAND() LIMIT 1";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $category_id = $row['category_id'];
    $category_name = $row['name'];
    
    $itemsSql = "SELECT items.id, items.title, items.description, items.price, items.image_filename, users.username FROM items JOIN users ON items.user_id = users.id WHERE items.category_id = ? ORDER BY items.created_at DESC LIMIT 6";
    $stmt = $conn->prepare($itemsSql);
    $stmt->bind_param("i", $category_id);
    $stmt->execute();
    $itemsResult = $stmt->get_result();
    
    $items = [];
    while($itemRow = $itemsResult->fetch_assoc()) {
        $itemRow['image_url'] = $itemRow['image_filename'] ? '/uploads/' . $itemRow['image_filename'] : null;
        $items[] = $itemRow;
    }
    
    echo json_encode(['success' => true, 'category_name' => $category_name, 'items' => $items]);
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'No categories with items']);
}

if (item.image_url) {
    document.getElementById('itemImage').src = item.image_url;
}
?>