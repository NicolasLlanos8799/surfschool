<?php
// ===========================================================
// Archivo: editar_clase.php
// Funcionalidad: Permite editar y actualizar una clase existente 
// en la base de datos a través de una solicitud POST.
// ===========================================================

// Incluir la conexión a la base de datos
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

    // Actualizar la clase
    $stmt = $pdo->prepare("UPDATE clases SET profesor_id = ?, fecha = ?, hora_inicio = ?, hora_fin = ?, alumno_nombre = ? WHERE id = ?");
    $stmt->execute([$profesor_id, $fecha, $hora_inicio, $hora_fin, $alumno, $id]);

    // Recalcular el pago del profesor después de editar la clase
    $stmt = $pdo->prepare("
        SELECT SUM(TIMESTAMPDIFF(HOUR, hora_inicio, hora_fin)) AS total_horas 
        FROM clases WHERE profesor_id = ? AND estado = 'pendiente'
    ");
    $stmt->execute([$profesor_id]);
    $resultado = $stmt->fetch();
    $total_horas = $resultado['total_horas'];

    // Obtener la tarifa del profesor
    $stmt = $pdo->prepare("SELECT tarifa_hora FROM usuarios WHERE id = ?");
    $stmt->execute([$profesor_id]);
    $profesor = $stmt->fetch();

    $total_pagar = $total_horas * $profesor['tarifa_hora'];

    // Actualizar el pago si existe
    $stmt = $pdo->prepare("UPDATE pagos SET total_horas = ?, total = ? WHERE profesor_id = ? AND estado = 'pendiente'");
    $stmt->execute([$total_horas, $total_pagar, $profesor_id]);

    echo json_encode(['success' => true]);
}
?>
