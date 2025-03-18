<?php
require 'db.php';

try {
    $stmt = $pdo->query("SELECT clases.id, clases.fecha, clases.hora_inicio, clases.hora_fin, clases.alumno_nombre, usuarios.nombre AS profesor_nombre FROM clases JOIN usuarios ON clases.profesor_id = usuarios.id");
    $clases = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($clases);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error al obtener las clases"]);
}
