<?php
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre = $_POST['nombre'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $telefono = $_POST['telefono'] ?? '';
    $tarifa_hora = $_POST['tarifa_hora'] ?? '';

    if (empty($nombre) || empty($email) || empty($password) || empty($telefono) || empty($tarifa_hora)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
        exit;
    }

    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, email, password, telefono, tarifa_hora, rol) VALUES (?, ?, ?, ?, ?, 'profesor')");
    if ($stmt->execute([$nombre, $email, $passwordHash, $telefono, $tarifa_hora])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al agregar el profesor']);
    }
}
?>
