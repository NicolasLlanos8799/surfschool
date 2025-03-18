<?php
require 'db.php';

try {
    $stmt = $pdo->query("
        SELECT p.id, u.nombre AS profesor_nombre, SUM(c.hora_fin - c.hora_inicio) AS horas_trabajadas, 
               (SUM(c.hora_fin - c.hora_inicio) * 20) AS monto, p.estado 
        FROM pagos p 
        JOIN usuarios u ON p.profesor_id = u.id
        JOIN clases c ON c.profesor_id = u.id
        GROUP BY p.id, u.nombre, p.estado
    ");

    $pagos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($pagos);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error al obtener los pagos"]);
}
?>
