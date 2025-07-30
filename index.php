<?php

  require_once './config/server.php';
  require_once './config/conexion.php';
  //require_once './config/enlazarDB.php';

  $objEsc=new connection();
  $objEsc=$objEsc->get_Conexion();
?>

<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Formulario con Tabla</title>
  <link rel="stylesheet" href="./src/css/estilos.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
</head>
<body>
  <div class="container">
    <h2>REPORTE QCN</h2>

    <form id="formTabla">
      <input type="date" id="fecha" placeholder="Fecha" required>

    <select id="docente" required>
      <option value="0">Selecciona Docente</option>
        <?php
          $querys = $objEsc->query("SELECT rfc, usuario_nombre, usuario_apellido FROM usuario");
          if($querys->rowCount() > 0){
              $querys = $querys->fetchAll(PDO::FETCH_ASSOC);
              foreach($querys as $query){
                  echo '<option value="'.$query['rfc'].'" data-nombre="'.$query['usuario_nombre'].'" data-apellido="'.$query['usuario_apellido'].'">'.
                        $query['usuario_nombre'].' '.$query['usuario_apellido'].'</option>';
              }
          }
        ?>
    </select>
          <!-- aqui se agregara el contenido -->
    <div id="grupo"></div>

    <!-- opcion A <input type="radio" name="aaa" value="(UNA)">
    opccion B <input type="radio" name="aaa" value="(DOS)" > -->
 <button type="submit">Agregar</button>
    </form>

    <h3>Tabla</h3>
    <table id="tablaDatos">
      <thead>
        <tr>
          <th>DOCENTE</th>
          <th>CLAVE</th>
          <th>FECHA</th>
          <th>ACCIONES</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>

    <form action="./src/php/file.php" method="post" id="formPDF">
      <input type="hidden" name="datos" id="datosParaPDF">
      <button type="submit">Generar PDF</button>
    </form>
  </div>


  <script src="./src/js/main.js"></script>
</body>
</html>