<?php
// ===========================================================
// Archivo: listar_profesores.php
// Funcionalidad: Obtiene la lista de todos los profesores registrados en la base de datos.
// Devuelve la información en formato JSON para ser consumida por el frontend.
// ===========================================================

// Incluir la conexión a la base de datos
require 'db.php';

try {
    // Consulta SQL para obtener los datos de los profesores
    $stmt = $pdo->query("SELECT id, nombre, email, telefono, tarifa_hora FROM usuarios WHERE rol = 'profesor'");

    // Obtener los resultados en un array asociativo
    $profesores = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Especificar el tipo de contenido como JSON
    header('Content-Type: application/json');

    // Devolver los datos en formato JSON
    echo json_encode($profesores);

} catch (Exception $e) {
    // En caso de error, devolver un mensaje JSON indicando el fallo
    echo json_encode([
        "success" => false, 
        "message" => "Error al obtener la lista de profesores"
    ]);
}
?>
