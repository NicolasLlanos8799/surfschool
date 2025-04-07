<?php
require 'db.php';

try {
    // 🔹 1. Clases completadas (aún no pagadas)
    $stmt = $pdo->query("
        SELECT 
            u.id AS profesor_id,
            u.nombre AS profesor_nombre,
            COALESCE(SUM(TIMESTAMPDIFF(HOUR, c.hora_inicio, c.hora_fin)), 0) AS total_horas,
            COALESCE(SUM(TIMESTAMPDIFF(HOUR, c.hora_inicio, c.hora_fin) * u.tarifa_hora), 0) AS total,
            'pendiente' AS estado
        FROM clases c
        JOIN usuarios u ON c.profesor_id = u.id
        WHERE c.estado = 'completada' 
        AND c.id NOT IN (SELECT clase_id FROM clases_pagadas)
        GROUP BY c.profesor_id
    ");
    $completadas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 🔹 2. Pagos ya registrados
    $stmt = $pdo->query("
        SELECT 
            p.id,
            u.nombre AS profesor_nombre,
            p.total_horas,
            p.total,
            p.estado,
            DATE_FORMAT(p.fecha_pago, '%Y-%m-%d') AS fecha_pago
        FROM pagos p
        JOIN usuarios u ON p.profesor_id = u.id
        ORDER BY p.fecha_pago DESC
    ");
    $registrados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "completadas" => $completadas,
        "registrados" => $registrados
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error al obtener los pagos: " . $e->getMessage()]);
}
?>
