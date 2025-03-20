<?php
// ===========================================================
// Archivo: listar_pagos.php
// Funcionalidad: Obtiene todos los pagos registrados en la base de datos,
// incluyendo el nombre del profesor asociado a cada pago.
// ===========================================================

// Incluir la conexión a la base de datos
require 'db.php';

try {
    // Consulta SQL para obtener los pagos con la información del profesor asociado
    $stmt = $pdo->query("
        SELECT 
            p.id, 
            u.nombre AS profesor_nombre, 
            COALESCE(p.total_horas, 0) AS total_horas, 
            COALESCE(p.total, 0) AS total, 
            p.estado 
        FROM pagos p 
        JOIN usuarios u ON p.profesor_id = u.id
    ");

    // Obtener los resultados en un array asociativo
    $pagos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Enviar los datos en formato JSON
    echo json_encode($pagos);

} catch (Exception $e) {
    // En caso de error, devolver un mensaje JSON indicando el fallo
    echo json_encode([
        "success" => false, 
        "message" => "Error al obtener los pagos"
    ]);
}
?>
