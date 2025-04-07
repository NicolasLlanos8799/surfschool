// =========================================================
// Archivo: admin_pagos.js
// Funcionalidad: Mostrar clases completadas agrupadas por profesor,
// registrar pagos, y listar pagos registrados.
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

            if (!tablaCompletadas || !tablaRegistrados) {
                console.error("Error: No se encontraron las tablas de pagos en el DOM.");
                return;
            }

            tablaCompletadas.innerHTML = "";
            tablaRegistrados.innerHTML = "";

            // 🔹 Mostrar clases completadas (no pagadas)
            data.completadas.forEach(pago => {
                let fila = `<tr>
                    <td>${pago.profesor_nombre}</td>
                    <td>${pago.total_horas}</td>
                    <td>€${pago.total}</td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="registrarPago('${pago.profesor_nombre}', ${pago.total_horas}, ${pago.total})">
                            Registrar Pago
                        </button>
                    </td>
                </tr>`;
                tablaCompletadas.innerHTML += fila;
            });

            // 🔹 Mostrar pagos ya registrados
            data.registrados.forEach(pago => {
                let fila = `<tr>
                    <td>${pago.profesor_nombre}</td>
                    <td>${pago.total_horas}</td>
                    <td>€${pago.total}</td>
                    <td>${pago.fecha_pago}</td>
                </tr>`;
                tablaRegistrados.innerHTML += fila;
            });
        })
        .catch(error => {
            console.error("Error al cargar los pagos:", error);
        });
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
