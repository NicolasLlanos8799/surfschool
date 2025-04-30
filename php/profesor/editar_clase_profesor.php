<?php
// ===========================================================
// Archivo: editar_clase_profesor.php
// Funcionalidad: Permite a un profesor editar una clase suya.
// También envía correo a profesor y alumno.
// No puede modificar importe pagado, profesor asignado ni estado.
// ===========================================================

ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json');
session_start();
require '../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';
    $fecha = $_POST['fecha'] ?? '';
    $hora_inicio = $_POST['hora_inicio'] ?? '';
    $hora_fin = $_POST['hora_fin'] ?? '';
    $alumno = trim($_POST['alumno'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $telefono = trim($_POST['telefono'] ?? '');
    $observaciones = trim($_POST['observaciones'] ?? '');

    if (empty($id) || empty($fecha) || empty($hora_inicio) || empty($hora_fin) || empty($alumno)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos obligatorios deben estar completos']);
        exit;
    }

    if (strtotime($hora_inicio) >= strtotime($hora_fin)) {
        echo json_encode(['success' => false, 'message' => 'La hora de inicio debe ser anterior a la hora de fin.']);
        exit;
    }

    $profesorId = $_SESSION['user_id'] ?? null;
    if (!$profesorId) {
        echo json_encode(['success' => false, 'message' => 'No autorizado']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM clases WHERE id = ? AND profesor_id = ?");
    $stmt->execute([$id, $profesorId]);
    $clase = $stmt->fetch();

    if (!$clase) {
        echo json_encode(['success' => false, 'message' => 'Clase no encontrada o no pertenece al profesor']);
        exit;
    }

    // Actualizamos solo los campos permitidos
    $stmt = $pdo->prepare("
        UPDATE clases 
        SET fecha = ?, hora_inicio = ?, hora_fin = ?, alumno_nombre = ?, email = ?, telefono = ?, observaciones = ?
        WHERE id = ? AND profesor_id = ?
    ");
    $stmt->execute([$fecha, $hora_inicio, $hora_fin, $alumno, $email, $telefono, $observaciones, $id, $profesorId]);

    // 🔔 Notificar por correo al profesor y alumno
    $stmt = $pdo->prepare("SELECT nombre, email FROM usuarios WHERE id = ?");
    $stmt->execute([$profesorId]);
    $profesor = $stmt->fetch();

    if ($profesor) {
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
        include __DIR__ . '/../enviar_correo_clase.php';  // 👈 mismo archivo usado por admin
        ob_end_clean();
    }

    echo json_encode(['success' => true]);
}
