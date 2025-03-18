document.addEventListener("DOMContentLoaded", function () {
    cargarProfesores();
    cargarClases();
});

function mostrarFormularioProfesor() {
    const formulario = document.getElementById("formulario-profesor");
    formulario.style.display = formulario.style.display === "none" ? "block" : "none";
}

function agregarProfesor() {
    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!nombre || !email || !password) {
        alert("Todos los campos son obligatorios");
        return;
    }

    fetch("php/agregar_profesor.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `nombre=${encodeURIComponent(nombre)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Profesor agregado exitosamente");
            
            document.getElementById("nombre").value = "";
            document.getElementById("email").value = "";
            document.getElementById("password").value = "";
            
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
            let fila = `<tr>
                <td>${profesor.id}</td>
                <td>${profesor.nombre}</td>
                <td>${profesor.email}</td>
            </tr>`;
            tabla.innerHTML += fila;
        });
    })
    .catch(error => console.error("Error al cargar los profesores:", error));
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
