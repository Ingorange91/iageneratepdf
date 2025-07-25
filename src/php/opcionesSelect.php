<?php

require_once '../../config/server.php';
require_once '../../config/conexion.php';


header('Content-Type: application/json');
$objconection=new connection();
$temp=$objconection->get_Conexion();

try {

    


    // $pdo = new PDO("mysql:host=localhost:3307;dbname=carlosalfarocrud;charset=utf8", "root", "");
    // $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $temp->query("SELECT rfc, usuario_nombre, usuario_apellido FROM usuario");
    $result = [];



    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $result[] = [
            'rfc' => $row['rfc'],
            'usuario_nombre' => $row['usuario_nombre'],
            'usuario_apellido' => $row['usuario_apellido'],
        ];
    }

    echo json_encode($result);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al conectar con la base de datos']);
}
?>