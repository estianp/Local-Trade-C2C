<?php
session_start();
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
require __DIR__ . '/config.php';

if (isset($_SESSION['user_id'])) {
    // Fetch user details including admin status
    $sql = "SELECT username, is_admin FROM users WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $_SESSION['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        echo json_encode([
            'logged_in' => true,
            'username' => $user['username'],
            'is_admin' => (bool)$user['is_admin']
        ]);
    } else {
        echo json_encode(['logged_in' => false]);
    }
    $stmt->close();
} else {
    echo json_encode(['logged_in' => false]);
}
?>