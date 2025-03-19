document.addEventListener("DOMContentLoaded", function () {
    cargarProfesores();
    cargarClases();
});

function mostrarFormularioProfesor() {
    const formulario = document.getElementById("formulario-profesor");
    formulario.style.display = formulario.style.display === "none" ? "block" : "none";
}

function agregarProfesor() {
    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const tarifa_hora = document.getElementById("tarifa_hora").value.trim();

    console.log("Valores ingresados:");
    console.log("Nombre:", nombre);
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Teléfono:", telefono);
    console.log("Tarifa por Hora:", tarifa_hora);

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
        console.log("Respuesta del servidor:", data);
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


function cargarProfesores() {
    fetch("php/listar_profesores.php")
    .then(response => response.json())
    .then(data => {
        console.log("Profesores recibidos:", data); // Depuración
        const tabla = document.getElementById("tablaProfesores");
        tabla.innerHTML = ""; // Limpiar la tabla antes de agregar nuevos datos

        data.forEach(profesor => {
            let fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${profesor.id}</td>
                <td>${profesor.nombre}</td>
                <td>${profesor.email}</td>
                <td>${profesor.telefono && profesor.telefono.trim() !== "" ? profesor.telefono : 'No registrado'}</td>
                <td>€${profesor.tarifa_hora && profesor.tarifa_hora !== "0.00" ? profesor.tarifa_hora : 'No definido'}</td>
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


function editarProfesor(id, nombre, email, telefono, tarifa) {
    document.getElementById("profesor_id").value = id;
    document.getElementById("editar_nombre").value = nombre;
    document.getElementById("editar_email").value = email;
    document.getElementById("editar_telefono").value = telefono;
    document.getElementById("editar_tarifa").value = tarifa;
    
    document.getElementById("formulario-editar-profesor").style.display = "block";
}

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


function asignarClase() {
    const profesorId = document.getElementById("profesor").value;
    const fecha = document.getElementById("fecha").value;
    const horaInicio = document.getElementById("hora_inicio").value;
    const horaFin = document.getElementById("hora_fin").value;
    const alumno = document.getElementById("alumno").value;

    if (!profesorId || !fecha || !horaInicio || !horaFin || !alumno) {
        alert("Todos los campos son obligatorios");
        return;
    }

    fetch("php/agregar_clase.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `profesor_id=${encodeURIComponent(profesorId)}&fecha=${encodeURIComponent(fecha)}&hora_inicio=${encodeURIComponent(horaInicio)}&hora_fin=${encodeURIComponent(horaFin)}&alumno=${encodeURIComponent(alumno)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Clase asignada correctamente");
            cargarClases();

            // Vaciar los campos del formulario
            document.getElementById("profesor").value = "";
            document.getElementById("fecha").value = "";
            document.getElementById("hora_inicio").value = "";
            document.getElementById("hora_fin").value = "";
            document.getElementById("alumno").value = "";

            // Cerrar el modal después de guardar
            let modal = new bootstrap.Modal(document.getElementById("modalClase"));
            modal.hide();
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(error => console.error("Error:", error));
}

function cargarClases() {
    fetch("php/listar_clases.php")
    .then(response => response.json())
    .then(data => {
        const tabla = document.getElementById("tablaClases");
        tabla.innerHTML = "";
        data.forEach(clase => {
            let fila = `<tr>
                <td>${clase.id}</td>
                <td>${clase.profesor_nombre}</td>
                <td>${clase.fecha}</td>
                <td>${clase.hora_inicio} - ${clase.hora_fin}</td>
                <td>${clase.alumno_nombre}</td>
            </tr>`;
            tabla.innerHTML += fila;
        });
    })
    .catch(error => console.error("Error al cargar las clases:", error));
}

window.mostrarFormularioClase = function () {
    console.log("Función mostrarFormularioClase ejecutada");
    const formulario = document.getElementById("formulario-clase");
    formulario.style.display = formulario.style.display === "none" ? "block" : "none";

    // Cargar profesores en el formulario cada vez que se abra
    cargarListaProfesores();
};



function cargarListaProfesores() {
    fetch("php/listar_profesores.php")
    .then(response => response.json())
    .then(data => {
        const selectProfesores = document.getElementById("profesor");
        selectProfesores.innerHTML = '<option value="">Seleccione un profesor</option>'; // Reiniciar opciones

        data.forEach(profesor => {
            let opcion = document.createElement("option");
            opcion.value = profesor.id;
            opcion.textContent = profesor.nombre;
            selectProfesores.appendChild(opcion);
        });
    })
    .catch(error => console.error("Error al cargar los profesores en el formulario:", error));
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
                        </td>
                    </tr>`;
                tabla.innerHTML += fila;
            });
        })
        .catch(error => console.error("Error al cargar las clases:", error));
}

// Mostrar formulario de edición con los datos actuales de la clase
function editarClase(id, profesorId, fecha, horaInicio, horaFin, alumno) {
    document.getElementById("clase_id").value = id;
    document.getElementById("editar_fecha").value = fecha;
    document.getElementById("editar_hora_inicio").value = horaInicio;
    document.getElementById("editar_hora_fin").value = horaFin;
    document.getElementById("editar_alumno").value = alumno;

    // Cargar la lista de profesores antes de mostrar el formulario
    cargarListaProfesoresEdicion(profesorId);

    // Mostrar el formulario de edición de clase
    document.getElementById("formulario-editar-clase").style.display = "block";
}

function cargarListaProfesoresEdicion(profesorSeleccionado) {
    fetch("php/listar_profesores.php")
        .then(response => response.json())
        .then(data => {
            const selectProfesores = document.getElementById("editar_profesor");
            selectProfesores.innerHTML = '<option value="">Seleccione un profesor</option>'; // Reiniciar opciones

            data.forEach(profesor => {
                let opcion = document.createElement("option");
                opcion.value = profesor.id;
                opcion.textContent = profesor.nombre;

                // Si este profesor es el que ya estaba asignado, lo seleccionamos
                if (profesor.id == profesorSeleccionado) {
                    opcion.selected = true;
                }

                selectProfesores.appendChild(opcion);
            });
        })
        .catch(error => console.error("Error al cargar los profesores en el formulario de edición:", error));
}


// Guardar cambios de la clase editada
function guardarEdicionClase() {
    const id = document.getElementById("clase_id").value;
    const profesorId = document.getElementById("editar_profesor").value;
    const fecha = document.getElementById("editar_fecha").value;
    const horaInicio = document.getElementById("editar_hora_inicio").value;
    const horaFin = document.getElementById("editar_hora_fin").value;
    const alumno = document.getElementById("editar_alumno").value;

    fetch("php/editar_clase.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${id}&profesor_id=${profesorId}&fecha=${fecha}&hora_inicio=${horaInicio}&hora_fin=${horaFin}&alumno=${alumno}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Clase actualizada correctamente");
            document.getElementById("formulario-editar-clase").style.display = "none";
            cargarClases();
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(error => console.error("Error al actualizar la clase:", error));
}
