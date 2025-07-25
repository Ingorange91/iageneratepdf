// === Elementos del DOM ===

const formTabla = document.getElementById("formTabla");
const tablaBody = document.querySelector("#tablaDatos tbody");


const docenteSelect = document.getElementById("docente");


const datosInput = document.getElementById("datosParaPDF");
const formPDF = document.getElementById("formPDF");

// === Variables de estado ===
let filaEditando = null;
let valoresOriginales = null;

// === Eventos ===
formTabla.addEventListener("submit", manejarEnvioFormulario);
tablaBody.addEventListener("click", manejarAccionesTabla);
formPDF.addEventListener("submit", prepararDatosParaPDF);

// === Funciones de Evento ===
function manejarEnvioFormulario(e) {
  e.preventDefault();

 
  const rfc = docenteSelect.value;
  const nombre = docenteSelect.options[docenteSelect.selectedIndex].getAttribute("data-nombre");
  const apellido = docenteSelect.options[docenteSelect.selectedIndex].getAttribute("data-apellido");
  const fecha = document.getElementById("fecha").value;

  if (fecha && rfc !== "0") {
    if (filaEditando) descartarEdicion(filaEditando);
    agregarFila(rfc, nombre, apellido, fecha);
    formTabla.reset();
  }
}

function manejarAccionesTabla(e) {
  const target = e.target;
  const fila = target.closest("tr");

  if (target.classList.contains("editar")) {
    manejarEdicion(fila, target);
  }

  if (target.classList.contains("eliminar")) {
    if (fila === filaEditando) {
      filaEditando = null;
      valoresOriginales = null;
    }
    fila.remove();
  }
}

function prepararDatosParaPDF(e) {
  const filas = Array.from(tablaBody.rows);
  const datos = filas.map(fila => {
    const docenteCelda = fila.cells[0];
    return {
      docenteApellido: docenteCelda.getAttribute("data-nombre"),
      docenteNombre: docenteCelda.getAttribute("data-apellido"),
      fecha: fila.cells[1].innerText,
      rfc: docenteCelda.getAttribute("data-rfc")
    };
  });
  datosInput.value = JSON.stringify(datos);
}

// === Funciones de utilidad ===
function agregarFila(rfc, nombre, apellido, fecha) {
  const fila = document.createElement("tr");
  fila.innerHTML = `
    <td data-rfc="${rfc}" data-nombre="${nombre}" data-apellido="${apellido}">
      ${apellido.toUpperCase()} ${nombre.toUpperCase()} <br> ${rfc.toUpperCase()}
    </td>
    <td>${formatoFecha(fecha)}</td>
    <td>${formatoFecha(fecha)}</td>
    <td>
      <div class="acciones">
        <button type="button" class="editar">Editar</button>
        <button type="button" class="eliminar">Eliminar</button>
      </div>
    </td>`;
  tablaBody.appendChild(fila);
}

