<?php
// ===========================================================
// Archivo: marcar_completada.php
// Funcionalidad: Cambia el estado de una clase a "completada"
// ===========================================================

header('Content-Type: application/json');
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';

    if (empty($id)) {
        echo json_encode(['success' => false, 'message' => 'ID de clase faltante']);
        exit;
    }

    // Verificar si ya está completada
    $stmt = $pdo->prepare("SELECT estado FROM clases WHERE id = ?");
    $stmt->execute([$id]);
    $clase = $stmt->fetch();

    if (!$clase) {
        echo json_encode(['success' => false, 'message' => 'Clase no encontrada']);
        exit;
    }

    if ($clase['estado'] === 'completada') {
        echo json_encode(['success' => false, 'message' => 'La clase ya está marcada como completada']);
        exit;
    }

    // Actualizar estado
    $stmt = $pdo->prepare("UPDATE clases SET estado = 'completada' WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}
?>
