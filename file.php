<?php

require_once './dompdf/vendor/autoload.php';
use Dompdf\Dompdf;
use Dompdf\Options;

// Obtener los datos del formulario
$datosJSON = $_POST['datos'] ?? '[]';
$datos = json_decode($datosJSON, true);

// Preparar HTML para el PDF
$html = '
  <h2 style="text-align: center;">Tabla de Datos</h2>
  <table border="1" cellpadding="8" cellspacing="0" width="100%">
    <thead>
      <tr style="background-color: #f2f2f2;">
        <th>Nombre</th>
        <th>Edad</th>
        <th>Género</th>
      </tr>
    </thead>
    <tbody>';

foreach ($datos as $fila) {
    $html .= '<tr>
                <td>' . htmlspecialchars($fila['nombre']) . '</td>
                <td>' . htmlspecialchars($fila['edad']) . '</td>
                <td>' . htmlspecialchars($fila['genero']) . '</td>
              </tr>';
}

$html .= '</tbody></table>';

// Configurar DOMPDF
$options = new Options();
$options->set('isHtml5ParserEnabled', true);
$options->set('defaultFont', 'Helvetica');

$dompdf = new Dompdf($options);
$dompdf->loadHtml($html);

// Tamaño A4 y orientación vertical
$dompdf->setPaper('A4', 'portrait');

// Renderizar PDF
$dompdf->render();

// Enviar al navegador
$dompdf->stream("tabla.pdf", ["Attachment" => false]);
exit;
