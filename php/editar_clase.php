<?php
// ===========================================================
// Archivo: editar_clase.php
// Funcionalidad: Permite editar y actualizar una clase existente 
// en la base de datos a través de una solicitud POST.
// ===========================================================

// Incluir la conexión a la base de datos
require 'db.php';

// Verificar si la solicitud es de tipo POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Obtener los datos enviados desde el formulario o solicitud AJAX
    $id = $_POST['id'] ?? '';               // ID de la clase a editar
    $profesor_id = $_POST['profesor_id'] ?? ''; // ID del profesor asignado
    $fecha = $_POST['fecha'] ?? '';         // Fecha de la clase
    $hora_inicio = $_POST['hora_inicio'] ?? ''; // Hora de inicio
    $hora_fin = $_POST['hora_fin'] ?? '';   // Hora de finalización
    $alumno = $_POST['alumno'] ?? '';       // Nombre del alumno

    // Validación: Comprobar que todos los campos están completos
    if (empty($id) || empty($profesor_id) || empty($fecha) || empty($hora_inicio) || empty($hora_fin) || empty($alumno)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
        exit;
    }

    try {
        // Preparar la consulta SQL para actualizar la clase
        $stmt = $pdo->prepare("UPDATE clases 
                               SET profesor_id = ?, fecha = ?, hora_inicio = ?, hora_fin = ?, alumno_nombre = ? 
                               WHERE id = ?");

        // Ejecutar la consulta con los valores proporcionados
        if ($stmt->execute([$profesor_id, $fecha, $hora_inicio, $hora_fin, $alumno, $id])) {
            echo json_encode(['success' => true]); // Respuesta exitosa
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al actualizar la clase']); // Error en la ejecución
        }

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
    }
}
?>
