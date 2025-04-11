// =========================================================
// Archivo: admin_pagos.js
// Funcionalidad: Mostrar clases completadas agrupadas por profesor,
// registrar pagos, y listar pagos registrados con detalle por modal.
// =========================================================

document.addEventListener("DOMContentLoaded", function () {
    cargarPagos();
});

function cargarPagos() {
    fetch("php/listar_pagos.php")
        .then(response => response.json())
        .then(data => {
            const tablaCompletadas = document.getElementById("tablaPagosPendientes");
            const tablaRegistrados = document.getElementById("tablaPagosRealizados");

            tablaCompletadas.innerHTML = "";
            tablaRegistrados.innerHTML = "";

            // Mostrar CLASES COMPLETADAS (total a pagar)
            data.completadas.forEach(pago => {
                let fila = `<tr>
                    <td>${pago.profesor_nombre}</td>
                    <td>${pago.total_horas}</td>
                    <td>€${pago.total}</td>
                    <td><button class="btn btn-primary btn-sm" onclick="registrarPago('${pago.profesor_nombre}', ${pago.total_horas}, ${pago.total})">Registrar Pago</button></td>
                </tr>`;
                tablaCompletadas.innerHTML += fila;
            });

            // Mostrar PAGOS REGISTRADOS
            data.registrados.forEach(pago => {
                let fila = document.createElement("tr");
                fila.classList.add("pago-row");
                fila.style.cursor = "pointer";
                fila.innerHTML = `
                    <td>${pago.profesor_nombre}</td>
                    <td>${pago.total_horas}</td>
                    <td>€${pago.total}</td>
                    <td>${formatearFecha(pago.fecha_pago)}</td>
                `;
                fila.addEventListener("click", () => mostrarDetallePago(pago));
                tablaRegistrados.appendChild(fila);
            });
        })
        .catch(error => console.error("Error al cargar los pagos:", error));
}

function mostrarDetallePago(pago) {
    document.getElementById("modalPagoProfesor").textContent = pago.profesor_nombre;
    document.getElementById("modalPagoHoras").textContent = pago.total_horas;
    document.getElementById("modalPagoTotal").textContent = `€${pago.total}`;
    document.getElementById("modalPagoFecha").textContent = formatearFecha(pago.fecha_pago);

    const tabla = document.getElementById("tablaClasesPagadas");
    tabla.innerHTML = `<tr><td colspan="3">Cargando clases...</td></tr>`;

    fetch(`php/clases_por_pago.php?pago_id=${pago.id}`)
        .then(response => response.json())
        .then(data => {
            if (!data.success || !Array.isArray(data.clases)) throw new Error("Respuesta inválida");

            const clases = data.clases;

            if (clases.length === 0) {
                tabla.innerHTML = `<tr><td colspan="3">No hay clases asociadas.</td></tr>`;
                return;
            }

            tabla.innerHTML = "";
            clases.forEach(clase => {
                const duracion = calcularHoras(clase.hora_inicio, clase.hora_fin);
                let fila = `<tr>
                    <td>${formatearFecha(clase.fecha)}</td>
                    <td>${clase.alumno_nombre}</td>
                    <td>${duracion} hs</td>
                </tr>`;
                tabla.innerHTML += fila;
            });
        })
        .catch(error => {
            console.error("Error al cargar clases asociadas:", error);
            tabla.innerHTML = `<tr><td colspan="3">Error al cargar clases</td></tr>`;
        });

    const modal = new bootstrap.Modal(document.getElementById("modalDetallePago"));
    modal.show();
}


function calcularHoras(inicio, fin) {
    const [h1, m1] = inicio.split(":").map(Number);
    const [h2, m2] = fin.split(":").map(Number);

    const minutosInicio = h1 * 60 + m1;
    const minutosFin = h2 * 60 + m2;

    const diferenciaMinutos = minutosFin - minutosInicio;
    const horasDecimales = (diferenciaMinutos / 60).toFixed(2);

    return horasDecimales;
}


function formatearFecha(fechaIso) {
    const [anio, mes, dia] = fechaIso.split("-");
    return `${dia}-${mes}-${anio}`;
}

function registrarPago(profesorNombre, totalHoras, total) {
    if (!confirm(`¿Confirmar el pago de €${total} para ${profesorNombre}?`)) {
        return;
    }

    fetch("php/registrar_pago.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `profesor_nombre=${encodeURIComponent(profesorNombre)}&total_horas=${totalHoras}&total=${total}`
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarToast("Pago registrado correctamente", "success");
                cargarPagos();
            } else {
                mostrarToast("Error: " + data.message, "danger");
            }
        })
        .catch(error => {
            console.error("Error al registrar el pago:", error);
            mostrarToast("Error al registrar el pago", "danger");
        });
}

// ✅ Toast reutilizable
function mostrarToast(mensaje, tipo = "success") {
    const toast = document.getElementById("toastGeneral");
    const toastBody = document.getElementById("toastMensaje");

    toastBody.textContent = mensaje;
    toast.className = "toast align-items-center text-white border-0 bg-" + tipo;

    const toastInstance = new bootstrap.Toast(toast);
    toastInstance.show();
}

// ========== Generar PDF ==========
document.getElementById("btnDescargarPDF").addEventListener("click", function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Obtener datos del modal
    const profesor = document.querySelector("#modalPagoProfesor").textContent.trim();
    const horas = document.querySelector("#modalPagoHoras").textContent.trim();
    const total = document.querySelector("#modalPagoTotal").textContent.trim();
    const fechaPago = document.querySelector("#modalPagoFecha").textContent.trim();

    // Fecha actual para el encabezado
    const hoy = new Date();
    const fechaHoy = hoy.toLocaleDateString("es-ES"); // Formato dd/mm/aaaa
    const fechaHoyNombre = hoy.toISOString().split("T")[0].split("-").reverse().join("-"); // dd-mm-aaaa

    // Título
    doc.setFontSize(16);
    doc.text(`Comprobante de Pago – ${profesor}`, 20, 20);
    doc.setFontSize(12);

    // Info principal
    doc.text(`Profesor: ${profesor}`, 20, 40);
    doc.text(`Horas Pagadas: ${horas}`, 20, 48);
    doc.text(`Total: ${total}`, 20, 56);
    doc.text(`Fecha de Pago: ${fechaPago}`, 20, 64);

    // Tabla de clases
    const headers = [["Fecha", "Alumno", "Duración (hs)"]];
    const rows = [];

    document.querySelectorAll("#tablaClasesPagadas tr").forEach(row => {
        const celdas = row.querySelectorAll("td");
        if (celdas.length === 3) {
            rows.push([
                celdas[0].textContent.trim(),
                celdas[1].textContent.trim(),
                celdas[2].textContent.trim()
            ]);
        }
    });

    doc.autoTable({
        head: headers,
        body: rows,
        startY: 75
    });

    // Pie de página
    const finalY = doc.lastAutoTable.finalY || 85;
    doc.setFontSize(10);
    doc.text("Gracias por tu trabajo. Escuela de Surf Kit", 20, finalY + 20);

    // Descargar
    doc.save(`comprobante_pago_${profesor}_${fechaHoyNombre}.pdf`);
});



