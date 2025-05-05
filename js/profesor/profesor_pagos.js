// Script para mostrar los pagos del profesor logueado

document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("seccionPagos")) {
        cargarPagosProfesor();
    }
});

function cargarPagosProfesor() {
    fetch("php/profesor/obtener_pagos_profesor.php")
        .then(response => response.json())
        .then(data => {
            mostrarClasesCompletadas(data.completadas);
            mostrarPagosRegistrados(data.registrados);
        })
        .catch(error => {
            console.error("Error al cargar pagos del profesor:", error);
        });
}

function mostrarClasesCompletadas(clases) {
    const contenedor = document.getElementById("contenedorClasesCompletadas");
    contenedor.innerHTML = "";

    if (!Array.isArray(clases) || clases.length === 0 || !clases[0]?.total_horas) {
        contenedor.innerHTML = `<p class="text-muted">No tienes clases completadas pendientes de pago.</p>`;
        return;
    }

    const clase = clases[0];
    contenedor.innerHTML = `
        <div class="card bg-light shadow-sm">
            <div class="card-body">
                <p class="card-text">Total de Horas: <strong>${clase.total_horas}</strong></p>
                <p class="card-text">Total a Cobrar: <strong>$${clase.total}</strong></p>
                <span class="badge bg-warning text-dark">Pago Pendiente</span>
            </div>
        </div>
    `;
}

function mostrarPagosRegistrados(pagos) {
    const tabla = document.getElementById("tablaPagosRegistrados");
    const cuerpo = tabla.querySelector("tbody");
    cuerpo.innerHTML = "";

    if (!pagos || pagos.length === 0) {
        cuerpo.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No se encontraron pagos registrados.</td></tr>`;
        return;
    }

    pagos.forEach(pago => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${formatearFecha(pago.fecha_pago)}</td>         
            <td>${pago.total_horas}</td>
            <td>€${pago.total}</td>
        `;
        fila.style.cursor = "pointer";
        fila.addEventListener("click", () => verDetallePagoProfesor(pago.id));
        cuerpo.appendChild(fila);
    });

    // Inicializar DataTables
if ($.fn.DataTable.isDataTable('#tablaPagosRegistrados')) {
    $('#tablaPagosRegistrados').DataTable().destroy();
}

$('#tablaPagosRegistrados').DataTable({
    pageLength: 10,
    lengthChange: false,
    order: [[0, 'desc']], // Ordenar por la columna de fecha (índice 0)
    columnDefs: [
        { type: 'fecha-euro', targets: 0 }
    ],
    language: {
        search: "Buscar por fecha o monto:",
        url: "//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json"
    }
});

}

function verDetallePagoProfesor(idPago) {
    const idProfesor = localStorage.getItem("id_profesor");

    fetch(`php/profesor/obtener_detalle_pago_profesor.php?id=${idPago}&profesor_id=${idProfesor}`)
        .then(response => response.json())
        .then(data => {
            const cuerpo = document.getElementById("tablaDetallePagoProfesor");
            cuerpo.innerHTML = "";

            if (!data || data.length === 0) {
                cuerpo.innerHTML = `<tr><td colspan="4" class="text-center">Sin clases asociadas.</td></tr>`;
            } else {
                data.forEach(clase => {
                    const fecha = new Date(clase.fecha);
                    const fechaFormateada = `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}`;

                    const fila = `
                        <tr>
                            <td>${fechaFormateada}</td>
                            <td>${clase.alumno_nombre}</td>
                            <td>${clase.duracion} hs</td>
                            <td>€${parseFloat(clase.importe).toFixed(2)}</td>
                        </tr>
                    `;
                    cuerpo.innerHTML += fila;
                });
            }

            const modal = new bootstrap.Modal(document.getElementById("modalDetallePagoProfesor"));
            modal.show();
        })
        .catch(error => {
            console.error("Error al cargar detalle del pago:", error);
        });
}



function formatearFecha(fechaISO) {
    const [anio, mes, dia] = fechaISO.split("-");
    return `${dia}/${mes}/${anio}`;
}


