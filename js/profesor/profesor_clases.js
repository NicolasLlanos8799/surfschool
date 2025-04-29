// ✅ Inicializa el calendario para el profesor
function inicializarCalendario() {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        locale: 'es',
        initialView: 'timeGridWeek',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,dayGridMonth,listWeek'
        },
        events: {
            url: 'php/profesor/obtener_clases_profesor.php', // 🛠️ Creamos este PHP para devolver SOLO sus clases
            method: 'POST'
        },
        eventClick: function (info) {
            abrirModalDetalleClase(info.event);
        },
        dateClick: function (info) {
            abrirModalAsignarClase(info.dateStr);
        }
    });

    calendar.render();
    return calendar;
}

// ✅ Abre el modal de detalle de la clase
function abrirModalDetalleClase(evento) {
    const datos = evento.extendedProps;

    document.getElementById('detalleAlumno').innerText = datos.alumno;
    document.getElementById('detalleFecha').innerText = evento.start.toLocaleDateString();
    document.getElementById('detalleHorario').innerText = `${evento.start.toLocaleTimeString()} - ${evento.end.toLocaleTimeString()}`;
    document.getElementById('detalleEmail').innerText = datos.email || '-';
    document.getElementById('detalleTelefono').innerText = datos.telefono || '-';
    document.getElementById('detalleObservaciones').innerText = datos.observaciones || 'Sin observaciones';

    const modal = new bootstrap.Modal(document.getElementById('modalDetalleClase'));
    document.getElementById('modalDetalleClase').dataset.idClase = evento.id; // Guardamos el ID para acciones
    document.getElementById('btnClaseCompletada').onclick = marcarClaseComoCompletada;
    document.getElementById('btnEditarClase').onclick = abrirFormularioEdicionClaseProfesor;
    document.getElementById('btnEliminarClase').onclick = eliminarClaseProfesor;

    modal.show();
}

// ✅ Función para abrir modal para asignar nueva clase
function abrirModalAsignarClase(fecha) {
    document.getElementById('formAsignarClase').reset();
    document.getElementById('fecha').value = fecha.split('T')[0]; // Solo fecha, no hora
    const modal = new bootstrap.Modal(document.getElementById('modalAsignarClase'));
    modal.show();
}

// 🟢 Marcar clase como completada
function marcarClaseComoCompletada() {
    const claseId = document.getElementById('modalDetalleClase').dataset.idClase;

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

            if (calendarInstancia?.refetchEvents) calendarInstancia.refetchEvents();
            mostrarToast("Clase marcada como completada", "success");
        } else {
            mostrarToast("Error: " + data.message, "danger");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        mostrarToast("Error de red al marcar como completada", "danger");
    });
}

// 🟡 Abre el modal para editar la clase
function abrirFormularioEdicionClaseProfesor() {
    const claseId = document.getElementById('modalDetalleClase').dataset.idClase;

    fetch('php/listar_clases.php')
    .then(response => response.json())
    .then(data => {
        const clase = data.find(c => c.id == claseId);
        if (!clase) {
            mostrarToast("Clase no encontrada", "danger");
            return;
        }

        // Llenar el formulario de edición
        document.getElementById("clase_id").value = clase.id;
        document.getElementById("editar_fecha").value = clase.fecha;
        document.getElementById("editar_hora_inicio").value = clase.hora_inicio;
        document.getElementById("editar_hora_fin").value = clase.hora_fin;
        document.getElementById("editar_alumno").value = clase.alumno_nombre;
        document.getElementById("editar_email_alumno").value = clase.email;
        document.getElementById("editar_telefono_alumno").value = clase.telefono;
        document.getElementById("editar_observaciones").value = clase.observaciones || '';

        // No cargamos lista de profesores (no puede cambiar el profesor)

        const modal = new bootstrap.Modal(document.getElementById('modalEditarClase'));
        modal.show();
    });
}

// 🔴 Eliminar clase
function eliminarClaseProfesor() {
    const claseId = document.getElementById('modalDetalleClase').dataset.idClase;

    if (!confirm("¿Estás seguro de que deseas eliminar esta clase?")) {
        return;
    }

    fetch("php/eliminar_clase.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${claseId}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const modalInstance = bootstrap.Modal.getInstance(document.getElementById("modalDetalleClase"));
            if (modalInstance) modalInstance.hide();

            if (calendarInstancia?.refetchEvents) calendarInstancia.refetchEvents();
            mostrarToast("Clase eliminada correctamente", "success");
        } else {
            mostrarToast("Error: " + data.message, "danger");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        mostrarToast("Error al eliminar la clase", "danger");
    });
}

// ✏️ Guardar cambios de la clase editada (profesor)
function guardarEdicionClaseProfesor() {
    const btn = document.getElementById("btnGuardarEdicion");
    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner-border spinner-sm" role="status" aria-hidden="true"></span> Guardando...`;

    const id = document.getElementById("clase_id").value;
    const fecha = document.getElementById("editar_fecha").value;
    const horaInicio = document.getElementById("editar_hora_inicio").value;
    const horaFin = document.getElementById("editar_hora_fin").value;
    const alumno = document.getElementById("editar_alumno").value.trim();
    const email = document.getElementById("editar_email_alumno").value.trim();
    const telefono = document.getElementById("editar_telefono_alumno").value.trim();
    const observaciones = document.getElementById("editar_observaciones").value.trim();

    if (!id || !fecha || !horaInicio || !horaFin || !alumno) {
        mostrarToast("Todos los campos obligatorios deben estar completos", "warning");
        btn.disabled = false;
        btn.innerHTML = originalText;
        return;
    }

    fetch("php/profesor/editar_clase_profesor.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${id}&fecha=${fecha}&hora_inicio=${horaInicio}&hora_fin=${horaFin}&alumno=${encodeURIComponent(alumno)}&email=${encodeURIComponent(email)}&telefono=${encodeURIComponent(telefono)}&observaciones=${encodeURIComponent(observaciones)}`
    })
    .then(response => response.json())
    .then(data => {
        btn.disabled = false;
        btn.innerHTML = originalText;

        if (data.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarClase'));
            if (modal) modal.hide();

            if (calendarInstancia?.refetchEvents) calendarInstancia.refetchEvents();
            mostrarToast("Clase actualizada correctamente", "success");
        } else {
            mostrarToast("Error al actualizar la clase", "danger");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        btn.disabled = false;
        btn.innerHTML = originalText;
        mostrarToast("Error de red al guardar cambios", "danger");
    });
}
