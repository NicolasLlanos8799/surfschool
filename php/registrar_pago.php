<?php
// ===========================================================
// Archivo: registrar_pago.php
// Funcionalidad: Registra un nuevo pago en la base de datos
// ===========================================================

require 'db.php'; // Conexión a la base de datos

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $profesor_nombre = $_POST['profesor_nombre'] ?? '';
    $total_horas = $_POST['total_horas'] ?? 0;
    $total = $_POST['total'] ?? 0;

    if (empty($profesor_nombre) || empty($total_horas) || empty($total)) {
        echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
        exit;
    }

    // Obtener el ID del profesor por su nombre
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE nombre = ?");
    $stmt->execute([$profesor_nombre]);
    $profesor = $stmt->fetch();

    if (!$profesor) {
        echo json_encode(['success' => false, 'message' => 'Profesor no encontrado']);
        exit;
    }

    $profesor_id = $profesor['id'];

    // Insertar el pago en la base de datos
    $stmt = $pdo->prepare("INSERT INTO pagos (profesor_id, total_horas, total, estado) VALUES (?, ?, ?, 'pendiente')");
    if ($stmt->execute([$profesor_id, $total_horas, $total])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al registrar el pago']);
    }
}
?>
