<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require 'db.php'; // Asegurate que este archivo exista y contenga $pdo correctamente

$anio = $_GET['anio'] ?? null;
$mes = $_GET['mes'] ?? null;

if (!$anio || !$mes) {
    echo json_encode(["error" => "Faltan parámetros"]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            clases.fecha AS fecha_clase,
            usuarios.nombre AS profesor,
            clases.alumno_nombre AS alumno,
            clases.importe_pagado,
            usuarios.tarifa_hora,
            TIMESTAMPDIFF(MINUTE, clases.hora_inicio, clases.hora_fin) / 60 AS duracion_horas,
            ROUND(usuarios.tarifa_hora * (TIMESTAMPDIFF(MINUTE, clases.hora_inicio, clases.hora_fin) / 60), 2) AS importe_profesor
        FROM clases
        JOIN usuarios ON clases.profesor_id = usuarios.id
        WHERE clases.estado = 'completada'
          AND YEAR(clases.fecha) = ?
          AND MONTH(clases.fecha) = ?
        ORDER BY clases.fecha ASC
    ");
    $stmt->execute([$anio, $mes]);
    $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($resultado);
} catch (PDOException $e) {
    echo json_encode(["error" => "Error en la base de datos", "detalle" => $e->getMessage()]);
}
