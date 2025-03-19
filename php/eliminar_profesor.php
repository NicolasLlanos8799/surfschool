<?php
// ===========================================================
// Archivo: eliminar_profesor.php
// Funcionalidad: Permite eliminar un profesor de la base de datos
// solo si no tiene clases asignadas. La solicitud se realiza mediante POST.
// ===========================================================

// Incluir la conexión a la base de datos
require 'db.php';

// Verificar que la solicitud sea de tipo POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Obtener el ID del profesor enviado desde la solicitud
    $id = $_POST['id'] ?? '';

    // Validación: Comprobar que se recibió un ID
    if (empty($id)) {
        echo json_encode(['success' => false, 'message' => 'ID del profesor no proporcionado']);
        exit;
    }

    try {
        // Verificar si el profesor tiene clases asignadas antes de eliminarlo
        $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM clases WHERE profesor_id = ?");
        $stmtCheck->execute([$id]);
        $count = $stmtCheck->fetchColumn();

        // Si el profesor tiene clases asignadas, no se puede eliminar
        if ($count > 0) {
            echo json_encode(['success' => false, 'message' => 'No se puede eliminar un profesor con clases asignadas']);
            exit;
        }

        // Si no tiene clases asignadas, proceder a eliminarlo
        $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id = ? AND rol = 'profesor'");
        if ($stmt->execute([$id])) {
            echo json_encode(['success' => true]); // Respuesta exitosa
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al eliminar el profesor']);
        }

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
    }
}
?>
