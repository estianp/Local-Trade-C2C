<?php
session_start();
header('Content-Type: application/json');
require __DIR__ . '/config.php';

if (isset($_SESSION['user_id'])) {
    echo json_encode(['logged_in' => true, 'username' => $_SESSION['username']]);
} else {
    echo json_encode(['logged_in' => false]);
}
?>