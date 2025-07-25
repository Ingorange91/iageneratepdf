<?php

require_once '../../vendor/autoload.php';

use Dompdf\Dompdf;
use Dompdf\Options;

// Obtener los datos del formulario
$datosJSON = $_POST['datos'] ?? '[]';
$datos = json_decode($datosJSON, true);

// Preparar HTML para el PDF
$html = '
  <h2 style="text-align: center;">Tabla de Datos</h2>
  <p>Renglón de escritura para su edición</p>
  <table border="1" cellpadding="8" cellspacing="0" width="100%">
    <thead>
      <tr style="background-color: #f2f2f2;">
        <th>DOCENTE</th>
        <th>RFC</th>
        <th>FECHA</th>
      </tr>
    </thead>
    <tbody>';

foreach ($datos as $fila) {
    $html .= '<tr>

                <td>' . htmlspecialchars(strtoupper($fila['docenteApellido']) ) . '<br> '.htmlspecialchars(strtoupper($fila['docenteNombre']) ).'<br>'.strtoupper($fila['rfc']).' </td>
                <td>' . htmlspecialchars($fila['fecha']) . '</td>
                <td>' . htmlspecialchars($fila['fecha']) . '</td>
                
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
$dompdf->stream("datos_docentes.pdf", ["Attachment" => false]);
exit;
