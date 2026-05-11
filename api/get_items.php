<?php
header('Content-Type: application/json');
require __DIR__ . '/config.php';

$sql = "SELECT items.id, items.title, items.description, items.price, items.image, users.username, items.category_id, categories.name AS category, items.created_at FROM items JOIN users ON items.user_id = users.id JOIN categories ON items.category_id = categories.id ORDER BY items.created_at DESC";
$result = $conn->query($sql);

$items = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $items[] = $row;
    }
}

echo json_encode($items);
?>