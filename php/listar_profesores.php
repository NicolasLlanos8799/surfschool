<?php
require 'db.php';

$stmt = $pdo->query("SELECT id, nombre, email, telefono, tarifa_hora FROM usuarios WHERE rol = 'profesor'");
$profesores = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json'); // Asegura que se devuelva un JSON válido
echo json_encode($profesores);
?>
