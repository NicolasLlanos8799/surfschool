<?php
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';

    if (empty($id)) {
        echo json_encode(['success' => false, 'message' => 'ID del profesor no proporcionado']);
        exit;
    }

    // Verificar si el profesor tiene clases asignadas antes de eliminar
    $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM clases WHERE profesor_id = ?");
    $stmtCheck->execute([$id]);
    $count = $stmtCheck->fetchColumn();

    if ($count > 0) {
        echo json_encode(['success' => false, 'message' => 'No se puede eliminar un profesor con clases asignadas']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id = ? AND rol = 'profesor'");
    if ($stmt->execute([$id])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al eliminar el profesor']);
    }
}
?>
