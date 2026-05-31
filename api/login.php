<?php
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
session_start();
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $username = trim($data['username'] ?? '');
    $password = $data['password'] ?? '';
    $captcha_token = $data['captcha_token'] ?? '';
    
    if (!$username || !$password) {
        echo json_encode(['success' => false, 'message' => 'Username and password required']);
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
    
    $sql = "SELECT id, password, is_admin FROM users WHERE username = ?";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Database error']);
        exit;
    }
    
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 1) {
        $row = $result->fetch_assoc();
        if (password_verify($password, $row['password'])) {
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['username'] = $username;
            $_SESSION['is_admin'] = (bool)$row['is_admin'];
            echo json_encode(['success' => true, 'message' => 'Login successful', 'is_admin' => (bool)$row['is_admin']]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid password']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'User not found']);
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