<?php
function compressImage($source, $quality = 75) {
    $info = getimagesize($source);
    
    if ($info['mime'] == 'image/jpeg')
        $image = imagecreatefromjpeg($source);
    elseif ($info['mime'] == 'image/gif')
        $image = imagecreatefromgif($source);
    elseif ($info['mime'] == 'image/png')
        $image = imagecreatefrompng($source);
    
    // Scale down to max 800px width
    $maxWidth = 800;
    $width = imagesx($image);
    $height = imagesy($image);
    
    if ($width > $maxWidth) {
        $newHeight = ($maxWidth / $width) * $height;
        $newImage = imagecreatetruecolor($maxWidth, $newHeight);
        imagecopyresampled($newImage, $image, 0, 0, 0, 0, $maxWidth, $newHeight, $width, $height);
        $image = $newImage;
    }
    
    ob_start();
    imagejpeg($image, NULL, $quality);
    $imageData = ob_get_clean();
    imagedestroy($image);
    
    return $imageData;
}
?>