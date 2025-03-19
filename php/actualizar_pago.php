<?php
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id_pago = $_POST['id_pago'] ?? '';
    $estado = $_POST['estado'] ?? '';

    if (empty($id_pago) || empty($estado)) {
        echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
        exit;
    }

    // Actualizar el estado del pago
    $stmt = $pdo->prepare("UPDATE pagos SET estado = ? WHERE id = ?");
    if ($stmt->execute([$estado, $id_pago])) {

        // Enviar email de notificación (solo si el estado es "Pagado")
        if ($estado === 'pagado') {
            $stmt = $pdo->prepare("SELECT u.email FROM pagos p JOIN usuarios u ON p.profesor_id = u.id WHERE p.id = ?");
            $stmt->execute([$id_pago]);
            $profesor = $stmt->fetch();

            $to = $profesor['email'];
            $subject = "Pago Recibido";
            $message = "Hola, tu pago ha sido procesado y marcado como 'Pagado'.";
            $headers = "From: admin@surfschool.com";

            mail($to, $subject, $message, $headers);
        }

        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al actualizar el pago']);
    }
}
?>
