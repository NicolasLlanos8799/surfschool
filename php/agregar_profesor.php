<?php
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre = trim($_POST['nombre'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');
    $telefono = trim($_POST['telefono'] ?? '');
    $tarifa_hora = trim($_POST['tarifa_hora'] ?? '');

    // Depuración: Ver los valores recibidos
    error_log("Valores recibidos: Nombre=$nombre, Email=$email, Password=$password, Teléfono=$telefono, Tarifa=$tarifa_hora");

    if (empty($nombre) || empty($email) || empty($password) || empty($telefono) || empty($tarifa_hora)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
        exit;
    }

    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, email, password, telefono, tarifa_hora, rol) VALUES (?, ?, ?, ?, ?, 'profesor')");
    if ($stmt->execute([$nombre, $email, $password_hash, $telefono, $tarifa_hora])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al agregar el profesor']);
    }
}
?>
