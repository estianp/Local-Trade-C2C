<?php
header('Content-Type: application/json');
session_start();
require __DIR__ . '/config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (!isset($_FILES['image'])) {
        echo json_encode(['success' => false, 'message' => 'No image provided']);
        exit;
    }

    $file = $_FILES['image'];
    $filename = $file['name'];
    $fileTmp = $file['tmp_name'];
    $fileError = $file['error'];
    $fileSize = $file['size'];

    if ($fileError !== UPLOAD_ERR_OK) {
        echo json_encode(['success' => false, 'message' => 'Upload error']);
        exit;
    }

    $maxSize = 5 * 1024 * 1024;
    if ($fileSize > $maxSize) {
        echo json_encode(['success' => false, 'message' => 'File too large (max 5MB)']);
        exit;
    }

    $ext = pathinfo($filename, PATHINFO_EXTENSION);
    $allowed = ['jpg', 'jpeg', 'png', 'gif'];

    if (!in_array(strtolower($ext), $allowed)) {
        echo json_encode(['success' => false, 'message' => 'Invalid file type']);
        exit;
    }

    $uploadDir = __DIR__ . '/../public/uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $newFilename = uniqid() . '_' . time() . '.' . $ext;
    $uploadPath = $uploadDir . $newFilename;

    if (move_uploaded_file($fileTmp, $uploadPath)) {
        $imageUrl = 'uploads/' . $newFilename;
        echo json_encode(['success' => true, 'imageUrl' => $imageUrl]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to save image']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>

