// =========================================================
// Archivo: login.js
// Funcionalidad: Manejo del formulario de inicio de sesión
// =========================================================

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Evita la recarga de la página

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const errorMessage = document.getElementById("error-message");

        fetch("php/login.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Guarda el ID del profesor si existe
                if (data.id_profesor) {
                    localStorage.setItem("id_profesor", data.id_profesor);
                }

                // Redirige según el rol
                window.location.href = data.redirect;
            } else {
                errorMessage.textContent = data.message;
            }
        })
        .catch(error => {
            errorMessage.textContent = "Error en la conexión con el servidor.";
            console.error("Error:", error);
        });
    });
});
