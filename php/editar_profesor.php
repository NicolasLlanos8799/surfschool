<?php
// ===========================================================
// Archivo: editar_profesor.php
// Funcionalidad: Permite editar y actualizar la información de 
// un profesor en la base de datos a través de una solicitud POST.
// ===========================================================

// Incluir la conexión a la base de datos
require 'db.php';

// Verificar si la solicitud es de tipo POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Obtener los datos enviados desde el formulario o solicitud AJAX
    $id = $_POST['id'] ?? '';           // ID del profesor a editar
    $nombre = $_POST['nombre'] ?? '';   // Nombre del profesor
    $email = $_POST['email'] ?? '';     // Correo electrónico
    $telefono = $_POST['telefono'] ?? '';// Teléfono del profesor
    $tarifa = $_POST['tarifa'] ?? '';   // Tarifa por hora del profesor

    // Validación: Comprobar que todos los campos están completos
    if (empty($id) || empty($nombre) || empty($email) || empty($telefono) || empty($tarifa)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
        exit;
    }

    try {
        // Preparar la consulta SQL para actualizar los datos del profesor
        $stmt = $pdo->prepare("UPDATE usuarios 
                               SET nombre = ?, email = ?, telefono = ?, tarifa_hora = ? 
                               WHERE id = ?");

        // Ejecutar la consulta con los valores proporcionados
        if ($stmt->execute([$nombre, $email, $telefono, $tarifa, $id])) {
            echo json_encode(['success' => true]); // Respuesta exitosa
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al actualizar el profesor']); // Error en la ejecución
        }

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
    }
}
?>
