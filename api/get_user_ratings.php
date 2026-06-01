<?php
header('Content-Type: application/json');
require __DIR__ . '/config.php';

$user_id = intval($_GET['user_id'] ?? 0);

if (!$user_id) {
    echo json_encode(['success' => false, 'message' => 'User ID required']);
    exit;
}

// Get user's average rating and total ratings
$sql = "SELECT average_rating, total_ratings FROM users WHERE id = ?";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
    exit;
}
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'User not found']);
    $stmt->close();
    exit;
}

$user = $result->fetch_assoc();
$stmt->close();

// Get recent ratings for this user (both as seller and buyer)
$sql = "SELECT r.rating, r.review, r.rating_type, r.created_at, u.username,
        CASE WHEN r.rating_type = 'buyer_to_seller' THEN 'Seller' ELSE 'Buyer' END as role
        FROM ratings r 
        JOIN users u ON r.rater_id = u.id 
        WHERE r.ratee_id = ? 
        ORDER BY r.created_at DESC 
        LIMIT 10";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Database error in ratings query: ' . $conn->error]);
    exit;
}

$stmt->bind_param("i", $user_id);

if (!$stmt->execute()) {
    echo json_encode(['success' => false, 'message' => 'Database error executing ratings query: ' . $stmt->error]);
    $stmt->close();
    exit;
}

$result = $stmt->get_result();

$ratings = [];
while ($row = $result->fetch_assoc()) {
    $ratings[] = $row;
}
$stmt->close();

echo json_encode([
    'success' => true,
    'average_rating' => floatval($user['average_rating']),
    'total_ratings' => intval($user['total_ratings']),
    'recent_ratings' => $ratings
]);
?>