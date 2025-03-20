// =========================================================
// Archivo: admin_pagos.js
// Funcionalidad: Gestionar los pagos a los profesores, mostrar el estado 
// de los pagos y permitir marcar pagos como "Pagado".
// =========================================================

document.addEventListener("DOMContentLoaded", function () {
    cargarPagos();
});

function cargarPagos() {
    fetch("php/listar_pagos.php")
    .then(response => response.json())
    .then(data => {
        console.log("Pagos recibidos:", data);

        // Obtener las tablas de pagos
        const tablaPendientes = document.getElementById("tablaPagosPendientes");
        const tablaRealizados = document.getElementById("tablaPagosRealizados");

        // Verificar que los elementos existen antes de usarlos
        if (!tablaPendientes || !tablaRealizados) {
            console.error("Error: No se encontraron las tablas de pagos en el DOM.");
            return;
        }

        tablaPendientes.innerHTML = "";
        tablaRealizados.innerHTML = "";

        // Cargar pagos pendientes
        data.pendientes.forEach(pago => {
            let fila = `<tr>
                <td>${pago.profesor_nombre}</td>
                <td>${pago.total_horas}</td>
                <td>€${pago.total}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="confirmarPago('${pago.profesor_nombre}', ${pago.total_horas}, ${pago.total})">
                        Registrar Pago
                    </button>
                </td>
            </tr>`;
            tablaPendientes.innerHTML += fila;
        });

        // Cargar pagos realizados
        data.realizados.forEach(pago => {
            let fila = `<tr>
                <td>${pago.id}</td>
                <td>${pago.profesor_nombre}</td>
                <td>${pago.total_horas}</td>
                <td>€${pago.total}</td>
                <td>${pago.estado.toUpperCase()}</td>
            </tr>`;
            tablaRealizados.innerHTML += fila;
        });
    })
    .catch(error => console.error("Error al cargar los pagos:", error));
}




function confirmarPago(profesorNombre, totalHoras, total) {
    if (!confirm(`¿Confirmar el pago de €${total} para ${profesorNombre}?`)) {
        return;
    }
    
    fetch("php/generar_pagos.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `profesor_nombre=${encodeURIComponent(profesorNombre)}&total_horas=${totalHoras}&total=${total}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Pago registrado correctamente.");
            cargarPagos();
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(error => console.error("Error al registrar el pago:", error));
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
            alert("Pago registrado correctamente.");
            cargarPagos(); // Recargar la lista de pagos
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(error => console.error("Error al registrar el pago:", error));
}
