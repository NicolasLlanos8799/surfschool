<?php
require 'db.php'; // Conexión a la base de datos

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';

    if (empty($id)) {
        echo json_encode(['success' => false, 'message' => 'ID de clase no proporcionado']);
        exit;
    }

    // Obtener el profesor de la clase antes de eliminarla
    $stmt = $pdo->prepare("SELECT profesor_id FROM clases WHERE id = ?");
    $stmt->execute([$id]);
    $clase = $stmt->fetch();

    if (!$clase) {
        echo json_encode(['success' => false, 'message' => 'Clase no encontrada']);
        exit;
    }

    $profesor_id = $clase['profesor_id'];

    // Eliminar la clase
    $stmt = $pdo->prepare("DELETE FROM clases WHERE id = ?");
    $stmt->execute([$id]);

    // Recalcular pagos del profesor
    $stmt = $pdo->prepare("SELECT SUM(TIMESTAMPDIFF(HOUR, hora_inicio, hora_fin)) AS total_horas FROM clases WHERE profesor_id = ? AND estado = 'pendiente'");
    $stmt->execute([$profesor_id]);
    $resultado = $stmt->fetch();
    $total_horas = $resultado['total_horas'] ?? 0;

    // Obtener tarifa por hora del profesor
    $stmt = $pdo->prepare("SELECT tarifa_hora FROM usuarios WHERE id = ?");
    $stmt->execute([$profesor_id]);
    $profesor = $stmt->fetch();
    $total_pagar = $total_horas * $profesor['tarifa_hora'];

    // Actualizar pagos en la base de datos
    $stmt = $pdo->prepare("UPDATE pagos SET total_horas = ?, total = ? WHERE profesor_id = ? AND estado = 'pendiente'");
    $stmt->execute([$total_horas, $total_pagar, $profesor_id]);

    echo json_encode(['success' => true]);
}
?>
