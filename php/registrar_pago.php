<?php
// ===========================================================
// Archivo: registrar_pago.php
// Funcionalidad: Registra un nuevo pago y marca las clases como pagadas
// ===========================================================

require 'db.php'; // Conexión a la base de datos

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $profesor_nombre = $_POST['profesor_nombre'] ?? '';
    $total_horas = $_POST['total_horas'] ?? 0;
    $total = $_POST['total'] ?? 0;

    if (empty($profesor_nombre) || empty($total_horas) || empty($total)) {
        echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
        exit;
    }

    // Obtener el ID del profesor
    $stmt = $pdo->prepare("SELECT id, email FROM usuarios WHERE nombre = ?");
    $stmt->execute([$profesor_nombre]);
    $profesor = $stmt->fetch();

    if (!$profesor) {
        echo json_encode(['success' => false, 'message' => 'Profesor no encontrado']);
        exit;
    }

    $profesor_id = $profesor['id'];

    // Obtener todas las clases completadas NO pagadas
    $stmt = $pdo->prepare("
        SELECT id FROM clases 
        WHERE profesor_id = ? 
        AND estado = 'completada' 
        AND id NOT IN (SELECT clase_id FROM clases_pagadas)
    ");
    $stmt->execute([$profesor_id]);
    $clases = $stmt->fetchAll(PDO::FETCH_COLUMN);

    if (count($clases) === 0) {
        echo json_encode(['success' => false, 'message' => 'No hay clases completadas para registrar']);
        exit;
    }

    // Insertar el pago
    $stmt = $pdo->prepare("INSERT INTO pagos (profesor_id, total_horas, total, estado, fecha_pago) VALUES (?, ?, ?, 'pagado', NOW())");
    if (!$stmt->execute([$profesor_id, $total_horas, $total])) {
        echo json_encode(['success' => false, 'message' => 'Error al registrar el pago']);
        exit;
    }

    $pago_id = $pdo->lastInsertId();

    // Asociar las clases pagadas al pago
    $stmt = $pdo->prepare("INSERT INTO clases_pagadas (clase_id, pago_id) VALUES (?, ?)");
    foreach ($clases as $clase_id) {
        $stmt->execute([$clase_id, $pago_id]);
    }

    // ✅ Opcional: enviar correo al profesor
    $to = $profesor['email'];
    $subject = "Pago Registrado";
    $message = "Hola {$profesor_nombre}, tu pago de €{$total} ha sido registrado correctamente.";
    $headers = "From: admin@surfschool.com";

    @mail($to, $subject, $message, $headers); // @ para evitar warning si falla

    echo json_encode(['success' => true]);
}
?>
