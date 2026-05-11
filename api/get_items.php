<?php
header('Content-Type: application/json');
require __DIR__ . '/config.php';

$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = 12;
$offset = ($page - 1) * $limit;

$sql = "SELECT items.id, items.title, items.description, items.price, items.image_filename, users.username, items.category_id, categories.name AS category, items.created_at FROM items JOIN users ON items.user_id = users.id JOIN categories ON items.category_id = categories.id ORDER BY items.created_at DESC LIMIT ? OFFSET ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $limit, $offset);
$stmt->execute();
$result = $stmt->get_result();

$items = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $row['image_url'] = $row['image_filename'] ? '/uploads/' . $row['image_filename'] : null;
        $items[] = $row;
    }
}

echo json_encode(['items' => $items, 'page' => $page]);
$stmt->close();
?>