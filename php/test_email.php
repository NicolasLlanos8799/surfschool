<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/../PHPMailer/src/SMTP.php';
require_once __DIR__ . '/../PHPMailer/src/Exception.php';

// ✉️ CONFIGURACIÓN: cambiá esto por tu correo
$correo_destino = 'nicolasllanossw@gmail.com'; // <--- reemplazalo
$nombre_destino = 'Nicolás';
$log_file = __DIR__ . '/log_test_email.txt';

$mail = new PHPMailer(true);
try {
    // Configuración SMTP de Gmail
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'nicollanos8799@gmail.com'; // tu Gmail
    $mail->Password   = 'xtrjwqqgvmsylqvd';         // contraseña de aplicación
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    $mail->setFrom('nicollanos8799@gmail.com', 'Escuela de Surf');
    $mail->addAddress($correo_destino, $nombre_destino);

    // Email
    $mail->isHTML(true);
    $mail->Subject = '📬 Prueba de envío de email desde PHPMailer';
    $mail->Body    = '<p>Este es un correo de <strong>prueba</strong> enviado desde el sistema de Escuela de Surf. 🏄‍♂️</p>';

    $mail->send();

    echo '✅ Correo de prueba enviado con éxito.';
    file_put_contents($log_file, "✅ Enviado correctamente a $correo_destino\n", FILE_APPEND);
} catch (Exception $e) {
    echo '❌ Error al enviar: ' . $mail->ErrorInfo;
    file_put_contents($log_file, "❌ Error al enviar: " . $mail->ErrorInfo . "\n", FILE_APPEND);
}
?>
