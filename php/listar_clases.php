<?php
// ===========================================================
// Archivo: listar_clases.php
// Funcionalidad: Obtiene todas las clases registradas en la base de datos,
// incluyendo la información del profesor asociado a cada clase.
// ===========================================================

require 'db.php';

try {
    $stmt = $pdo->query("
        SELECT 
            clases.id, 
            clases.fecha, 
            clases.hora_inicio, 
            clases.hora_fin, 
            clases.alumno_nombre,
            clases.email,
            clases.telefono,
            clases.observaciones,
            clases.profesor_id,
            clases.estado, -- ✅ ahora sí
            usuarios.nombre AS profesor_nombre 
        FROM clases 
        JOIN usuarios ON clases.profesor_id = usuarios.id
    ");

    $clases = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($clases);

} catch (Exception $e) {
    echo json_encode([
        "success" => false, 
        "message" => "Error al obtener las clases"
    ]);
}
?>
