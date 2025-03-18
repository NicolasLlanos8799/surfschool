<?php
require 'db.php';

$stmt = $pdo->query("SELECT id, nombre, email FROM usuarios WHERE rol = 'profesor'");
$profesores = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($profesores);
