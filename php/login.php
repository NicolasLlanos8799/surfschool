<?php
// ===========================================================
// Archivo: login.php
// Funcionalidad: Maneja la autenticación de usuarios en el sistema.
// Verifica las credenciales del usuario y establece la sesión correspondiente.
// Devuelve una respuesta JSON indicando éxito o error en la autenticación.
// ===========================================================

// Iniciar la sesión para almacenar datos del usuario autenticado
session_start();

// Incluir la conexión a la base de datos
require 'db.php';

// Verificar si la solicitud es de tipo POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener los datos del formulario
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    // Preparar la consulta SQL para buscar el usuario en la base de datos
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    // Verificar si el usuario existe y la contraseña es correcta
    if ($user && md5($password) === $user['password']) {
        // Almacenar información del usuario en la sesión
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['rol'] = $user['rol'];
        $_SESSION['nombre'] = $user['nombre'];

        // Redireccionar según el rol del usuario
        if ($user['rol'] === 'admin') {
            echo json_encode(['success' => true, 'redirect' => 'admin.html']);
        } else {
            echo json_encode(['success' => true, 'redirect' => 'profesor.html']);
        }
    } else {
        // Si las credenciales no son correctas, enviar un mensaje de error
        echo json_encode(['success' => false, 'message' => 'Credenciales incorrectas']);
    }
}
?>
