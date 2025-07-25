<?php

    require_once "../../config/server.php";
    require_once "../../config/conexion.php";
    $objConecction=new connection();
    $objConecction=$objConecction->get_Conexion();

    $rfc=$_POST['rfc'];



    try {
        $querys = $objConecction->prepare("SELECT * FROM claves WHERE rfc = ?");
        $querys->execute([$rfc]);
        $resultados = $querys->fetchAll(PDO::FETCH_ASSOC);

        if (count($resultados) > 0) {
            echo '<select id="grupo" required>';
            echo '<option value="0">Selecciona el grupo</option>';
                foreach ($resultados as $row) {
                    echo '<option value="' . htmlspecialchars($row['id_clave']) . '" data-rfc="' . htmlspecialchars($row['rfc']) . '" data-grupo="' . htmlspecialchars($row['grupo']) . '">' .
                        htmlspecialchars($row['grupo']) . '</option>';
                }
            echo '</select>';
    } else {
        echo '<option value="0">No hay grupos disponibles</option>';
    }
    } catch (PDOException $e) {
        echo '<option value="0">Error en la base de datos</option>';
    }



?>