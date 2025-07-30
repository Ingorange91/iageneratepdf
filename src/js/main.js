// === Manejador de la tabla de docentes ===

const TablaManager = (() => {
  // === Referencias del DOM ===
  const formTabla = document.getElementById("formTabla"); //All form
  const tablaBody = document.querySelector("#tablaDatos tbody"); //id vacio donde se vizualizara la tabla
  const docenteSelect = document.getElementById("docente");
  const contenedorGrupo = document.getElementById("grupo"); //div donde aparece el grupo después de seleccionar el docente
  const inputFecha = document.getElementById("fecha");
  const datosInput = document.getElementById("datosParaPDF"); // generar pdf
  const formPDF = document.getElementById("formPDF");


  // === Variables de estado ===
  let filaEditando = null;
  let valoresOriginales = null;
  let datosDocente = {};
  let datosGrupo = {};
  let faltasHora="inicial";

  // === Utilidades ===
  function obtenerDatosDocente(selectElement) {
    const option = selectElement.options[selectElement.selectedIndex];
    return {
      rfc: selectElement.value,
      nombre: option.getAttribute("data-nombre"),
      apellido: option.getAttribute("data-apellido")
    };
  }

  function formatoFecha(fecha) {
    const partes = fecha.split(/[-/]/);
    if (partes.length !== 3) return "Formato no válido";
    const [anio, mes, dia] = partes;
    return `${dia}/${mes}/${anio}`;
  }

  function crearHTMLFila({ rfc, nombre, apellido, fecha, clave, grupo }) {
    return `
      <td data-rfc="${rfc}" data-nombre="${nombre}" data-apellido="${apellido}">
        ${apellido.toUpperCase()} ${nombre.toUpperCase()} <br> ${rfc.toUpperCase()}
      </td>
      <td>${clave}</td>
      <td>${formatoFecha(fecha)} <br>${grupo} ${faltasHora} </td>
      <td>
        <div class="acciones">
          <button type="button" class="editar">Editar</button>
          <button type="button" class="eliminar">Eliminar</button>
        </div>
      </td>`;
  }

  function agregarFila(rfc, nombre, apellido, fecha, clave, grupo) {
    if (!(rfc && nombre && apellido && fecha && clave && grupo)) {
      alert("Faltan datos por seleccionar");
      return;
    }
    const fila = document.createElement("tr");
    fila.innerHTML = crearHTMLFila({ rfc, nombre, apellido, fecha, clave, grupo });
    tablaBody.appendChild(fila);
    //formTabla.reset();
  }

  async function manejarEdicion(fila, botonEditar) {
    const celdas = fila.querySelectorAll("td");

    if (botonEditar.textContent === "Editar") {
      if (filaEditando && filaEditando !== fila) descartarEdicion(filaEditando);

      valoresOriginales = {
        rfc: celdas[0].getAttribute("data-rfc"),
        nombre: celdas[0].getAttribute("data-nombre"),
        apellido: celdas[0].getAttribute("data-apellido"),
        fecha: celdas[2].innerText.split(" ")[0]
      };

      celdas[0].innerHTML = 'Cargando...';
      celdas[2].innerHTML = `<input type="date" value="${formatoFecha(valoresOriginales.fecha)}">`;

      try {
        const response = await fetch('./src/php/opcionesSelect.php');
        if (!response.ok) throw new Error("HTTP Error: " + response.status);

        const texto = await response.text(); // primero obtén texto
        try {
          const docentes = JSON.parse(texto); // intenta parsear manualmente

          let opcionesHTML = `<option value="">Selecciona Docente</option>`;
          docentes.forEach(docente => {
            const selected = docente.rfc === valoresOriginales.rfc ? 'selected' : '';
            opcionesHTML += `
              <option value="${docente.rfc}" data-nombre="${docente.usuario_nombre}" data-apellido="${docente.usuario_apellido}" ${selected}>
                ${docente.usuario_nombre} ${docente.usuario_apellido} (${docente.rfc})
              </option>`;
          });

          celdas[0].innerHTML = `<select>${opcionesHTML}</select>`;
        } catch (e) {
          throw new Error("Respuesta no es JSON: " + texto);
        }
      } catch (error) {
        console.error('Error al cargar docentes:', error);
        celdas[0].innerHTML = '<select disabled><option>Error</option></select>';
       
        botonEditar.textContent = "Editar";
        filaEditando = null;
        valoresOriginales = null;
      }

      botonEditar.textContent = "Guardar";
      filaEditando = fila;
    } else {
      if (!confirm("¿Deseas guardar los cambios?")) return;

      const select = celdas[0].querySelector("select");
      const docente = obtenerDatosDocente(select);
      const fecha = celdas[2].querySelector("input").value;

      celdas[0].innerHTML = `${docente.apellido} ${docente.nombre} <br> ${docente.rfc}`;
      celdas[0].setAttribute("data-nombre", docente.nombre);
      celdas[0].setAttribute("data-apellido", docente.apellido);
      celdas[0].setAttribute("data-rfc", docente.rfc);
      celdas[2].innerText = formatoFecha(fecha);

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
    celdas[2].innerText = valoresOriginales.fecha;

    fila.querySelector(".editar").textContent = "Editar";
    filaEditando = null;
    valoresOriginales = null;
  }

  function manejarAccionesTabla(e) {
    const target = e.target;
    const fila = target.closest("tr");

    if (target.classList.contains("editar")) manejarEdicion(fila, target);
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
      const celdas = fila.cells;
      const docenteCelda = celdas[0];
      const clave = celdas[1].textContent.trim();
      const fechaGrupoHora=celdas[2].innerText.trim().split("\n").join(" ").split(" ");
      
      const fecha=fechaGrupoHora[0];
      const grupo=fechaGrupoHora[1] || "";
      const horas = fechaGrupoHora.slice(2).join(" ") || "";
    

      return {
        Apellido: docenteCelda.getAttribute("data-apellido"),
        Nombre: docenteCelda.getAttribute("data-nombre"),
        fecha: fechaGrupoHora,
        rfc: docenteCelda.getAttribute("data-rfc"),
        clave,
        fecha,
        grupo,
        horas
      };
    });

    datosInput.value = JSON.stringify(datos);
  }




  async function cargarGruposPorDocente(e) {
    const rfcSeleccionado = e.target.value;
    datosDocente = obtenerDatosDocente(docenteSelect);
    datosDocente.fecha = inputFecha.value;

    try {
      const response = await fetch("./src/php/selectGrupos.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `rfc=${encodeURIComponent(rfcSeleccionado)}`
      });

      if (!response.ok) throw new Error("Error al generar el select");
      const html = await response.text();

      contenedorGrupo.innerHTML = html;
      const grupoSelect = document.getElementById("grado");
      obtenerDatosRadio();
      
      grupoSelect.addEventListener('change', () => {
        const selectedOption = grupoSelect.options[grupoSelect.selectedIndex];
        datosGrupo = {
          clave: grupoSelect.value,
          grupo: selectedOption.getAttribute("data-grupo")
        };

      });
      
    } catch (error) {
      console.error("Error:", error);
      contenedorGrupo.innerHTML = "<p>Error al cargar el select.</p>";
    }

  }

  function obtenerDatosRadio(e){
     const horasRadio = document.querySelectorAll('input[name="horas"]').forEach(res =>{
        res.addEventListener('change', (e) =>{
          faltasHora=e.target.value;
          
        })
      })
  }

  function cambiarFecha(e){
    const newFecha=e.target.value;
    datosDocente.fecha=newFecha;
  }

  function init() {
    tablaBody.addEventListener("click", manejarAccionesTabla);
    formPDF.addEventListener("submit", prepararDatosParaPDF);
    docenteSelect.addEventListener("change", cargarGruposPorDocente);
    inputFecha.addEventListener("change", cambiarFecha);
 

    formTabla.addEventListener("submit", (e) => {
      e.preventDefault();
      
      if (!datosDocente.rfc || !datosGrupo.clave) {
        alert("Selecciona un docente y un grupo antes de continuar.");
        return;
      }
      agregarFila(
        datosDocente.rfc,
        datosDocente.nombre,
        datosDocente.apellido,
        datosDocente.fecha,
        datosGrupo.clave,
        datosGrupo.grupo,
        //faltasHora,

      );
           
    });
    
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', TablaManager.init);