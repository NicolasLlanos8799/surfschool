<?php
// ===========================================================
// Archivo: editar_clase_profesor.php
// Funcionalidad: Permite a un profesor editar una clase suya.
// No puede modificar importe pagado, profesor asignado ni estado.
// ===========================================================

ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json');
session_start();
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';
    $fecha = $_POST['fecha'] ?? '';
    $hora_inicio = $_POST['hora_inicio'] ?? '';
    $hora_fin = $_POST['hora_fin'] ?? '';
    $alumno = $_POST['alumno'] ?? '';
    $email = $_POST['email'] ?? '';
    $telefono = $_POST['telefono'] ?? '';
    $observaciones = $_POST['observaciones'] ?? '';

    if (empty($id) || empty($fecha) || empty($hora_inicio) || empty($hora_fin) || empty($alumno)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos obligatorios deben estar completos']);
        exit;
    }

    // Verificamos que la clase pertenezca al profesor logueado
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

    echo json_encode(['success' => true]);
}
?>
