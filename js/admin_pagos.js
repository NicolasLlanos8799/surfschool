document.addEventListener("DOMContentLoaded", function () {
    cargarPagos();
});

function cargarPagos() {
    fetch("php/listar_pagos.php")
    .then(response => response.json())
    .then(data => {
        console.log("Pagos recibidos:", data);

        const tabla = document.getElementById("tablaPagos");
        tabla.innerHTML = "";

        data.forEach(pago => {
            let horas = parseInt(pago["total_horas"], 10) || 0;
            let monto = parseFloat(pago["total"]) || 0.00;

            // Agregar clases CSS para diferenciar pagos Pendientes y Pagados
            let estadoClase = pago["estado"] === "pendiente" ? "text-danger fw-bold" : "text-success fw-bold";
            let fila = `<tr>
                <td>${pago["id"]}</td>
                <td>${pago["profesor_nombre"]}</td>
                <td>${horas}</td>
                <td>€${monto.toFixed(2)}</td>
                <td class="${estadoClase}">${pago["estado"].toUpperCase()}</td>
                <td>
                    ${pago["estado"] === 'pendiente' ? `<button class="btn btn-success btn-sm" onclick="actualizarEstadoPago(${pago["id"]}, 'pagado')">Marcar como Pagado</button>` : '<span class="text-success">Pagado</span>'}
                </td>
            </tr>`;
            tabla.innerHTML += fila;
        });
    })
    .catch(error => console.error("Error al cargar los pagos:", error));
}





function actualizarEstadoPago(idPago, nuevoEstado) {
    // Mostrar una confirmación antes de actualizar el estado
    if (!confirm("¿Estás seguro de que deseas marcar este pago como 'Pagado'?")) {
        return; // Si el usuario cancela, no hace nada
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

function cargarPagosFiltrados() {
    let filtro = document.getElementById("filtroPagos").value;

    fetch("php/listar_pagos.php")
    .then(response => response.json())
    .then(data => {
        const tabla = document.getElementById("tablaPagos");
        tabla.innerHTML = "";

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
                        ${pago["estado"] === 'pendiente' ? `<button class="btn btn-success btn-sm" onclick="actualizarEstadoPago(${pago["id"]}, 'pagado')">Marcar como Pagado</button>` : '<span class="text-success">Pagado</span>'}
                    </td>
                </tr>`;
                tabla.innerHTML += fila;
            }
        });
    })
    .catch(error => console.error("Error al cargar los pagos:", error));
}
