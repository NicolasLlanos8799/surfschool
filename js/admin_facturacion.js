document.addEventListener("DOMContentLoaded", () => {
    cargarFacturacionMensual();
    inicializarFiltro();
    inicializarExportadores();
});

function cargarFacturacionMensual() {
    fetch('php/facturacion_controller.php')
        .then(response => validarRespuesta(response))
        .then(data => renderizarResumenMensual(data))
        .catch(error => mostrarError("Hubo un problema al cargar la facturación.", error));
}

function verDetalleMes(anio, mes) {
    const mesNombre = capitalizar(new Date(anio, mes - 1).toLocaleString('es-ES', { month: 'long' }));
    document.getElementById("tituloDetalleFacturacion").innerText = `Detalle de Facturación – ${mesNombre} ${anio}`;

    fetch(`php/detalle_facturacion_controller.php?anio=${anio}&mes=${mes}`)
        .then(response => validarRespuesta(response))
        .then(data => renderizarDetalleMensual(data))
        .then(() => new bootstrap.Modal(document.getElementById("modalDetalleFacturacion")).show())
        .catch(error => mostrarError("Hubo un problema al cargar el detalle de facturación.", error));
}

// 📌 UTILITARIAS

function validarRespuesta(res) {
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
    return res.json();
}

function mostrarError(mensaje, error) {
    console.error(mensaje, error);
    alert(mensaje);
}

function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    return `${String(fecha.getDate()).padStart(2, '0')}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${fecha.getFullYear()}`;
}

function capitalizar(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}


// 📋 RENDERIZADORES

function renderizarResumenMensual(data) {
    const tbody = document.getElementById("tbodyFacturacion");
    tbody.innerHTML = "";

    if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay datos de facturación aún.</td></tr>';
        return;
    }

    data.forEach(item => {
        const mesNombre = capitalizar(new Date(item.anio, item.mes - 1).toLocaleString('es-ES', { month: 'long' }));
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${mesNombre}</td>
            <td>${item.anio}</td>
            <td>€ ${item.total_facturado ? parseFloat(item.total_facturado).toFixed(2) : '0.00'}</td>
            <td><button class="btn btn-primary btn-sm" onclick="verDetalleMes(${item.anio}, ${item.mes})">🔍 Ver</button></td>
        `;
        tbody.appendChild(fila);
    });
}

function renderizarDetalleMensual(data) {
    const tbody = document.getElementById("tbodyDetalleMes");
    tbody.innerHTML = "";

    if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay clases completadas en este mes.</td></tr>';
        return;
    }

    let totalPagado = 0;
    let totalProfesores = 0;

    data.forEach(clase => {
        totalPagado += parseFloat(clase.importe_pagado || 0);
        totalProfesores += parseFloat(clase.importe_profesor || 0);

        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${formatearFecha(clase.fecha_clase)}</td>
            <td>${clase.profesor}</td>
            <td>${clase.alumno}</td>
            <td>€ ${parseFloat(clase.importe_pagado || 0).toFixed(2)}</td>
            <td>€ ${clase.importe_profesor ? parseFloat(clase.importe_profesor).toFixed(2) : '—'}</td>
        `;
        tbody.appendChild(fila);
    });

    document.getElementById("totalFacturadoMes").innerText = totalPagado.toFixed(2);
    document.getElementById("totalProfesoresMes").innerText = totalProfesores.toFixed(2);
    document.getElementById("gananciaMes").innerText = (totalPagado - totalProfesores).toFixed(2);
}


// 🔍 FILTRO

function inicializarFiltro() {
    const input = document.getElementById("filtroDetalle");
    if (!input) return;

    input.addEventListener("input", () => {
        const filtro = input.value.toLowerCase();
        const filas = document.querySelectorAll("#tablaDetalleMes tbody tr");

        filas.forEach(fila => {
            const texto = fila.innerText.toLowerCase();
            fila.style.display = texto.includes(filtro) ? "" : "none";
        });
    });
}

// 📤 EXPORTAR

function inicializarExportadores() {
    const tabla = document.getElementById("tablaDetalleMes");

    document.getElementById("btnExportExcel")?.addEventListener("click", () => {
        const ws = XLSX.utils.table_to_sheet(tabla);

        // Agregar los totales al final del sheet
        const lastRow = XLSX.utils.decode_range(ws['!ref']).e.r + 2;

        XLSX.utils.sheet_add_aoa(ws, [
            ["", "", "Resumen Económico"],
            ["Total Facturado", `€ ${document.getElementById("totalFacturadoMes").innerText}`],
            ["Importe a Profesores", `€ ${document.getElementById("totalProfesoresMes").innerText}`],
            ["Ganancia Neta", `€ ${document.getElementById("gananciaMes").innerText}`],
        ], { origin: `A${lastRow + 1}` });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Detalle");
        const fechaActual = new Date();
        const dia = String(fechaActual.getDate()).padStart(2, '0');
        const mesNum = fechaActual.getMonth(); // 0-indexed
        const anio = fechaActual.getFullYear();
        const fechaGenerada = `${dia}-${mesNum + 1}-${anio}`;

        const titulo = document.getElementById("tituloDetalleFacturacion").innerText;
        const [_, mesNombre, anioFact] = titulo.match(/– (\w+) (\d{4})/) || [];

        const nombreArchivo = `facturacion_${mesNombre.toLowerCase()}_${anioFact}_generado_${fechaGenerada}.xlsx`;

        XLSX.writeFile(wb, nombreArchivo);


    });

    document.getElementById("btnExportPDF")?.addEventListener("click", () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text("Detalle de Facturación", 14, 15);
        doc.autoTable({
            html: '#tablaDetalleMes',
            startY: 20,
            styles: { fontSize: 9 }
        });

        // Obtener valores del DOM
        const total = document.getElementById("totalFacturadoMes").innerText;
        const profesores = document.getElementById("totalProfesoresMes").innerText;
        const ganancia = document.getElementById("gananciaMes").innerText;

        // Agregar resumen financiero al final del PDF
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 10,
            body: [
                ['Total Facturado', `€ ${total}`],
                ['Importe a Profesores', `€ ${profesores}`],
                ['Ganancia Neta', `€ ${ganancia}`],
            ],
            theme: 'plain',
            styles: { fontSize: 11, textColor: [0, 0, 0] },
        });

        const fechaActual = new Date();
        const dia = String(fechaActual.getDate()).padStart(2, '0');
        const mesNum = fechaActual.getMonth(); // 0-indexed
        const anio = fechaActual.getFullYear();
        const fechaGenerada = `${dia}-${mesNum + 1}-${anio}`;

        const titulo = document.getElementById("tituloDetalleFacturacion").innerText;
        const [_, mesNombre, anioFact] = titulo.match(/– (\w+) (\d{4})/) || [];

        const nombreArchivo = `facturacion_${mesNombre.toLowerCase()}_${anioFact}_generado_${fechaGenerada}.pdf`;

        doc.save(nombreArchivo);

    });
}
