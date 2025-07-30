<?php

require_once "../../config/server.php";
require_once "../../config/conexion.php";
require_once "../../config/crud.php";
$objCrud=new esc();

$rfc=$_POST['rfc'];

try {
    $res=$objCrud->oneQuery("claves", "rfc", $rfc);    
    $resultados = $res->fetchAll(PDO::FETCH_ASSOC);

    if (count($resultados) > 0) {
        echo '<select id="grado" required>';
            echo '<option value="0">Selecciona el grupo</option>';
                foreach ($resultados as $row) {
                    echo '<option value="' . htmlspecialchars($row['id_clave']) . '" data-rfc="' . htmlspecialchars($row['rfc']) . '" data-grupo="' . htmlspecialchars($row['grupo']) . '">' .
                        htmlspecialchars($row['grupo']) . '</option>';
                }
        echo '</select>';

        echo 
        '  
            <label><input type="radio" name="horas" value="(UNA HORA)">UNA HORA</label>
            <label><input type="radio" name="horas" value="(DOS HORAS)">DOS HORAS</label>
            
        ';


    } else {
        echo '<option value="0">No hay grupos disponibles</option>';
    }
} catch (PDOException $e) {
    echo '<option value="0">.'.$e.'.</option>';
}



?>