<?php
// ===========================================================
// Archivo: listar_clases.php
// Funcionalidad: Obtiene todas las clases registradas en la base de datos,
// incluyendo la información del profesor asociado a cada clase.
// ===========================================================

// Incluir la conexión a la base de datos
require 'db.php';

try {
    // Consulta SQL para obtener la lista de clases con la información del profesor
    $stmt = $pdo->query("
        SELECT 
            clases.id, 
            clases.fecha, 
            clases.hora_inicio, 
            clases.hora_fin, 
            clases.alumno_nombre, 
            usuarios.nombre AS profesor_nombre 
        FROM clases 
        JOIN usuarios ON clases.profesor_id = usuarios.id
    ");

    // Obtener los resultados en un array asociativo
    $clases = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Enviar los datos en formato JSON
    echo json_encode($clases);

} catch (Exception $e) {
    // En caso de error, devolver un mensaje JSON indicando el fallo
    echo json_encode([
        "success" => false, 
        "message" => "Error al obtener las clases"
    ]);
}
?>
