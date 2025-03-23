// =========================================================
// Archivo: login.js
// Funcionalidad: Manejo del formulario de inicio de sesión
// =========================================================

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    /**
     * Maneja el evento de envío del formulario de inicio de sesión
     * Previene el comportamiento por defecto del formulario
     */
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Evita la recarga de la página

        // Obtener los valores de los campos del formulario
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const errorMessage = document.getElementById("error-message"); // Elemento donde se muestra el error

        // Enviar la solicitud de inicio de sesión al servidor
        fetch("php/login.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        })
        .then(response => response.json()) // Convertir la respuesta a JSON
        .then(data => {
            if (data.success) {
                // Si el inicio de sesión es exitoso, redirigir al usuario
                window.location.href = data.redirect;
            } else {
                // Mostrar mensaje de error si el inicio de sesión falla
                errorMessage.textContent = data.message;
            }
        })
        .catch(error => {
            // Manejo de errores en la conexión con el servidor
            errorMessage.textContent = "Error en la conexión con el servidor.";
            console.error("Error:", error);
        });
    });
});
