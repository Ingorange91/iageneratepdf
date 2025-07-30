<?php

require_once '../../vendor/autoload.php';

use Dompdf\Dompdf;
use Dompdf\Options;

// Obtener los datos del formulario
$datosJSON = $_POST['datos'] ?? '[]';
$datos = json_decode($datosJSON, true);

// Preparar HTML para el PDF
$html = '

<div style="text-align: center">
  <span style="margin: 0; padding: 0; line-height: 1; font-weight:bold; font-size:20px">SISTEMA EDUCATIVO ESTATAL</span>
  <p style="margin: 0; padding: 0; line-height: 1;">Instituto de Servicios Educativos y Pedagógicos de Baja California <br>
    Reporte de Inasistencias.
  </p>
  <p>C. Director de Administración de Personal del Sistema Educativo de Baja California, agradecemos de antemano a Usted se sirva realizar las gestiones necesarias para que se efectúen los descuentos por inasistencias de las personas que a continuación se mencionan.</p>
  <table border="1" cellpadding="8" cellspacing="0" width="100%">
    <thead>
      <tr style="background-color: #f2f2f2;">
        <th>DOCENTE</th>
        <th>CLAVE</th>
        <th>FECHA</th>
      </tr>
    </thead>
    <tbody>';

foreach ($datos as $fila) {
    $html .= 

              '
          
              <tr>
                <td>'.htmlspecialchars(strtoupper($fila['Apellido'])). '<br> '.htmlspecialchars(strtoupper($fila['Nombre']) ).'<br>'.strtoupper($fila['rfc']).' </td>
                <td>'.htmlspecialchars($fila['clave']).'</td>
                <td>'.htmlspecialchars($fila['fecha']).'<br>'.htmlspecialchars($fila['grupo']).' '.htmlspecialchars($fila['horas']).'</td>
                
               
              

                
                
              </tr>
              ';
}

$html .= '
            </tbody></table></div>
            
          ';

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


