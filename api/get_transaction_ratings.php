<?php
header('Content-Type: application/json');
session_start();
require __DIR__ . '/config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$item_id = intval($_GET['item_id'] ?? 0);

if (!$item_id) {
    echo json_encode(['success' => false, 'message' => 'Item ID required']);
    exit;
}

// Get item details
$sql = "SELECT id, user_id, sold_to, is_sold FROM items WHERE id = ?";
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

$user_id = $_SESSION['user_id'];

// Debug info
$debug = [
    'user_id' => $user_id,
    'item_user_id' => intval($item['user_id']),
    'sold_to' => intval($item['sold_to']),
    'is_sold' => intval($item['is_sold']),
    'sold_to_not_null' => $item['sold_to'] !== null,
    'user_is_buyer' => ($user_id == intval($item['sold_to'])),
    'user_is_seller' => ($user_id == intval($item['user_id'])),
];

// Can rate seller if: current user is the buyer AND item is sold
$can_rate_seller = false;
$can_rate_buyer = false;

if ($item['is_sold'] == 1 && $item['sold_to'] !== null) {
    if ($user_id == intval($item['sold_to'])) {
        $can_rate_seller = true;
    }
    if ($user_id == intval($item['user_id'])) {
        $can_rate_buyer = true;
    }
}

$debug['can_rate_seller_initial'] = $can_rate_seller;
$debug['can_rate_buyer_initial'] = $can_rate_buyer;

// Check existing ratings
$buyer_rated_seller = false;
$seller_rated_buyer = false;

if ($can_rate_seller) {
    $sql = "SELECT COUNT(*) as cnt FROM ratings WHERE rater_id = ? AND ratee_id = ? AND item_id = ? AND rating_type = 'buyer_to_seller'";
    $stmt = $conn->prepare($sql);
    if ($stmt) {
        $seller_id = intval($item['user_id']);
        $stmt->bind_param("iii", $user_id, $seller_id, $item_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $buyer_rated_seller = $row['cnt'] > 0;
        $debug['buyer_rating_check'] = ['query' => "rater=$user_id, ratee=$seller_id, item=$item_id", 'count' => $row['cnt']];
        $stmt->close();
    }
}

if ($can_rate_buyer) {
    $sql = "SELECT COUNT(*) as cnt FROM ratings WHERE rater_id = ? AND ratee_id = ? AND item_id = ? AND rating_type = 'seller_to_buyer'";
    $stmt = $conn->prepare($sql);
    if ($stmt) {
        $buyer_id = intval($item['sold_to']);
        $stmt->bind_param("iii", $user_id, $buyer_id, $item_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $seller_rated_buyer = $row['cnt'] > 0;
        $debug['seller_rating_check'] = ['query' => "rater=$user_id, ratee=$buyer_id, item=$item_id", 'count' => $row['cnt']];
        $stmt->close();
    }
}

// Remove already-submitted ratings from the options
if ($buyer_rated_seller) {
    $can_rate_seller = false;
    $debug['buyer_already_rated'] = true;
}
if ($seller_rated_buyer) {
    $can_rate_buyer = false;
    $debug['seller_already_rated'] = true;
}

$debug['can_rate_seller_final'] = $can_rate_seller;
$debug['can_rate_buyer_final'] = $can_rate_buyer;

echo json_encode([
    'success' => true,
    'can_rate_seller' => $can_rate_seller,
    'can_rate_buyer' => $can_rate_buyer,
    'seller_id' => intval($item['user_id']),
    'buyer_id' => intval($item['sold_to']),
    'debug' => $debug
]);
?>