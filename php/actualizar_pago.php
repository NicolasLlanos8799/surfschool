<?php
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id_pago = $_POST['id_pago'] ?? '';
    $estado = $_POST['estado'] ?? '';

    if (empty($id_pago) || empty($estado)) {
        echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE pagos SET estado = ? WHERE id = ?");
    if ($stmt->execute([$estado, $id_pago])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al actualizar el pago']);
    }
}
?>