async function manejarEdicion(fila, botonEditar) {
  const celdas = fila.querySelectorAll("td");

  if (botonEditar.textContent === "Editar") {
    if (filaEditando && filaEditando !== fila) descartarEdicion(filaEditando);

    valoresOriginales = {
      rfc: celdas[0].getAttribute("data-rfc"),
      nombre: celdas[0].getAttribute("data-nombre"),
      apellido: celdas[0].getAttribute("data-apellido"),
      fecha: celdas[1].innerText
    };

    celdas[0].innerHTML = 'Cargando...';
    celdas[1].innerHTML = `<input type="date" value="${convertirFechaAISO(valoresOriginales.fecha)}">`;

    try {
      const response = await fetch('./src/php/opcionesSelect.php');
      const docentes = await response.json();

      if (!response.ok) throw new Error("HTTP Error: " + response.status);

      let opcionesHTML = `<option value="">Selecciona Docente</option>`;
      docentes.forEach(docente => {
        const selected = docente.rfc === valoresOriginales.rfc ? 'selected' : '';
        opcionesHTML += `
          <option value="${docente.rfc}" data-nombre="${docente.usuario_nombre}" data-apellido="${docente.usuario_apellido}" ${selected}>
            ${docente.usuario_nombre} ${docente.usuario_apellido} (${docente.rfc})
          </option>`;
      });

      celdas[0].innerHTML = `<select>${opcionesHTML}</select>`;

    } catch (error) {
      console.error('Error al cargar docentes:', error);
      celdas[0].innerHTML = '<select disabled><option>Error</option></select>';
    }

    botonEditar.textContent = "Guardar";
    filaEditando = fila;
  } else {
    if (!confirm("¿Deseas guardar los cambios?")) return;

    const select = celdas[0].querySelector("select");
    const rfc = select.value;
    const nombre = select.options[select.selectedIndex].getAttribute("data-nombre");
    const apellido = select.options[select.selectedIndex].getAttribute("data-apellido");
    const fecha = celdas[1].querySelector("input").value;

    celdas[0].innerHTML = `${nombre} ${apellido} <br> ${rfc}`;
    celdas[0].setAttribute("data-nombre", nombre);
    celdas[0].setAttribute("data-apellido", apellido);
    celdas[0].setAttribute("data-rfc", rfc);

    celdas[1].innerText = formatoFecha(fecha);

    botonEditar.textContent = "Editar";
    filaEditando = null;
    valoresOriginales = null;
  }
}

function descartarEdicion(fila) {
  if (!fila || !valoresOriginales) return;
  const celdas = fila.querySelectorAll("td");

  celdas[0].innerHTML = `${valoresOriginales.nombre} ${valoresOriginales.apellido} <br> ${valoresOriginales.rfc}`;
  celdas[0].setAttribute("data-nombre", valoresOriginales.nombre);
  celdas[0].setAttribute("data-apellido", valoresOriginales.apellido);
  celdas[0].setAttribute("data-rfc", valoresOriginales.rfc);

  celdas[1].innerText = valoresOriginales.fecha;
  fila.querySelector(".editar").textContent = "Editar";

  filaEditando = null;
  valoresOriginales = null;
}

function formatoFecha(fecha) {
  const partes = fecha.split(/[-/]/);
  if (partes.length !== 3) return "Formato no válido";
  const [anio, mes, dia] = partes;
  return `${dia}/${mes}/${anio}`;
}

function convertirFechaAISO(fecha) {
  const partes = fecha.split("/");
  if (partes.length !== 3) return "";
  return `${partes[2]}-${partes[1]}-${partes[0]}`;
}


docenteSelect.addEventListener('change', async(e)=>{
  const agregarHTML=document.getElementById('grupo');
  const value=e.target.value;

  
  fetch("./src/php/selectGrupos.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `rfc=${encodeURIComponent(value)}`
  })
    .then(response => {
      if (!response.ok) throw new Error("Error al generar el select");
      return response.text();
    })
    .then(html => {
      agregarHTML.innerHTML = html;
        const grupoSelect = document.getElementById("grado");

        grupoSelect.addEventListener('change', () => {
          const clave = grupoSelect.value;
          const selectedOption = grupoSelect.options[grupoSelect.selectedIndex];
          const rfc = selectedOption.getAttribute("data-rfc");
          const grupo = selectedOption.getAttribute("data-grupo");


          console.log("Clave:", clave);
          console.log("RFC:", rfc);
          console.log("Grupo:", grupo); 
        });
    })
    .catch(error => {
      console.error("Error:", error);
      contenedor.innerHTML = "<p>Error al cargar el select.</p>";
    });
    console.log("cambiando el primer select")

    




});






  // fetch("./src/php/selectGrupos.php")
  // .then(res => {
  //   if(!res.ok) throw new Error("Error al generar el select");
  //   return res.text();
  // }).then(html=>{
  //   agregarHTML.innerHTML=html;
  // }).catch(err =>{
  //   console.error('Error', err);
  //   contenedor.innerHTML = "<p>Error al cargar el select.</p>";
  // })