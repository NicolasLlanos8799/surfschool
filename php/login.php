<?php
// ===========================================================
// Archivo: login.php
// Funcionalidad: Maneja la autenticación de usuarios en el sistema.
// ===========================================================

session_start();
require 'db.php';

// Mostrar errores en desarrollo
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    // Buscar el usuario en la tabla 'usuarios'
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && md5($password) === $user['password']) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['rol'] = $user['rol'];
        $_SESSION['nombre'] = $user['nombre'];

        if ($user['rol'] === 'admin') {
            echo json_encode([
                'success' => true,
                'redirect' => 'admin.html'
            ]);
        } else {
            // Profesor: devolver también el ID
            echo json_encode([
                'success' => true,
                'redirect' => 'profesor.html',
                'id_profesor' => $user['id']
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Credenciales incorrectas.'
        ]);
    }
}
