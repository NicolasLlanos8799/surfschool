<?php
require 'db.php';

try {
    // Seleccionamos los pagos junto con el nombre del profesor
    $stmt = $pdo->query("
        SELECT p.id, u.nombre AS profesor_nombre, 
               COALESCE(p.total_horas, 0) AS total_horas, 
               COALESCE(p.total, 0) AS total, 
               p.estado 
        FROM pagos p 
        JOIN usuarios u ON p.profesor_id = u.id
    ");

    $pagos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($pagos);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error al obtener los pagos"]);
}
?>
