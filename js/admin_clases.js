// admin_clases.js
// Funciones para la gestión de clases en el panel admin

document.addEventListener("DOMContentLoaded", function () {
    cargarClases()
    mostrarSeccion('clases');
});

// Variables globales para actualizar detalle de facturación
let anioActualDetalle = null;
let mesActualDetalle = null;


function mostrarFormularioClase() {
    const formulario = document.getElementById("formulario-clase");

    if (!formulario) {
        console.error("Error: No se encontró el formulario de clases en el DOM.");
        return;
    }

    formulario.style.display = formulario.style.display === "none" ? "block" : "none";
    cargarListaProfesores();
}

function asignarClase() {
    const btn = document.getElementById("btnGuardarClase");
    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner-border spinner-sm" role="status" aria-hidden="true"></span> Guardando...`;

    const profesorId = document.getElementById("profesor").value;
    const fecha = document.getElementById("fecha").value;
    const horaInicio = document.getElementById("hora_inicio").value;
    const horaFin = document.getElementById("hora_fin").value;
    const alumno = document.getElementById("alumno").value.trim();
    const email = document.getElementById("email_alumno").value.trim();
    const telefono = document.getElementById("telefono_alumno").value.trim();
    const observaciones = document.getElementById("observaciones").value.trim();
    const importePagado = document.getElementById("importePagado").value.trim();

    if (!profesorId || !fecha || !horaInicio || !horaFin || !alumno) {
        alert("Todos los campos son obligatorios.");
        btn.disabled = false;
        btn.innerHTML = originalText;
        return;
    }

    fetch("php/agregar_clase.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `profesor_id=${profesorId}&fecha=${fecha}&hora_inicio=${horaInicio}&hora_fin=${horaFin}&alumno=${encodeURIComponent(alumno)}&email=${encodeURIComponent(email)}&telefono=${encodeURIComponent(telefono)}&observaciones=${encodeURIComponent(observaciones)}&importe_pagado=${encodeURIComponent(importePagado)}`
    })
        .then(response => response.json())
        .then(data => {
            btn.disabled = false;
            btn.innerHTML = originalText;

            if (data.success) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalAsignarClase'));
                if (modal) modal.hide();
                cargarClases();
                if (calendarInstancia?.refetchEvents) calendarInstancia.refetchEvents();
                if (typeof cargarPagos === "function") cargarPagos();
                mostrarToast("Clase asignada correctamente", "success");
            } else {
                mostrarToast("Error: " + data.message, "danger");
            }
        })
        .catch(error => {
            btn.disabled = false;
            btn.innerHTML = originalText;
            console.error("Error al asignar la clase:", error);
            mostrarToast("Error al asignar la clase", "danger");
        });
}


