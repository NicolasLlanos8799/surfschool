<?php
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';
    $profesor_id = $_POST['profesor_id'] ?? '';
    $fecha = $_POST['fecha'] ?? '';
    $hora_inicio = $_POST['hora_inicio'] ?? '';
    $hora_fin = $_POST['hora_fin'] ?? '';
    $alumno = $_POST['alumno'] ?? '';

    if (empty($id) || empty($profesor_id) || empty($fecha) || empty($hora_inicio) || empty($hora_fin) || empty($alumno)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE clases SET profesor_id = ?, fecha = ?, hora_inicio = ?, hora_fin = ?, alumno_nombre = ? WHERE id = ?");
    if ($stmt->execute([$profesor_id, $fecha, $hora_inicio, $hora_fin, $alumno, $id])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al actualizar la clase']);
    }
}
?>
