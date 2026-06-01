<?php
header('Content-Type: application/json');
session_start();
require __DIR__ . '/config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $user_id = $_SESSION['user_id'];
    $item_id = intval($data['item_id'] ?? 0);
    $use_saved_payment = $data['use_saved_payment'] ?? false;
    $use_shipping = $data['use_shipping'] ?? false;
    $save_payment = $data['save_payment'] ?? false;
    $save_address = $data['save_address'] ?? false;
    
    if (!$item_id) {
        echo json_encode(['success' => false, 'message' => 'Invalid item']);
        exit;
    }
    
    // Get item details
    $sql = "SELECT * FROM items WHERE id = ? AND is_sold = 0";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
        exit;
    }
    $stmt->bind_param("i", $item_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Item not available']);
        $stmt->close();
        exit;
    }
    
    $item = $result->fetch_assoc();
    $stmt->close();
    
    // Check if trying to buy own item
    if ($item['user_id'] == $user_id) {
        echo json_encode(['success' => false, 'message' => 'You cannot buy your own item']);
        exit;
    }
    
    // Mark item as sold
    $sql = "UPDATE items SET is_sold = 1, sold_to = ?, sold_at = NOW() WHERE id = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
        exit;
    }
    $stmt->bind_param("ii", $user_id, $item_id);
    
    if (!$stmt->execute()) {
        echo json_encode(['success' => false, 'message' => 'Error processing purchase: ' . $stmt->error]);
        $stmt->close();
        exit;
    }
    $stmt->close();
    
    // Save payment details if requested
    if ($save_payment && !$use_saved_payment) {
        $card_holder = $data['card_holder_name'] ?? '';
        $card_number = $data['card_number'] ?? '';
        $expiry = $data['expiry_date'] ?? '';
        $cvv = $data['cvv'] ?? '';
        
        if ($card_holder && $card_number && $expiry && $cvv) {
            $check_sql = "SELECT id FROM payment_details WHERE user_id = ?";
            $check_stmt = $conn->prepare($check_sql);
            if ($check_stmt) {
                $check_stmt->bind_param("i", $user_id);
                $check_stmt->execute();
                $check_result = $check_stmt->get_result();
                
                if ($check_result->num_rows > 0) {
                    $update_sql = "UPDATE payment_details SET card_holder_name = ?, card_number = ?, expiry_date = ?, cvv = ? WHERE user_id = ?";
                    $update_stmt = $conn->prepare($update_sql);
                    if ($update_stmt) {
                        $update_stmt->bind_param("ssssi", $card_holder, $card_number, $expiry, $cvv, $user_id);
                        $update_stmt->execute();
                        $update_stmt->close();
                    }
                } else {
                    $insert_sql = "INSERT INTO payment_details (user_id, card_holder_name, card_number, expiry_date, cvv) VALUES (?, ?, ?, ?, ?)";
                    $insert_stmt = $conn->prepare($insert_sql);
                    if ($insert_stmt) {
                        $insert_stmt->bind_param("issss", $user_id, $card_holder, $card_number, $expiry, $cvv);
                        $insert_stmt->execute();
                        $insert_stmt->close();
                    }
                }
                $check_stmt->close();
            }
        }
    }
    
    // Save shipping address if requested
    if ($use_shipping && $save_address) {
        $full_name = $data['full_name'] ?? '';
        $phone_number = $data['phone_number'] ?? '';
        $street_address = $data['street_address'] ?? '';
        $city = $data['city'] ?? '';
        $province = $data['province'] ?? '';
        $postal_code = $data['postal_code'] ?? '';
        
        if ($full_name && $phone_number && $street_address && $city && $province && $postal_code) {
            $check_sql = "SELECT id FROM shipping_addresses WHERE user_id = ?";
            $check_stmt = $conn->prepare($check_sql);
            if ($check_stmt) {
                $check_stmt->bind_param("i", $user_id);
                $check_stmt->execute();
                $check_result = $check_stmt->get_result();
                
                if ($check_result->num_rows > 0) {
                    $update_sql = "UPDATE shipping_addresses SET full_name = ?, phone_number = ?, street_address = ?, city = ?, province = ?, postal_code = ? WHERE user_id = ?";
                    $update_stmt = $conn->prepare($update_sql);
                    if ($update_stmt) {
                        $update_stmt->bind_param("ssssssi", $full_name, $phone_number, $street_address, $city, $province, $postal_code, $user_id);
                        $update_stmt->execute();
                        $update_stmt->close();
                    }
                } else {
                    $insert_sql = "INSERT INTO shipping_addresses (user_id, full_name, phone_number, street_address, city, province, postal_code) VALUES (?, ?, ?, ?, ?, ?, ?)";
                    $insert_stmt = $conn->prepare($insert_sql);
                    if ($insert_stmt) {
                        $insert_stmt->bind_param("issssss", $user_id, $full_name, $phone_number, $street_address, $city, $province, $postal_code);
                        $insert_stmt->execute();
                        $insert_stmt->close();
                    }
                }
                $check_stmt->close();
            }
        }
    }
    
    echo json_encode(['success' => true, 'message' => 'Purchase completed successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}