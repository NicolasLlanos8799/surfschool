<?php
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $profesor_id = $_POST['profesor_id'] ?? '';
    $fecha = $_POST['fecha'] ?? '';
    $hora_inicio = $_POST['hora_inicio'] ?? '';
    $hora_fin = $_POST['hora_fin'] ?? '';
    $alumno = $_POST['alumno'] ?? '';
    $email = $_POST['email'] ?? '';
    $telefono = $_POST['telefono'] ?? '';
    $observaciones = $_POST['observaciones'] ?? '';

    // Validación
    if (empty($profesor_id) || empty($fecha) || empty($hora_inicio) || empty($hora_fin) || empty($alumno)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO clases (profesor_id, fecha, hora_inicio, hora_fin, alumno_nombre, email, telefono, observaciones, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')
    ");
    if ($stmt->execute([$profesor_id, $fecha, $hora_inicio, $hora_fin, $alumno, $email, $telefono, $observaciones])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al asignar la clase']);
    }
}
?>
