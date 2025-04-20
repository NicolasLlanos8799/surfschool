<?php
// ===========================================================
// Archivo: editar_clase.php
// Funcionalidad: Permite editar y actualizar una clase existente 
// en la base de datos a través de una solicitud POST.
// También notifica vía email a profesor y alumno sobre la modificación.
// ===========================================================

ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json');
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';
    $profesor_id = $_POST['profesor_id'] ?? '';
    $fecha = $_POST['fecha'] ?? '';
    $hora_inicio = $_POST['hora_inicio'] ?? '';
    $hora_fin = $_POST['hora_fin'] ?? '';
    $alumno = $_POST['alumno'] ?? '';
    $email = $_POST['email'] ?? '';
    $telefono = $_POST['telefono'] ?? '';
    $observaciones = $_POST['observaciones'] ?? '';
    $importe_pagado = isset($_POST['importe_pagado']) ? floatval(str_replace(',', '.', $_POST['importe_pagado'])) : null;


    if (empty($id) || empty($profesor_id) || empty($fecha) || empty($hora_inicio) || empty($hora_fin) || empty($alumno)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos obligatorios deben estar completos']);
        exit;
    }

    // Actualizar la clase
    $stmt = $pdo->prepare("
    UPDATE clases SET 
        profesor_id = ?, 
        fecha = ?, 
        hora_inicio = ?, 
        hora_fin = ?, 
        alumno_nombre = ?, 
        email = ?, 
        telefono = ?, 
        observaciones = ?, 
        importe_pagado = ?
    WHERE id = ?
");
$stmt->execute([$profesor_id, $fecha, $hora_inicio, $hora_fin, $alumno, $email, $telefono, $observaciones, $importe_pagado, $id]);


    // Recalcular el pago del profesor después de editar la clase
    $stmt = $pdo->prepare("
        SELECT SUM(TIMESTAMPDIFF(HOUR, hora_inicio, hora_fin)) AS total_horas 
        FROM clases WHERE profesor_id = ? AND estado = 'pendiente'
    ");
    $stmt->execute([$profesor_id]);
    $resultado = $stmt->fetch();
    $total_horas = $resultado['total_horas'];

    // Obtener la tarifa del profesor
    $stmt = $pdo->prepare("SELECT nombre, email, tarifa_hora FROM usuarios WHERE id = ? AND rol = 'profesor'");
    $stmt->execute([$profesor_id]);
    $profesor = $stmt->fetch();

    if ($profesor) {
        $total_pagar = $total_horas * $profesor['tarifa_hora'];

        // Actualizar el pago si existe
        $stmt = $pdo->prepare("UPDATE pagos SET total_horas = ?, total = ? WHERE profesor_id = ? AND estado = 'pendiente'");
        $stmt->execute([$total_horas, $total_pagar, $profesor_id]);

        // Enviar email notificando edición
        $GLOBALS['datos_correo'] = [
            'nombre_profesor' => $profesor['nombre'],
            'correo_profesor' => $profesor['email'],
            'nombre_alumno' => $alumno,
            'correo_alumno' => $email,
            'fecha' => $fecha,
            'hora_inicio' => $hora_inicio,
            'hora_fin' => $hora_fin,
            'tipo' => 'editar'
        ];

        ob_start();
        include __DIR__ . '/enviar_correo_clase.php';
        ob_end_clean();
    }

    echo json_encode(['success' => true]);
}
?>
