<?php
// ===========================================================
// Archivo: clases_por_pago.php
// Funcionalidad: Devuelve todas las clases asociadas a un pago
// ===========================================================

require 'db.php';
header('Content-Type: application/json');

$pago_id = $_GET['pago_id'] ?? '';

if (empty($pago_id)) {
    echo json_encode(['success' => false, 'message' => 'ID de pago no proporcionado']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT 
        c.fecha,
        c.hora_inicio,
        c.hora_fin,
        c.alumno_nombre
    FROM clases_pagadas cp
    JOIN clases c ON cp.clase_id = c.id
    WHERE cp.pago_id = ?
    ORDER BY c.fecha, c.hora_inicio");

    $stmt->execute([$pago_id]);
    $clases = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'clases' => $clases]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error al obtener las clases pagadas']);
}
?>
