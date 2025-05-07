// profesor_clases.js

document.addEventListener("DOMContentLoaded", function () {
    mostrarSeccion('clases');
});

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
            url: 'php/profesor/obtener_clases_profesor.php',
            method: 'POST'
        },
        eventClick: function (info) {
            abrirModalDetalleClase(info.event);
        },
        viewDidMount: function (arg) {
            const titulo = arg.view.title;
            const capitalizado = titulo.charAt(0).toUpperCase() + titulo.slice(1);
            document.querySelector('.fc-toolbar-title').textContent = capitalizado;
        }
    });

    calendar.render();
    return calendar;
}

function abrirModalDetalleClase(evento) {
    const datos = evento.extendedProps;
    const fecha = evento.start;
    const fechaFormateada = `${String(fecha.getDate()).padStart(2, '0')}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${fecha.getFullYear()}`;

    document.getElementById('detalleAlumno').innerText = datos.alumno;
    document.getElementById('detalleFecha').innerText = fechaFormateada;
    document.getElementById('detalleHorario').innerText = `${evento.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${evento.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    document.getElementById('detalleEmail').innerText = datos.email || '-';
    document.getElementById('detalleTelefono').innerText = datos.telefono || '-';
    document.getElementById('detalleObservaciones').innerText = datos.observaciones || 'Sin observaciones';

    const modal = new bootstrap.Modal(document.getElementById('modalDetalleClase'));
    document.getElementById('modalDetalleClase').dataset.idClase = evento.id;

    const btnCompletada = document.getElementById('btnClaseCompletada');

// Estado visual del botón según estado de la clase
if (datos.estado === 'completada') {
    btnCompletada.classList.remove("btn-success");
    btnCompletada.classList.add("btn-success", "opacity-50");
    btnCompletada.disabled = true;
    btnCompletada.textContent = "✅ Clase completada";
} else {
    btnCompletada.disabled = false;
    btnCompletada.textContent = "Marcar como Completada";
    btnCompletada.classList.remove("btn-secondary", "opacity-50");
    btnCompletada.classList.add("btn-success");
    btnCompletada.onclick = marcarClaseComoCompletada;
}

    document.getElementById('btnEditarClase').onclick = abrirFormularioEdicionClaseProfesor;
    document.getElementById('btnEliminarClase').onclick = eliminarClaseProfesor;

    modal.show();
}

function marcarClaseComoCompletada() {
    const btn = document.getElementById("btnClaseCompletada");
    const claseId = document.getElementById('modalDetalleClase').dataset.idClase;

    if (!claseId) return mostrarToast("Clase no identificada", "danger");

    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner-border spinner-sm" role="status"></span> Guardando...`;

    fetch("php/marcar_completada.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${claseId}`
    })
    .then(res => res.json())
    .then(data => {
        btn.disabled = false;
        btn.innerHTML = originalText;

        if (data.success) {
            bootstrap.Modal.getInstance(document.getElementById("modalDetalleClase")).hide();
            if (calendarInstancia?.refetchEvents) calendarInstancia.refetchEvents();
            if (typeof cargarPagosProfesor === "function") cargarPagosProfesor(); // 👈 Esta es la línea nueva
            mostrarToast("Clase completada con éxito", "success");
        } else {
            mostrarToast("Error: " + data.message, "danger");
        }
    })
    .catch(err => {
        console.error("Error:", err);
        btn.disabled = false;
        btn.innerHTML = originalText;
        mostrarToast("Error al marcar como completada", "danger");
    });
}


function abrirFormularioEdicionClaseProfesor() {
    const claseId = document.getElementById('modalDetalleClase').dataset.idClase;

    fetch('php/listar_clases.php')
        .then(res => res.json())
        .then(data => {
            const clase = data.find(c => c.id == claseId);
            if (!clase) return mostrarToast("Clase no encontrada", "danger");

            document.getElementById("clase_id").value = clase.id;
            document.getElementById("editar_fecha").value = clase.fecha;
            document.getElementById("editar_hora_inicio").value = clase.hora_inicio;
            document.getElementById("editar_hora_fin").value = clase.hora_fin;
            document.getElementById("editar_alumno").value = clase.alumno_nombre;
            document.getElementById("editar_email_alumno").value = clase.email;
            document.getElementById("editar_telefono_alumno").value = clase.telefono;
            document.getElementById("editar_observaciones").value = clase.observaciones || '';

            bootstrap.Modal.getInstance(document.getElementById("modalDetalleClase")).hide();

            const modal = new bootstrap.Modal(document.getElementById('modalEditarClase'));
            modal.show();
        });
}

function guardarEdicionClaseProfesor() {
    const btn = document.getElementById("btnGuardarEdicion");
    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner-border spinner-sm" role="status"></span> Guardando...`;

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
    .then(res => res.json())
    .then(data => {
        btn.disabled = false;
        btn.innerHTML = originalText;

        if (data.success) {
            bootstrap.Modal.getInstance(document.getElementById("modalEditarClase")).hide();
            if (calendarInstancia?.refetchEvents) calendarInstancia.refetchEvents();
            mostrarToast("Clase editada correctamente", "success");
        } else {
            mostrarToast("Error al actualizar la clase", "danger");
        }
    })
    .catch(err => {
        console.error("Error:", err);
        btn.disabled = false;
        btn.innerHTML = originalText;
        mostrarToast("Error de red", "danger");
    });
}

function eliminarClaseProfesor() {
    const claseId = document.getElementById('modalDetalleClase').dataset.idClase;
    const btn = document.getElementById("btnEliminarClase");

    if (!confirm("¿Eliminar esta clase?")) return;

    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner-border spinner-sm" role="status"></span> Eliminando...`;

    fetch("php/eliminar_clase.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${claseId}`
    })
    .then(res => res.json())
    .then(data => {
        btn.disabled = false;
        btn.innerHTML = originalText;

        if (data.success) {
            bootstrap.Modal.getInstance(document.getElementById("modalDetalleClase")).hide();
            if (calendarInstancia?.refetchEvents) calendarInstancia.refetchEvents();
            mostrarToast("Clase eliminada correctamente", "success");
        } else {
            mostrarToast("Error al eliminar clase", "danger");
        }
    })
    .catch(err => {
        console.error("Error:", err);
        btn.disabled = false;
        btn.innerHTML = originalText;
        mostrarToast("Error de red al eliminar", "danger");
    });
}

function mostrarToast(mensaje, tipo = "success") {
    const toast = document.getElementById("toastGeneral");
    const toastBody = document.getElementById("toastMensaje");

    toastBody.textContent = mensaje;
    toast.className = "toast align-items-center text-white bg-" + tipo + " border-0";

    new bootstrap.Toast(toast).show();
}
