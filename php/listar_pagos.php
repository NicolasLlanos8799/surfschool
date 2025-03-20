<?php
// ===========================================================
// Archivo: listar_pagos.php
// Funcionalidad: Obtiene todos los pagos registrados en la base de datos,
// separando los pagos pendientes (clases aún no pagadas) y pagos realizados.
// ===========================================================

require 'db.php'; // Conexión a la base de datos

try {
    // 🔹 1. Obtener pagos pendientes (estimados, sin registrar en la tabla "pagos")
    $stmt = $pdo->query("
        SELECT 
            NULL AS id,  -- Pagos pendientes aún no tienen ID asignado
            u.nombre AS profesor_nombre, 
            COALESCE(SUM(TIMESTAMPDIFF(HOUR, c.hora_inicio, c.hora_fin)), 0) AS total_horas, 
            COALESCE(SUM(TIMESTAMPDIFF(HOUR, c.hora_inicio, c.hora_fin) * u.tarifa_hora), 0) AS total, 
            'pendiente' AS estado
        FROM clases c
        JOIN usuarios u ON c.profesor_id = u.id
        WHERE c.estado = 'pendiente'
        GROUP BY c.profesor_id
    ");

    $pagos_pendientes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 🔹 2. Obtener pagos realizados (ya registrados en la tabla "pagos")
    $stmt = $pdo->query("
        SELECT 
            p.id, 
            u.nombre AS profesor_nombre, 
            COALESCE(p.total_horas, 0) AS total_horas, 
            COALESCE(p.total, 0) AS total, 
            p.estado
        FROM pagos p 
        JOIN usuarios u ON p.profesor_id = u.id
        WHERE p.estado != 'pendiente'
    ");

    $pagos_realizados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 🔹 3. Enviar ambos resultados en formato JSON
    echo json_encode([
        "pendientes" => $pagos_pendientes,
        "realizados" => $pagos_realizados
    ]);
    
} catch (Exception $e) {
    // Enviar un mensaje de error en caso de fallo en la consulta SQL
    echo json_encode(["success" => false, "message" => "Error al obtener los pagos: " . $e->getMessage()]);
}
?>
