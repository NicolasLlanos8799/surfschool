<?php
$host = 'localhost';
$dbname = 'surf_school';
$username = 'root'; // Cambiar si tienes otro usuario
$password = ''; // Cambiar si tienes contraseña en MySQL

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Error en la conexión: " . $e->getMessage());
}