function generarColorDesdeTexto(texto) {
    let hash = 0;
    for (let i = 0; i < texto.length; i++) {
        hash = texto.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = '#' + ((hash >> 24) & 0xFF).toString(16).padStart(2, '0') +
        ((hash >> 16) & 0xFF).toString(16).padStart(2, '0') +
        ((hash >> 8) & 0xFF).toString(16).padStart(2, '0');
    return color.slice(0, 7);
}


function cargarClases() {
    fetch("php/listar_clases.php")
        .then(response => response.json())
        .then(data => {
            const tabla = document.getElementById("tablaClases");
            tabla.innerHTML = "";

            data.forEach(clase => {
                let fila = `
                <tr>
                    <td>${clase.id}</td>
                    <td>${clase.profesor_nombre}</td>
                    <td>${clase.fecha}</td>
                    <td>${clase.hora_inicio} - ${clase.hora_fin}</td>
                    <td>${clase.alumno_nombre}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editarClase(${clase.id}, '${clase.profesor_id}', '${clase.fecha}', '${clase.hora_inicio}', '${clase.hora_fin}', '${clase.alumno_nombre}')">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarClase(${clase.id})">Eliminar</button>
                    </td>
                </tr>`;
                tabla.innerHTML += fila;
            });
        })
        .catch(error => console.error("Error al cargar las clases:", error));
}

function guardarEdicionClase() {
    const btn = document.getElementById("btnGuardarEdicion");
    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner-border spinner-sm" role="status" aria-hidden="true"></span> Guardando...`;

    const id = document.getElementById("clase_id").value;
    const profesorId = document.getElementById("editar_profesor").value;
    const fecha = document.getElementById("editar_fecha").value;
    const horaInicio = document.getElementById("editar_hora_inicio").value;
    const horaFin = document.getElementById("editar_hora_fin").value;
    const alumno = document.getElementById("editar_alumno").value.trim();
    const email = document.getElementById("editar_email_alumno").value.trim();
    const telefono = document.getElementById("editar_telefono_alumno").value.trim();
    const observaciones = document.getElementById("editar_observaciones").value.trim();
    const importePagado = document.getElementById("editar_importe_pagado").value.trim();


    if (!id || !profesorId || !fecha || !horaInicio || !horaFin || !alumno) {
        mostrarToast("Todos los campos obligatorios deben estar completos", "warning");
        btn.disabled = false;
        btn.innerHTML = originalText;
        return;
    }

    fetch("php/editar_clase.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${id}&profesor_id=${profesorId}&fecha=${fecha}&hora_inicio=${horaInicio}&hora_fin=${horaFin}&alumno=${encodeURIComponent(alumno)}&email=${encodeURIComponent(email)}&telefono=${encodeURIComponent(telefono)}&observaciones=${encodeURIComponent(observaciones)}&importe_pagado=${encodeURIComponent(importePagado)}`

    })
        .then(response => response.json())
        .then(data => {
            btn.disabled = false;
            btn.innerHTML = originalText;

            if (data.success) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarClase'));
                if (modal) modal.hide();

                cargarClases();
                if (calendarInstancia?.refetchEvents) {
                    calendarInstancia.refetchEvents();
                }
                if (typeof cargarPagos === "function") cargarPagos();
                
                if (typeof cargarFacturacionMensual === "function") {
                    cargarFacturacionMensual();
                }
                
                if (anioActualDetalle && mesActualDetalle && typeof verDetalleMes === "function") {
                    verDetalleMes(anioActualDetalle, mesActualDetalle);
                }
                

                mostrarToast("Clase editada correctamente", "success");
            } else {
                mostrarToast("Error al editar la clase", "danger");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            btn.disabled = false;
            btn.innerHTML = originalText;
            mostrarToast("Error de red al guardar cambios", "danger");
        });
}

