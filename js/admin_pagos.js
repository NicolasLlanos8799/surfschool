document.addEventListener("DOMContentLoaded", function () {
    cargarPagos();
});

function cargarPagos() {
    fetch("php/listar_pagos.php")
    .then(response => response.json())
    .then(data => {
        const tabla = document.getElementById("tablaPagos");
        tabla.innerHTML = "";
        data.forEach(pago => {
            let fila = `<tr>
                <td>${pago.id}</td>
                <td>${pago.profesor_nombre}</td>
                <td>${pago.horas_trabajadas}</td>
                <td>€${pago.monto}</td>
                <td>${pago.estado}</td>
                <td>
                    ${pago.estado === 'Pendiente' ? `<button class="btn btn-success" onclick="actualizarEstadoPago(${pago.id}, 'Pagado')">Marcar como Pagado</button>` : '<span class="text-success">Pagado</span>'}
                </td>
            </tr>`;
            tabla.innerHTML += fila;
        });
    })
    .catch(error => console.error("Error al cargar los pagos:", error));
}

function actualizarEstadoPago(idPago, nuevoEstado) {
    fetch("php/actualizar_pago.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id_pago=${encodeURIComponent(idPago)}&estado=${encodeURIComponent(nuevoEstado)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Estado de pago actualizado");
            cargarPagos();
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(error => console.error("Error al actualizar el pago:", error));
}
