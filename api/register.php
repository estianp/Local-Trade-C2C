<?php
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
session_start();
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $username = trim($data['username'] ?? '');
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $captcha_token = $data['captcha_token'] ?? '';
    
    if (!$username || !$email || !$password) {
        echo json_encode(['success' => false, 'message' => 'All fields required']);
        exit;
    }
    
    // Verify Turnstile token
    if (!$captcha_token) {
        echo json_encode(['success' => false, 'message' => 'Captcha verification failed']);
        exit;
    }
    
    $verify_response = verify_turnstile_token($captcha_token);
    if (!$verify_response['success']) {
        echo json_encode(['success' => false, 'message' => 'Captcha verification failed']);
        exit;
    }
    
    // Check if user exists
    $sql = "SELECT id FROM users WHERE username = ? OR email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $username, $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Username or email already exists']);
        $stmt->close();
        exit;
    }
    $stmt->close();
    
    // Register new user
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);
    $sql = "INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, 0)";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Database error']);
        exit;
    }
    
    $stmt->bind_param("sss", $username, $email, $hashed_password);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Registration successful']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Registration failed']);
    }
    
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}

function verify_turnstile_token($token) {
    $secret_key = '0x4AAAAAADbG5GsYf9Tj-cxHReqUWENXXD4';
    
    $response = file_get_contents('https://challenges.cloudflare.com/turnstile/v0/siteverify', false, stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/json',
            'content' => json_encode([
                'secret' => $secret_key,
                'response' => $token
            ])
        ]
    ]));
    
    return json_decode($response, true);
}
?>