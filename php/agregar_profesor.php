<?php
// ===========================================================
// Archivo: agregar_profesor.php
// Funcionalidad: Permite registrar un nuevo profesor en la base de datos,
// incluyendo sus datos personales, tarifa por hora y credenciales de acceso.
// ===========================================================

require 'db.php'; // Importa la conexión a la base de datos

// Verifica que la solicitud sea de tipo POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtiene y limpia los datos enviados desde el formulario
    $nombre = trim($_POST['nombre'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');
    $telefono = trim($_POST['telefono'] ?? '');
    $tarifa_hora = trim($_POST['tarifa_hora'] ?? '');

    // Depuración: Registrar en el log los valores recibidos para verificar
    error_log("Valores recibidos: Nombre=$nombre, Email=$email, Password=$password, Teléfono=$telefono, Tarifa=$tarifa_hora");

    // Validación: Verifica que todos los campos obligatorios estén completos
    if (empty($nombre) || empty($email) || empty($password) || empty($telefono) || empty($tarifa_hora)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
        exit;
    }

    // Encriptar la contraseña antes de guardarla en la base de datos
    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    
    // Prepara la consulta SQL para insertar un nuevo profesor en la base de datos
    $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, email, password, telefono, tarifa_hora, rol) 
                           VALUES (?, ?, ?, ?, ?, 'profesor')");

    // Ejecuta la consulta con los valores proporcionados
    if ($stmt->execute([$nombre, $email, $password_hash, $telefono, $tarifa_hora])) {
        echo json_encode(['success' => true]); // Éxito en la inserción
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al agregar el profesor']); // Error en la ejecución
    }
}
?>
