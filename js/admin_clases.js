// admin_clases.js
// Funciones para la gestión de clases en el panel admin

document.addEventListener("DOMContentLoaded", function () {
    cargarClases()
    mostrarSeccion('clases');
});

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
    const profesorId = document.getElementById("profesor").value;
    const fecha = document.getElementById("fecha").value;
    const horaInicio = document.getElementById("hora_inicio").value;
    const horaFin = document.getElementById("hora_fin").value;
    const alumno = document.getElementById("alumno").value.trim();
    const email = document.getElementById("email_alumno").value.trim();
    const telefono = document.getElementById("telefono_alumno").value.trim();
    const observaciones = document.getElementById("observaciones").value.trim();

    if (!profesorId || !fecha || !horaInicio || !horaFin || !alumno) {
        alert("Todos los campos son obligatorios.");
        return;
    }

    fetch("php/agregar_clase.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `profesor_id=${profesorId}&fecha=${fecha}&hora_inicio=${horaInicio}&hora_fin=${horaFin}&alumno=${encodeURIComponent(alumno)}&email=${encodeURIComponent(email)}&telefono=${encodeURIComponent(telefono)}&observaciones=${encodeURIComponent(observaciones)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Clase asignada correctamente.");
            document.getElementById("formulario-clase").style.display = "none";
            cargarClases();
            if (typeof cargarPagos === "function") cargarPagos();
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(error => console.error("Error al asignar la clase:", error));
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

function editarClase(id, profesorId, fecha, horaInicio, horaFin, alumno) {
    document.getElementById("clase_id").value = id;
    document.getElementById("editar_fecha").value = fecha;
    document.getElementById("editar_hora_inicio").value = horaInicio;
    document.getElementById("editar_hora_fin").value = horaFin;
    document.getElementById("editar_alumno").value = alumno;

    cargarListaProfesoresEdicion(profesorId);
    document.getElementById("formulario-editar-clase").style.display = "block";
}

function guardarEdicionClase() {
    const id = document.getElementById("clase_id").value;
    const profesorId = document.getElementById("editar_profesor").value;
    const fecha = document.getElementById("editar_fecha").value;
    const horaInicio = document.getElementById("editar_hora_inicio").value;
    const horaFin = document.getElementById("editar_hora_fin").value;
    const alumno = document.getElementById("editar_alumno").value.trim();

    if (!id || !profesorId || !fecha || !horaInicio || !horaFin || !alumno) {
        alert("Todos los campos son obligatorios.");
        return;
    }

    fetch("php/editar_clase.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${id}&profesor_id=${profesorId}&fecha=${fecha}&hora_inicio=${horaInicio}&hora_fin=${horaFin}&alumno=${encodeURIComponent(alumno)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Clase editada correctamente.");
            document.getElementById("formulario-editar-clase").style.display = "none";
            cargarClases();
            if (typeof cargarPagos === "function") cargarPagos();
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(error => console.error("Error al editar la clase:", error));
}

function eliminarClase(id) {
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
            alert("Clase eliminada correctamente.");
            cargarClases();
            if (typeof cargarPagos === "function") cargarPagos();
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(error => console.error("Error al eliminar la clase:", error));
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
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listWeek'
        },
        events: function(fetchInfo, successCallback, failureCallback) {
            fetch('php/listar_clases.php')
                .then(response => response.json())
                .then(data => {
                    const eventos = data.map(clase => ({
                        id: clase.id,
                        title: clase.alumno_nombre,
                        start: `${clase.fecha}T${clase.hora_inicio}`,
                        end: `${clase.fecha}T${clase.hora_fin}`,
                        extendedProps: {
                            profesor: clase.profesor_nombre,
                            observaciones: clase.observaciones
                        }
                    }));
                    successCallback(eventos);
                })
                .catch(error => {
                    console.error('Error al cargar eventos:', error);
                    failureCallback(error);
                });
        },
        eventClick: function(info) {
            alert(`Alumno: ${info.event.title}\nProfesor: ${info.event.extendedProps.profesor}\nObservaciones: ${info.event.extendedProps.observaciones || "Ninguna"}`);
        }
    });

    calendar.render();
}

function mostrarClasesHoy() {
    fetch('php/listar_clases.php')
        .then(response => response.json())
        .then(data => {
            const hoy = new Date().toISOString().split('T')[0];
            const tbody = document.getElementById('clasesHoy');
            if (!tbody) return;
            tbody.innerHTML = '';

            const clasesHoy = data.filter(c => c.fecha === hoy);

            clasesHoy.forEach(clase => {
                tbody.innerHTML += `
                    <tr>
                        <td>${clase.hora_inicio} - ${clase.hora_fin}</td>
                        <td>${clase.alumno_nombre}</td>
                        <td>${clase.profesor_nombre}</td>
                        <td>${clase.observaciones || 'Sin info'}</td>
                    </tr>
                `;
            });
        });
}

