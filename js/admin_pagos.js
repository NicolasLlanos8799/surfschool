// =========================================================
// Archivo: admin_pagos.js
// Funcionalidad: Gestionar los pagos a los profesores, mostrar el estado 
// de los pagos y permitir marcar pagos como "Pagado".
// =========================================================

// Ejecutar las funciones principales al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    cargarPagos();
});

/**
 * Función para cargar la lista de pagos desde la base de datos
 * Muestra los pagos en la tabla de la interfaz de administrador
 */
function cargarPagos() {
    fetch("php/listar_pagos.php")
    .then(response => response.json())
    .then(data => {
        console.log("Pagos recibidos:", data); // Verificar los datos en la consola

        // Obtener la tabla donde se mostrarán los pagos
        const tabla = document.getElementById("tablaPagos");
        tabla.innerHTML = ""; // Limpiar el contenido previo de la tabla

        // Recorrer cada pago recibido desde el servidor
        data.forEach(pago => {
            let horas = parseInt(pago["total_horas"], 10) || 0; // Convertir a entero o asignar 0
            let monto = parseFloat(pago["total"]) || 0.00; // Convertir a decimal o asignar 0.00

            // Definir clases CSS para resaltar pagos pendientes y pagados
            let estadoClase = pago["estado"] === "pendiente" ? "text-danger fw-bold" : "text-success fw-bold";

            // Crear la fila con los datos del pago
            let fila = `<tr>
                <td>${pago["id"]}</td>
                <td>${pago["profesor_nombre"]}</td>
                <td>${horas}</td>
                <td>€${monto.toFixed(2)}</td>
                <td class="${estadoClase}">${pago["estado"].toUpperCase()}</td>
                <td>
                    ${pago["estado"] === 'pendiente' 
                        ? `<button class="btn btn-success btn-sm" onclick="actualizarEstadoPago(${pago["id"]}, 'pagado')">Marcar como Pagado</button>` 
                        : '<span class="text-success">Pagado</span>'}
                </td>
            </tr>`;
            
            // Agregar la fila a la tabla
            tabla.innerHTML += fila;
        });
    })
    .catch(error => console.error("Error al cargar los pagos:", error));
}

/**
 * Función para actualizar el estado de un pago a "Pagado"
 * @param {number} idPago - ID del pago a actualizar
 * @param {string} nuevoEstado - Nuevo estado del pago (ej: 'pagado')
 */
function actualizarEstadoPago(idPago, nuevoEstado) {
    // Confirmación antes de cambiar el estado del pago
    if (!confirm("¿Estás seguro de que deseas marcar este pago como 'Pagado'?")) {
        return; // Si el usuario cancela, no se ejecuta la actualización
    }

    fetch("php/actualizar_pago.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id_pago=${encodeURIComponent(idPago)}&estado=${encodeURIComponent(nuevoEstado)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Estado de pago actualizado correctamente.");
            cargarPagos(); // Recargar la lista de pagos después de la actualización
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(error => console.error("Error al actualizar el pago:", error));
}

/**
 * Función para cargar pagos filtrados por estado (Pendiente o Pagado)
 * Se ejecuta cuando el usuario selecciona un filtro en el dropdown
 */
function cargarPagosFiltrados() {
    let filtro = document.getElementById("filtroPagos").value; // Obtener filtro seleccionado

    fetch("php/listar_pagos.php")
    .then(response => response.json())
    .then(data => {
        const tabla = document.getElementById("tablaPagos");
        tabla.innerHTML = ""; // Limpiar tabla antes de agregar datos

        // Recorrer la lista de pagos y aplicar el filtro
        data.forEach(pago => {
            if (filtro === "todos" || pago["estado"] === filtro) {
                let horas = parseInt(pago["total_horas"], 10) || 0;
                let monto = parseFloat(pago["total"]) || 0.00;
                let estadoClase = pago["estado"] === "pendiente" ? "text-danger fw-bold" : "text-success fw-bold";

                let fila = `<tr>
                    <td>${pago["id"]}</td>
                    <td>${pago["profesor_nombre"]}</td>
                    <td>${horas}</td>
                    <td>€${monto.toFixed(2)}</td>
                    <td class="${estadoClase}">${pago["estado"].toUpperCase()}</td>
                    <td>
                        ${pago["estado"] === 'pendiente' 
                            ? `<button class="btn btn-success btn-sm" onclick="actualizarEstadoPago(${pago["id"]}, 'pagado')">Marcar como Pagado</button>` 
                            : '<span class="text-success">Pagado</span>'}
                    </td>
                </tr>`;
                
                tabla.innerHTML += fila;
            }
        });
    })
    .catch(error => console.error("Error al cargar los pagos:", error));
}
