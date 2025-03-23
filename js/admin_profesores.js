// admin_profesores.js
// Funciones para la gestión de profesores en el panel admin

document.addEventListener("DOMContentLoaded", function () {
    cargarProfesores();
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

function cargarProfesores() {
    fetch("php/listar_profesores.php")
    .then(response => response.json())
    .then(data => {
        const tabla = document.getElementById("tablaProfesores");
        tabla.innerHTML = "";

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
