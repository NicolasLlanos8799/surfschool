<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json');

// 🛑 Verificar si está logueado como profesor
if (!isset($_SESSION['user_id']) || $_SESSION['rol'] !== 'profesor') {
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

$idProfesor = $_SESSION['user_id'];

try {
    // ✅ Adaptamos los nombres de las columnas según tu tabla real
    $stmt = $pdo->prepare("SELECT id, alumno_nombre, email, telefono, fecha, hora_inicio, hora_fin, estado, observaciones, importe_pagado
                           FROM clases
                           WHERE profesor_id = ?");
    $stmt->execute([$idProfesor]);

    $clases = [];

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $clases[] = [
            'id' => $row['id'],
            'title' => $row['alumno_nombre'],
            'start' => $row['fecha'] . 'T' . $row['hora_inicio'],
            'end' => $row['fecha'] . 'T' . $row['hora_fin'],
            'alumno' => $row['alumno_nombre'],
            'email' => $row['email'],
            'telefono' => $row['telefono'],
            'observaciones' => $row['observaciones'],
            'estado' => $row['estado']
        ];
    }

    echo json_encode($clases);

} catch (PDOException $e) {
    echo json_encode(['error' => 'Error en la consulta: ' . $e->getMessage()]);
    exit;
}
?>
