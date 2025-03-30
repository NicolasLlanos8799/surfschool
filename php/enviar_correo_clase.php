<?php
ob_start();

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/../PHPMailer/src/SMTP.php';
require_once __DIR__ . '/../PHPMailer/src/Exception.php';

if (!isset($GLOBALS['datos_correo'])) {
    ob_end_clean();
    return;
}

$datos = $GLOBALS['datos_correo'];

$nombre_profesor = $datos['nombre_profesor'] ?? '';
$correo_profesor = $datos['correo_profesor'] ?? '';
$nombre_alumno   = $datos['nombre_alumno'] ?? '';
$correo_alumno   = $datos['correo_alumno'] ?? '';
$fecha_clase     = $datos['fecha'] ?? '';
$hora_inicio     = $datos['hora_inicio'] ?? '';
$hora_fin        = $datos['hora_fin'] ?? '';

$mensajeHTML = "
    <h3>📢 Nueva Clase Asignada</h3>
    <p><strong>Alumno:</strong> $nombre_alumno</p>
    <p><strong>Profesor:</strong> $nombre_profesor</p>
    <p><strong>Fecha:</strong> $fecha_clase</p>
    <p><strong>Horario:</strong> $hora_inicio a $hora_fin</p>
    <p>¡Nos vemos en la playa! 🏄‍♂️</p>
";

$contenido_ics = "BEGIN:VCALENDAR\r\n";
$contenido_ics .= "VERSION:2.0\r\n";
$contenido_ics .= "PRODID:-//Escuela de Surf//ES\r\n";
$contenido_ics .= "METHOD:REQUEST\r\n";
$contenido_ics .= "BEGIN:VEVENT\r\n";
$contenido_ics .= "UID:" . uniqid() . "\r\n";
$contenido_ics .= "DTSTAMP:" . gmdate('Ymd\THis\Z') . "\r\n";
$contenido_ics .= "DTSTART:" . gmdate('Ymd\THis\Z', strtotime("$fecha_clase $hora_inicio")) . "\r\n";
$contenido_ics .= "DTEND:" . gmdate('Ymd\THis\Z', strtotime("$fecha_clase $hora_fin")) . "\r\n";
$contenido_ics .= "SUMMARY:Clase de Surf\r\n";
$contenido_ics .= "DESCRIPTION:Clase asignada a $nombre_alumno con el profesor $nombre_profesor.\r\n";
$contenido_ics .= "LOCATION:Playa Principal\r\n";
$contenido_ics .= "END:VEVENT\r\n";
$contenido_ics .= "END:VCALENDAR\r\n";

$archivo_ics = tempnam(sys_get_temp_dir(), 'clase_') . '.ics';
file_put_contents($archivo_ics, $contenido_ics);

$destinatarios = [
    [$correo_profesor, $nombre_profesor],
    [$correo_alumno, $nombre_alumno]
];

foreach ($destinatarios as $dest) {
    [$email, $nombre] = $dest;

    if (empty($email)) continue;

    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'nicollanos8799@gmail.com';
        $mail->Password   = 'xtrjwqqgvmsylqvd';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        $mail->setFrom('nicollanos8799@gmail.com', 'Escuela de Surf');
        $mail->addAddress($email, $nombre);

        $mail->isHTML(true);
        $mail->Subject = '📅 Nueva Clase de Surf Asignada';
        $mail->Body    = $mensajeHTML;
        $mail->addStringAttachment($contenido_ics, 'clase.ics', 'base64', 'text/calendar');

        $mail->send();
    } catch (Exception $e) {
        // Error silencioso
    }
}

unlink($archivo_ics);
ob_end_clean();
