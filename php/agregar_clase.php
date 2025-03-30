<?php
ini_set('display_errors', 0); // ✅ Ocultar errores visibles
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json'); // ✅ Forzar JSON

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

    if (empty($profesor_id) || empty($fecha) || empty($hora_inicio) || empty($hora_fin) || empty($alumno)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO clases (profesor_id, fecha, hora_inicio, hora_fin, alumno_nombre, email, telefono, observaciones, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')
    ");
    $insercion = $stmt->execute([$profesor_id, $fecha, $hora_inicio, $hora_fin, $alumno, $email, $telefono, $observaciones]);

    if ($insercion) {

        $stmt_prof = $pdo->prepare("SELECT nombre, email FROM usuarios WHERE id = ? AND rol = 'profesor'");
        $stmt_prof->execute([$profesor_id]);
        $profesor = $stmt_prof->fetch(PDO::FETCH_ASSOC);

        if ($profesor) {
            $GLOBALS['datos_correo'] = [
                'nombre_profesor' => $profesor['nombre'],
                'correo_profesor' => $profesor['email'],
                'nombre_alumno' => $alumno,
                'correo_alumno' => $email,
                'fecha' => $fecha,
                'hora_inicio' => $hora_inicio,
                'hora_fin' => $hora_fin
            ];
            
            ob_start();
            include __DIR__ . '/enviar_correo_clase.php';
            ob_end_clean();
        }
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al asignar la clase']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}
?>
