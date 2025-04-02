<?php
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json');
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';

    if (empty($id)) {
        echo json_encode(['success' => false, 'message' => 'ID de clase no proporcionado']);
        exit;
    }

    // Obtener los datos de la clase antes de eliminarla
    $stmt = $pdo->prepare("SELECT * FROM clases WHERE id = ?");
    $stmt->execute([$id]);
    $clase = $stmt->fetch();

    if (!$clase) {
        echo json_encode(['success' => false, 'message' => 'Clase no encontrada']);
        exit;
    }

    $profesor_id = $clase['profesor_id'];

    // Obtener datos del profesor (nombre + email)
    $stmt = $pdo->prepare("SELECT nombre, email, tarifa_hora FROM usuarios WHERE id = ?");
    $stmt->execute([$profesor_id]);
    $profesor = $stmt->fetch();

    // Eliminar la clase
    $stmt = $pdo->prepare("DELETE FROM clases WHERE id = ?");
    $stmt->execute([$id]);

    // Recalcular pagos del profesor
    $stmt = $pdo->prepare("SELECT SUM(TIMESTAMPDIFF(HOUR, hora_inicio, hora_fin)) AS total_horas FROM clases WHERE profesor_id = ? AND estado = 'pendiente'");
    $stmt->execute([$profesor_id]);
    $resultado = $stmt->fetch();
    $total_horas = $resultado['total_horas'] ?? 0;

    $total_pagar = $total_horas * $profesor['tarifa_hora'];

    $stmt = $pdo->prepare("UPDATE pagos SET total_horas = ?, total = ? WHERE profesor_id = ? AND estado = 'pendiente'");
    $stmt->execute([$total_horas, $total_pagar, $profesor_id]);

    // Enviar correo de cancelación (si hay datos suficientes)
    if ($profesor && !empty($clase['email'])) {
        $GLOBALS['datos_correo'] = [
            'nombre_profesor' => $profesor['nombre'],
            'correo_profesor' => $profesor['email'],
            'nombre_alumno' => $clase['alumno_nombre'],
            'correo_alumno' => $clase['email'],
            'fecha' => $clase['fecha'],
            'hora_inicio' => $clase['hora_inicio'],
            'hora_fin' => $clase['hora_fin'],
            'tipo' => 'eliminar'
        ];

        ob_start();
        include __DIR__ . '/enviar_correo_clase.php';
        ob_end_clean();
    }

    echo json_encode(['success' => true]);
}
?>
