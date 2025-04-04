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
$tipo            = $datos['tipo'] ?? 'crear';

$tituloCorreo = match ($tipo) {
    'editar'   => '✏️ Clase de Surf Kite Modificada',
    'eliminar' => '🚫 Clase de Surf Kite Cancelada',
    default    => '📅 Nueva Clase de Surf Kite Asignada'
};

$mensajeIntro = match ($tipo) {
    'editar'   => '⚠️ Se ha modificado una clase de Surf Kite previamente asignada.',
    'eliminar' => '🚨 La siguiente clase de Surf Kite fue cancelada.',
    default    => 'Se te ha asignado una nueva clase de Surf Kite.'
};

// UID único por clase
$uid = 'clase-' . uniqid() . '@escueladesurf';
$method = $tipo === 'eliminar' ? 'CANCEL' : 'REQUEST';
$sequence = match ($tipo) {
    'crear' => 0,
    'editar' => 1,
    'eliminar' => 2,
    default => 0
};

$dtstamp = gmdate('Ymd\THis\Z');
$dtstart = gmdate('Ymd\THis\Z', strtotime("$fecha_clase $hora_inicio"));
$dtend   = gmdate('Ymd\THis\Z', strtotime("$fecha_clase $hora_fin"));

$contenido_ics = "BEGIN:VCALENDAR\r\n";
$contenido_ics .= "VERSION:2.0\r\n";
$contenido_ics .= "PRODID:-//Escuela de Surf//ES\r\n";
$contenido_ics .= "METHOD:$method\r\n";
$contenido_ics .= "BEGIN:VEVENT\r\n";
$contenido_ics .= "UID:$uid\r\n";
$contenido_ics .= "SEQUENCE:$sequence\r\n";
$contenido_ics .= "DTSTAMP:$dtstamp\r\n";
$contenido_ics .= "DTSTART:$dtstart\r\n";
$contenido_ics .= "DTEND:$dtend\r\n";
$contenido_ics .= "SUMMARY:" . match ($tipo) {
    'editar' => 'Clase de Surf Kite Editada',
    'eliminar' => 'Clase de Surf Kite CANCELADA',
    default => 'Clase de Surf Kite'
} . "\r\n";
if ($tipo === 'eliminar') {
    $contenido_ics .= "STATUS:CANCELLED\r\n";
}
$contenido_ics .= "DESCRIPTION:Clase con $nombre_alumno y $nombre_profesor.\r\n";
$contenido_ics .= "LOCATION:Playa Principal\r\n";
$contenido_ics .= "ORGANIZER;CN=Escuela de Surf:mailto:nicollanos8799@gmail.com\r\n";
$contenido_ics .= "ATTENDEE;CN=$nombre_profesor;RSVP=TRUE;PARTSTAT=NEEDS-ACTION:mailto:$correo_profesor\r\n";
$contenido_ics .= "ATTENDEE;CN=$nombre_alumno;RSVP=TRUE;PARTSTAT=NEEDS-ACTION:mailto:$correo_alumno\r\n";
$contenido_ics .= "END:VEVENT\r\n";
$contenido_ics .= "END:VCALENDAR\r\n";

$mensajeHTML = "
    <h3>$tituloCorreo</h3>
    <p style='margin-top:10px;'>❗️ <strong>IMPORTANTE:</strong> Para cancelar o modificar esta clase, comunicate con la escuela de surf por correo a <a href='mailto:escuela@surf.com'>escuela@surf.com</a> o por WhatsApp al <a href='tel:+1234513'>+1234513</a>.</p>
    <p>$mensajeIntro</p>
    <p><strong>Alumno:</strong> $nombre_alumno</p>
    <p><strong>Profesor:</strong> $nombre_profesor</p>
    <p><strong>Fecha:</strong> " . date('d-m-Y', strtotime($fecha_clase)) . "</p>
    <p><strong>Horario:</strong> $hora_inicio a $hora_fin</p>
    <p><strong>Ubicación:</strong> Playa Principal</p>
    <p style='margin-top:20px;'>📲 <em>Para agregar esta clase a tu calendario, abrí el archivo adjunto llamado <strong>clase.ics</strong>.</em></p>
";


$archivo_ics = tempnam(sys_get_temp_dir(), 'clase_') . '.ics';
file_put_contents($archivo_ics, $contenido_ics);

$destinatarios = [
    [$correo_profesor, $nombre_profesor],
    [$correo_alumno, $nombre_alumno]
];

foreach ($destinatarios as [$email, $nombre]) {
    if (empty($email)) continue;

    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'nicollanos8799@gmail.com';
        $mail->Password = 'xtrjwqqgvmsylqvd';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        $mail->setFrom('nicollanos8799@gmail.com', 'Escuela de Surf');
        $mail->addAddress($email, $nombre);
        $mail->isHTML(true);
        $mail->Subject = '=?UTF-8?B?' . base64_encode($tituloCorreo) . '?=';
        $mail->Body = $mensajeHTML;
        $mail->addStringAttachment($contenido_ics, 'clase.ics', 'base64', 'text/calendar');
        $mail->send();
    } catch (Exception $e) {
        // Silenciar error
    }
}

unlink($archivo_ics);
ob_end_clean();
