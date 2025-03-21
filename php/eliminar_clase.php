<?php
// ===========================================================
// Archivo: eliminar_clase.php
// Funcionalidad: Permite eliminar una clase de la base de datos.
// ===========================================================

require 'db.php'; // Importa la conexión a la base de datos

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';

    // Validar que el ID de la clase esté presente
    if (empty($id)) {
        echo json_encode(['success' => false, 'message' => 'ID de clase no proporcionado']);
        exit;
    }

    // Intentar eliminar la clase
    $stmt = $pdo->prepare("DELETE FROM clases WHERE id = ?");
    if ($stmt->execute([$id])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al eliminar la clase']);
    }
}
?>
