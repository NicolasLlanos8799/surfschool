<?php
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';
    $nombre = $_POST['nombre'] ?? '';
    $email = $_POST['email'] ?? '';
    $telefono = $_POST['telefono'] ?? '';
    $tarifa = $_POST['tarifa'] ?? '';

    if (empty($id) || empty($nombre) || empty($email) || empty($telefono) || empty($tarifa)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE usuarios SET nombre = ?, email = ?, telefono = ?, tarifa_hora = ? WHERE id = ?");
    if ($stmt->execute([$nombre, $email, $telefono, $tarifa, $id])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al actualizar el profesor']);
    }
}
?>
