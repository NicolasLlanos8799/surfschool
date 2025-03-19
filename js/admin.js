// =========================================================
// Archivo: admin.js
// Funcionalidad: Gestionar profesores, clases y su edición en el panel de administración.
// =========================================================

// Ejecutar funciones principales al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    cargarProfesores();
    cargarClases();
});

// =========================================================
// Gestión de Profesores
// =========================================================

/**
 * Muestra u oculta el formulario para agregar un nuevo profesor
 */
function mostrarFormularioProfesor() {
    const formulario = document.getElementById("formulario-profesor");
    formulario.style.display = formulario.style.display === "none" ? "block" : "none";
}

/**
 * Agrega un nuevo profesor a la base de datos
 * Valida los datos antes de enviarlos al servidor
 */
function agregarProfesor() {
    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const tarifa_hora = document.getElementById("tarifa_hora").value.trim();

    if (!nombre || !email || !password || !telefono || !tarifa_hora) {
        alert("Todos los campos son obligatorios");
        return;
    }

    fetch("php/agregar_profesor.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `nombre=${encodeURIComponent(nombre)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&telefono=${encodeURIComponent(telefono)}&tarifa_hora=${encodeURIComponent(tarifa_hora)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Profesor agregado exitosamente");
            document.getElementById("nombre").value = "";
            document.getElementById("email").value = "";
            document.getElementById("password").value = "";
            document.getElementById("telefono").value = "";
            document.getElementById("tarifa_hora").value = "";
            cargarProfesores();
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(error => console.error("Error:", error));
}

/**
 * Carga la lista de profesores desde el servidor y los muestra en la tabla
 */
function cargarProfesores() {
    fetch("php/listar_profesores.php")
    .then(response => response.json())
    .then(data => {
        const tabla = document.getElementById("tablaProfesores");
        tabla.innerHTML = ""; // Limpiar la tabla antes de agregar nuevos datos

        data.forEach(profesor => {
            let fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${profesor.id}</td>
                <td>${profesor.nombre}</td>
                <td>${profesor.email}</td>
                <td>${profesor.telefono ? profesor.telefono : 'No registrado'}</td>
                <td>€${profesor.tarifa_hora !== "0.00" ? profesor.tarifa_hora : 'No definido'}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editarProfesor(${profesor.id}, '${profesor.nombre}', '${profesor.email}', '${profesor.telefono}', ${profesor.tarifa_hora})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarProfesor(${profesor.id})">Eliminar</button>
                </td>
            `;
            tabla.appendChild(fila);
        });
    })
    .catch(error => console.error("Error al cargar los profesores:", error));
}

/**
 * Elimina un profesor de la base de datos después de confirmación
 */
function eliminarProfesor(id) {
    if (!confirm("¿Estás seguro de que deseas eliminar este profesor? Esta acción no se puede deshacer.")) {
        return;
    }

    fetch("php/eliminar_profesor.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${id}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Profesor eliminado correctamente");
            cargarProfesores();
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(error => console.error("Error al eliminar el profesor:", error));
}

/**
 * Muestra el formulario para editar un profesor con sus datos actuales
 */
function editarProfesor(id, nombre, email, telefono, tarifa) {
    document.getElementById("profesor_id").value = id;
    document.getElementById("editar_nombre").value = nombre;
    document.getElementById("editar_email").value = email;
    document.getElementById("editar_telefono").value = telefono;
    document.getElementById("editar_tarifa").value = tarifa;

    document.getElementById("formulario-editar-profesor").style.display = "block";
}

/**
 * Guarda los cambios realizados en la edición de un profesor
 */
function guardarEdicionProfesor() {
    const id = document.getElementById("profesor_id").value;
    const nombre = document.getElementById("editar_nombre").value;
    const email = document.getElementById("editar_email").value;
    const telefono = document.getElementById("editar_telefono").value;
    const tarifa = document.getElementById("editar_tarifa").value;

    fetch("php/editar_profesor.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${id}&nombre=${encodeURIComponent(nombre)}&email=${encodeURIComponent(email)}&telefono=${encodeURIComponent(telefono)}&tarifa=${encodeURIComponent(tarifa)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Profesor actualizado correctamente");
            document.getElementById("formulario-editar-profesor").style.display = "none";
            cargarProfesores();
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(error => console.error("Error al actualizar el profesor:", error));
}

// =========================================================
// Gestión de Clases
// =========================================================

/**
 * Carga la lista de clases desde la base de datos y las muestra en la tabla
 */
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
                    </td>
                </tr>`;
            tabla.innerHTML += fila;
        });
    })
    .catch(error => console.error("Error al cargar las clases:", error));
}

/**
 * Muestra el formulario de edición con los datos actuales de la clase
 */
function editarClase(id, profesorId, fecha, horaInicio, horaFin, alumno) {
    document.getElementById("clase_id").value = id;
    document.getElementById("editar_fecha").value = fecha;
    document.getElementById("editar_hora_inicio").value = horaInicio;
    document.getElementById("editar_hora_fin").value = horaFin;
    document.getElementById("editar_alumno").value = alumno;

    // Cargar la lista de profesores antes de mostrar el formulario
    cargarListaProfesoresEdicion(profesorId);

    document.getElementById("formulario-editar-clase").style.display = "block";
}

/**
 * Carga la lista de profesores en el formulario de edición de clases
 */
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
