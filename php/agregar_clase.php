<?php
// ===========================================================
// Archivo: agregar_clase.php
// Funcionalidad: Permite agregar una nueva clase a la base de datos,
// asignando un profesor, fecha, horario y alumno.
// ===========================================================

require 'db.php'; // Importa la conexión a la base de datos

// Verifica que la solicitud sea de tipo POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtiene los datos enviados desde la solicitud POST
    $profesor_id = $_POST['profesor_id'] ?? '';
    $fecha = $_POST['fecha'] ?? '';
    $hora_inicio = $_POST['hora_inicio'] ?? '';
    $hora_fin = $_POST['hora_fin'] ?? '';
    $alumno = $_POST['alumno'] ?? '';

    // Validación: Verifica que todos los campos obligatorios estén presentes
    if (empty($profesor_id) || empty($fecha) || empty($hora_inicio) || empty($hora_fin) || empty($alumno)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
        exit;
    }

    // Prepara la consulta SQL para insertar la nueva clase en la base de datos
    $stmt = $pdo->prepare("INSERT INTO clases (profesor_id, fecha, hora_inicio, hora_fin, alumno_nombre, estado) 
                           VALUES (?, ?, ?, ?, ?, 'pendiente')");
    
    // Ejecuta la consulta con los valores proporcionados
    if ($stmt->execute([$profesor_id, $fecha, $hora_inicio, $hora_fin, $alumno])) {
        echo json_encode(['success' => true]); // Éxito
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al asignar la clase']); // Error en la ejecución
    }
}
?>
