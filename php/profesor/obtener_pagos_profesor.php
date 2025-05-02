<?php
session_start();
require '../db.php';

$profesorId = $_SESSION['user_id'] ?? null;
if (!$profesorId) {
    echo json_encode(["success" => false, "message" => "No autorizado"]);
    exit;
}

try {
    // 🔹 1. Clases completadas del profesor (aún no pagadas)
    $stmt = $pdo->prepare("
        SELECT 
            ROUND(SUM(TIMESTAMPDIFF(MINUTE, c.hora_inicio, c.hora_fin)) / 60, 2) AS total_horas,
            ROUND(SUM((TIMESTAMPDIFF(MINUTE, c.hora_inicio, c.hora_fin) / 60) * u.tarifa_hora), 2) AS total,
            'pendiente' AS estado
        FROM clases c
        JOIN usuarios u ON c.profesor_id = u.id
        WHERE c.estado = 'completada' 
        AND c.profesor_id = ? 
        AND c.id NOT IN (SELECT clase_id FROM clases_pagadas)
    ");
    $stmt->execute([$profesorId]);
    $completadas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 🔹 2. Pagos ya registrados
    $stmt = $pdo->prepare("
        SELECT 
            p.id, 
            ROUND(COALESCE(p.total_horas, 0), 2) AS total_horas, 
            ROUND(COALESCE(p.total, 0), 2) AS total, 
            p.estado,
            DATE_FORMAT(p.fecha_pago, '%Y-%m-%d') AS fecha_pago
        FROM pagos p
        WHERE p.profesor_id = ?
        ORDER BY p.fecha_pago DESC, p.id DESC
    ");
    $stmt->execute([$profesorId]);
    $registrados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "completadas" => $completadas,
        "registrados" => $registrados
    ]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error al obtener pagos: " . $e->getMessage()]);
}
?>