document.getElementById("btnDescargarComprobanteProfesor").addEventListener("click", function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Obtener datos del modal
    // const profesor = localStorage.getItem("nombre_profesor") || "Profesor";
    const fechaPago = document.querySelector("#tablaPagosRegistrados tbody tr td")?.textContent.trim() || "";
    const filas = document.querySelectorAll("#tablaDetallePagoProfesor tr");

    let totalHoras = 0;
    let totalEuros = 0;

    const clases = [];
    filas.forEach(row => {
        const celdas = row.querySelectorAll("td");
        if (celdas.length === 4) {
            const fecha = celdas[0].textContent.trim();
            const alumno = celdas[1].textContent.trim();
            const duracion = celdas[2].textContent.trim();
            const importe = celdas[3].textContent.trim();

            // Sumar totales
            const duracionNum = parseFloat(duracion.replace("hs", "").trim().replace(",", "."));
            const importeNum = parseFloat(importe.replace("€", "").replace(",", "."));

            if (!isNaN(duracionNum)) totalHoras += duracionNum;
            if (!isNaN(importeNum)) totalEuros += importeNum;

            clases.push([fecha, alumno, duracion, importe]);
        }
    });

    const fechaHoyNombre = new Date().toISOString().split("T")[0].split("-").reverse().join("-");

    doc.setFontSize(16);
    doc.text(`Comprobante de Pago`, 20, 20);

    doc.setFontSize(12);
    doc.text(`Horas Pagadas: ${totalHoras.toFixed(2)} hs`, 20, 48);
    doc.text(`Total: €${totalEuros.toFixed(2)}`, 20, 56);
    doc.text(`Fecha de Pago: ${fechaPago}`, 20, 64);

    doc.autoTable({
        startY: 75,
        head: [["Fecha", "Alumno", "Duración", "Importe"]],
        body: clases
    });

    const finalY = doc.lastAutoTable.finalY || 85;
    doc.setFontSize(10);
    doc.text("Gracias por tu trabajo. Escuela de Surf Kit", 20, finalY + 20);

    doc.save(`comprobante_pago_profesor_${fechaHoyNombre}.pdf`);
});


// function verDetalleClasesCompletadasPendientesAPagar() {
//     const idProfesor = localStorage.getItem("id_profesor");
//     console.log("🧪 ID del profesor:", idProfesor);

//     if (!idProfesor) {
//         alert("No se encontró el ID del profesor. Vuelva a iniciar sesión.");
//         return;
//     }

//     const formData = new FormData();
//     formData.append("id_profesor", idProfesor);

//     fetch("php/profesor/obtener_clases_completadas_no_pagadas_profesor.php", {
//         method: "POST",
//         body: formData
//     })
//     .then(response => response.text())
//     .then(texto => {
//         console.log("🧪 Respuesta bruta del servidor:", texto);

//         // Mostrar en pantalla para debug visual
//         const debugDiv = document.createElement("div");
//         debugDiv.style.position = "fixed";
//         debugDiv.style.bottom = "0";
//         debugDiv.style.left = "0";
//         debugDiv.style.width = "100%";
//         debugDiv.style.maxHeight = "300px";
//         debugDiv.style.overflow = "auto";
//         debugDiv.style.zIndex = "9999";
//         debugDiv.style.background = "#222";
//         debugDiv.style.color = "#0f0";
//         debugDiv.style.padding = "10px";
//         debugDiv.innerText = "DEBUG:\n" + texto;
//         document.body.appendChild(debugDiv);

//         let data;
//         try {
//             data = JSON.parse(texto);
//         } catch (e) {
//             console.error("❌ Error al parsear JSON:", e);
//             return;
//         }

//         const cuerpo = document.querySelector("#tablaDetalleClasesCompletadas tbody");
//         cuerpo.innerHTML = "";

//         if (!data || data.length === 0 || data.error) {
//             cuerpo.innerHTML = `<tr><td colspan="4" class="text-center">Sin clases completadas pendientes.</td></tr>`;
//         } else {
//             data.forEach(clase => {
//                 const fila = `
//                     <tr>
//                         <td>${clase.fecha}</td>
//                         <td>${clase.alumno_nombre}</td>
//                         <td>${clase.duracion} hs</td>
//                         <td>€${parseFloat(clase.importe_profesor).toFixed(2)}</td>
//                     </tr>
//                 `;
//                 cuerpo.innerHTML += fila;
//             });
//         }

//         const modal = new bootstrap.Modal(document.getElementById("modalDetalleClasesCompletadasProfesor"));
//         modal.show();
//     })
//     .catch(error => {
//         console.error("❌ Error en la petición:", error);
//     });
// }
