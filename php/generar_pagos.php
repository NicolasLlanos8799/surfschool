<?php
// ===========================================================
// Archivo: generar_pagos.php
// Funcionalidad: Genera registros de pago para cada profesor
// en función de las horas trabajadas en clases pendientes.
// ===========================================================

// Incluir la conexión a la base de datos
require 'db.php';

try {
    // Obtener el total de horas trabajadas para cada profesor con clases pendientes
    $stmt = $pdo->query("
        SELECT profesor_id, SUM(TIMESTAMPDIFF(HOUR, hora_inicio, hora_fin)) AS total_horas 
        FROM clases 
        WHERE estado = 'pendiente' 
        GROUP BY profesor_id
    ");

    // Obtener todos los registros de clases pendientes
    $clases = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Recorrer cada profesor y calcular el pago
    foreach ($clases as $clase) {
        $profesor_id = $clase['profesor_id'];
        $total_horas = $clase['total_horas'];

        // Obtener la tarifa por hora del profesor
        $stmt = $pdo->prepare("SELECT tarifa_hora FROM usuarios WHERE id = ?");
        $stmt->execute([$profesor_id]);
        $profesor = $stmt->fetch();

        // Verificar que el profesor tiene una tarifa registrada
        if (!$profesor || empty($profesor['tarifa_hora'])) {
            continue; // Saltar la generación de pago si no tiene tarifa asignada
        }

        // Calcular el total a pagar
        $total_pagar = $total_horas * $profesor['tarifa_hora'];

        // Insertar el pago en la base de datos
        $stmt = $pdo->prepare("INSERT INTO pagos (profesor_id, total_horas, total, estado) VALUES (?, ?, ?, 'pendiente')");
        $stmt->execute([$profesor_id, $total_horas, $total_pagar]);
    }

    // Respuesta en formato JSON
    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
?>
