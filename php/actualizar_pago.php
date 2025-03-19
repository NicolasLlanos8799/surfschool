<?php
// ===========================================================
// Archivo: actualizar_pago.php
// Funcionalidad: Permite actualizar el estado de un pago en la base de datos
// y envía una notificación por correo electrónico cuando el pago es aprobado.
// ===========================================================

require 'db.php'; // Importa la conexión a la base de datos

// Verifica que la solicitud sea de tipo POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtiene los datos enviados desde la solicitud POST
    $id_pago = $_POST['id_pago'] ?? '';
    $estado = $_POST['estado'] ?? '';

    // Validación: Verifica que ambos campos estén presentes
    if (empty($id_pago) || empty($estado)) {
        echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
        exit;
    }

    // Prepara la consulta SQL para actualizar el estado del pago en la base de datos
    $stmt = $pdo->prepare("UPDATE pagos SET estado = ? WHERE id = ?");
    
    if ($stmt->execute([$estado, $id_pago])) {
        // Si el pago ha sido marcado como "Pagado", se envía un correo al profesor
        if ($estado === 'pagado') {
            // Obtiene el correo del profesor asociado al pago
            $stmt = $pdo->prepare("SELECT u.email FROM pagos p 
                                   JOIN usuarios u ON p.profesor_id = u.id 
                                   WHERE p.id = ?");
            $stmt->execute([$id_pago]);
            $profesor = $stmt->fetch();

            // Enviar notificación por correo
            $to = $profesor['email'];
            $subject = "Pago Recibido";
            $message = "Hola, tu pago ha sido procesado y marcado como 'Pagado'.";
            $headers = "From: admin@surfschool.com";

            // Envío del correo
            mail($to, $subject, $message, $headers);
        }

        // Respuesta en formato JSON indicando éxito
        echo json_encode(['success' => true]);
    } else {
        // En caso de error, devuelve un mensaje de error
        echo json_encode(['success' => false, 'message' => 'Error al actualizar el pago']);
    }
}
?>