function eliminarClase(id, callback) {
    if (!confirm("¿Estás seguro de que deseas eliminar esta clase? Esta acción no se puede deshacer.")) {
        return;
    }

    fetch("php/eliminar_clase.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${id}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarToast("Clase eliminada correctamente.");

            const evento = calendarInstancia.getEventById(id.toString());
            if (evento) evento.remove();

            cargarClases();

            if (typeof cargarPagos === "function") cargarPagos();

            // 🔄 ACTUALIZAR FACTURACIÓN
            if (typeof cargarFacturacionMensual === "function") {
                cargarFacturacionMensual();
            }

            // 🔄 ACTUALIZAR DETALLE SI ESTÁ ABIERTO
            if (anioActualDetalle && mesActualDetalle && typeof verDetalleMes === "function") {
                verDetalleMes(anioActualDetalle, mesActualDetalle);
            }

            if (typeof callback === "function") callback();

        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(error => {
        console.error("Error al eliminar la clase:", error);
    });
}


function cargarListaProfesores() {
    fetch("php/listar_profesores.php")
        .then(response => response.json())
        .then(data => {
            const selectProfesores = document.getElementById("profesor");
            if (!selectProfesores) {
                console.error("Error: No se encontró el elemento select de profesores en el DOM.");
                return;
            }

            selectProfesores.innerHTML = '<option value="">Seleccione un profesor</option>';

            data.forEach(profesor => {
                let opcion = document.createElement("option");
                opcion.value = profesor.id;
                opcion.textContent = profesor.nombre;
                selectProfesores.appendChild(opcion);
            });
        })
        .catch(error => console.error("Error al cargar los profesores en el formulario:", error));
}

function cargarListaProfesoresEdicion(profesorSeleccionado) {
    fetch("php/listar_profesores.php")
        .then(response => response.json())
        .then(data => {
            const selectProfesores = document.getElementById("editar_profesor");
            selectProfesores.innerHTML = '<option value="">Seleccione un profesor</option>';

            data.forEach(profesor => {
                let opcion = document.createElement("option");
                opcion.value = profesor.id;
                opcion.textContent = profesor.nombre;
                if (profesor.id == profesorSeleccionado) {
                    opcion.selected = true;
                }
                selectProfesores.appendChild(opcion);
            });
        })
        .catch(error => console.error("Error al cargar los profesores en edición:", error));
}

function inicializarCalendario() {
    const calendarEl = document.getElementById('calendar');
    const esPantallaChica = window.innerWidth <= 400;

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        headerToolbar: esPantallaChica
            ? {
                left: 'prev,next',
                center: 'title',
                right: 'listWeek'
            }
            : {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listWeek'
            },
        dayMaxEvents: true,
        aspectRatio: esPantallaChica ? 0.75 : 1.35,
        viewDidMount: function (arg) {
            const titulo = arg.view.title;
            const capitalizado = titulo.charAt(0).toUpperCase() + titulo.slice(1);
            document.querySelector('.fc-toolbar-title').textContent = capitalizado;
        },

        dateClick: function (info) {
            const fecha = info.dateStr;

            document.getElementById("fecha").value = fecha;
            document.getElementById("hora_inicio").value = '';
            document.getElementById("hora_fin").value = '';
            document.getElementById("alumno").value = '';
            document.getElementById("email_alumno").value = '';
            document.getElementById("telefono_alumno").value = '';
            document.getElementById("observaciones").value = '';

            cargarListaProfesores();

            const modal = new bootstrap.Modal(document.getElementById('modalAsignarClase'));
            modal.show();
        },

        events: function (fetchInfo, successCallback, failureCallback) {
            fetch('php/listar_clases.php')
                .then(response => response.json())
                .then(data => {
                    const profesoresUnicos = [...new Set(data.map(c => c.profesor_nombre))];
                    mostrarLeyendaProfesores(profesoresUnicos);

                    const eventos = data.map(clase => {
                        const color = generarColorDesdeTexto(clase.profesor_nombre);
                        return {
                            id: clase.id.toString(),
                            title: clase.alumno_nombre,
                            start: `${clase.fecha}T${clase.hora_inicio}`,
                            end: `${clase.fecha}T${clase.hora_fin}`,
                            backgroundColor: color,
                            borderColor: color,
                            textColor: "#fff",
                            extendedProps: {
                                profesor: clase.profesor_nombre,
                                observaciones: clase.observaciones,
                                email: clase.email,
                                telefono: clase.telefono,
                                estado: clase.estado,
                                importe_pagado: clase.importe_pagado
                            }
                        };
                    });

                    successCallback(eventos);
                })
                .catch(error => {
                    console.error('Error al cargar eventos:', error);
                    failureCallback(error);
                });
        },

        eventClick: function (info) {
            const evento = info.event;

            document.getElementById('detalleAlumno').textContent = evento.title;
            document.getElementById('detalleProfesor').textContent = evento.extendedProps.profesor;
            document.getElementById('detalleObservaciones').textContent = evento.extendedProps.observaciones?.trim() || 'Sin observaciones';
            document.getElementById('detalleEmail').textContent = evento.extendedProps.email || '—';
            document.getElementById('detalleTelefono').textContent = evento.extendedProps.telefono || '—';
            document.getElementById('detalleImportePagado').textContent = evento.extendedProps.importe_pagado || '—';

            const fechaObj = evento.start;
            const fecha = `${String(fechaObj.getDate()).padStart(2, '0')}-${String(fechaObj.getMonth() + 1).padStart(2, '0')}-${fechaObj.getFullYear()}`;
            const horaInicio = evento.start.toTimeString().slice(0, 5);
            const horaFin = evento.end ? evento.end.toTimeString().slice(0, 5) : "—";

            document.getElementById('detalleFecha').textContent = fecha;
            document.getElementById('detalleHorario').textContent = `${horaInicio} - ${horaFin}`;

            const btnCompletada = document.getElementById('btnClaseCompletada');

            if (evento.extendedProps.estado === 'completada') {
                btnCompletada.classList.remove("btn-success");
                btnCompletada.classList.add("btn-success", "opacity-50");
                btnCompletada.disabled = true;
                btnCompletada.textContent = "✅ Clase completada";
            } else {
                btnCompletada.disabled = false;
                btnCompletada.textContent = "Marcar como Completada";
                btnCompletada.setAttribute("data-id", evento.id);
                btnCompletada.classList.remove("btn-secondary", "opacity-50");
                btnCompletada.classList.add("btn-success");
            }

            document.getElementById('btnEditarClase').onclick = function () {
                abrirFormularioEdicion(evento.id);
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalDetalleClase'));
                if (modal) modal.hide();
            };

            document.getElementById('btnEliminarClase').onclick = function () {
                const btn = this;
                const originalText = btn.innerHTML;

                btn.disabled = true;
                btn.innerHTML = `<span class="spinner-border spinner-sm" role="status" aria-hidden="true"></span> Eliminando...`;

                eliminarClase(evento.id, function () {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('modalDetalleClase'));
                    if (modal) modal.hide();

                    btn.disabled = false;
                    btn.innerHTML = originalText;
                });
            };

            const modal = new bootstrap.Modal(document.getElementById('modalDetalleClase'));
            modal.show();
        }
    });

    // Marcar clase como completada
    document.getElementById("btnClaseCompletada").addEventListener("click", function () {
        const claseId = this.getAttribute("data-id");

        if (!claseId) {
            mostrarToast("No se pudo identificar la clase", "danger");
            return;
        }

        fetch("php/marcar_completada.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `id=${claseId}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const modalInstance = bootstrap.Modal.getInstance(document.getElementById("modalDetalleClase"));
                if (modalInstance) modalInstance.hide();

                cargarClases();
                if (calendarInstancia?.refetchEvents) calendarInstancia.refetchEvents();
                if (typeof cargarPagos === "function") cargarPagos();
                if (typeof cargarFacturacionMensual === "function") cargarFacturacionMensual();

                mostrarToast("Clase marcada como completada", "success");
            } else {
                mostrarToast("Error: " + data.message, "danger");
            }
        })
        .catch(error => {
            console.error("Error al marcar clase como completada:", error);
            mostrarToast("Error al marcar como completada", "danger");
        });
    });

    calendar.render();
    return calendar;
}




