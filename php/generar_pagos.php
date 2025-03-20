<?php
// ===========================================================
// Archivo: generar_pagos.php
// Funcionalidad: Registra pagos para profesores basados en 
// las horas trabajadas en clases COMPLETADAS.
// ===========================================================

require 'db.php'; // Conexión a la base de datos

try {
    // 🔹 1. Obtener el total de horas trabajadas para cada profesor con clases COMPLETADAS
    $stmt = $pdo->query("
        SELECT profesor_id, SUM(TIMESTAMPDIFF(HOUR, hora_inicio, hora_fin)) AS total_horas 
        FROM clases 
        WHERE estado = 'completada' 
        GROUP BY profesor_id
    ");

    $clases = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 🔹 2. Procesar cada profesor y calcular el pago
    foreach ($clases as $clase) {
        $profesor_id = $clase['profesor_id'];
        $total_horas = $clase['total_horas'];

        // Obtener la tarifa por hora del profesor
        $stmt = $pdo->prepare("SELECT tarifa_hora FROM usuarios WHERE id = ?");
        $stmt->execute([$profesor_id]);
        $profesor = $stmt->fetch();

        // Si no hay tarifa registrada, saltamos al siguiente
        if (!$profesor || empty($profesor['tarifa_hora'])) {
            continue;
        }

        // Calcular el total a pagar
        $total_pagar = $total_horas * $profesor['tarifa_hora'];

        // 🔹 3. Verificar si ya existe un pago pendiente para este profesor
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM pagos WHERE profesor_id = ? AND estado = 'pendiente'");
        $stmt->execute([$profesor_id]);
        $existe_pago = $stmt->fetchColumn();

        if ($existe_pago > 0) {
            continue; // Si ya hay un pago pendiente, no duplicamos
        }

        // 🔹 4. Registrar el pago en la base de datos
        $stmt = $pdo->prepare("INSERT INTO pagos (profesor_id, total_horas, total, estado) VALUES (?, ?, ?, 'pendiente')");
        $stmt->execute([$profesor_id, $total_horas, $total_pagar]);
    }

    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    error_log("Error al generar pagos: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
?>
