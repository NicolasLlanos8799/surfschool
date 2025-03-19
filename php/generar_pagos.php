<?php
require 'db.php';

// Obtener clases de cada profesor
$stmt = $pdo->query("SELECT profesor_id, SUM(TIMESTAMPDIFF(HOUR, hora_inicio, hora_fin)) AS total_horas 
                    FROM clases WHERE estado = 'pendiente' GROUP BY profesor_id");
$clases = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($clases as $clase) {
    $profesor_id = $clase['profesor_id'];
    $total_horas = $clase['total_horas'];

    // Obtener la tarifa del profesor
    $stmt = $pdo->prepare("SELECT tarifa_hora FROM usuarios WHERE id = ?");
    $stmt->execute([$profesor_id]);
    $profesor = $stmt->fetch();

    $total_pagar = $total_horas * $profesor['tarifa_hora'];

    // Insertar pago en la base de datos
    $stmt = $pdo->prepare("INSERT INTO pagos (profesor_id, total_horas, total, estado) VALUES (?, ?, ?, 'pendiente')");
    $stmt->execute([$profesor_id, $total_horas, $total_pagar]);
}

echo json_encode(['success' => true]);
?>