function abrirFormularioEdicion(id) {
    fetch('php/listar_clases.php')
        .then(response => response.json())
        .then(data => {
            const clase = data.find(c => c.id == id);
            if (!clase) {
                mostrarToast("Clase no encontrada", true);
                return;
            }

            // Llenar campos del formulario
            document.getElementById("clase_id").value = clase.id;
            document.getElementById("editar_fecha").value = clase.fecha;
            document.getElementById("editar_hora_inicio").value = clase.hora_inicio;
            document.getElementById("editar_hora_fin").value = clase.hora_fin;
            document.getElementById("editar_alumno").value = clase.alumno_nombre;
            document.getElementById("editar_email_alumno").value = clase.email;
            document.getElementById("editar_telefono_alumno").value = clase.telefono;
            document.getElementById("editar_observaciones").value = clase.observaciones || '';
            document.getElementById("editar_importe_pagado").value = clase.importe_pagado || '';

            cargarListaProfesoresEdicion(clase.profesor_id);

            // 👉 Mostrar el nuevo modal
            const modal = new bootstrap.Modal(document.getElementById('modalEditarClase'));
            modal.show();
        });
}



function mostrarLeyendaProfesores(profesores) {
    const contenedor = document.getElementById('leyendaProfesores');
    contenedor.innerHTML = ''; // limpiar contenido previo

    const coloresAsignados = {};

    profesores.forEach(nombre => {
        if (!coloresAsignados[nombre]) {
            const color = generarColorDesdeTexto(nombre);
            coloresAsignados[nombre] = color;

            const etiqueta = document.createElement('div');
            etiqueta.className = 'd-flex align-items-center gap-2';
            etiqueta.innerHTML = `
                <span style="width: 16px; height: 16px; background-color: ${color}; border-radius: 4px; display: inline-block;"></span>
                <span>${nombre}</span>
            `;
            contenedor.appendChild(etiqueta);
        }
    });
}

function mostrarToast(mensaje, tipo = "success") {
    const toast = document.getElementById("toastGeneral");
    const toastBody = document.getElementById("toastMensaje");

    // Setea el mensaje
    toastBody.textContent = mensaje;

    // Limpia clases previas de color y agrega la nueva
    toast.className = "toast align-items-center text-white border-0 bg-" + tipo;

    // Muestra el toast
    const toastInstance = new bootstrap.Toast(toast);
    toastInstance.show();
}

