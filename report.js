// report.js

// Validación nativa del formulario con Bootstrap
(function() {
    'use strict'
    const forms = document.querySelectorAll('#reportForm')
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }
            form.classList.add('was-validated')
            if (form.checkValidity()) {
                event.preventDefault()
                processReport();
            }
        }, false)
    })
})();

function processReport() {
    // Recopilar datos del formulario
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const incidentType = document.getElementById('incidentType').value;
    const busNumber = document.getElementById('busNumber').value.trim();
    const incidentDate = document.getElementById('incidentDate').value;
    const incidentTime = document.getElementById('incidentTime').value;
    const incidentMessage = document.getElementById('incidentMessage').value.trim();
    const location = document.getElementById('location').value.trim();

    // Plantillas predeterminadas según el tipo de incidencia
    let plantilla = "";
    switch (incidentType) {
        case "Retraso":
            plantilla = "El autobús presenta un retraso significativo.";
            break;
        case "Avería":
            plantilla = "El autobús sufre una avería que afecta la seguridad y el servicio.";
            break;
        case "Higiene":
            plantilla = "El nivel de higiene del autobús es preocupante.";
            break;
        case "Conductor":
            plantilla = "La conducta del conductor requiere atención urgente.";
            break;
        case "Capacidad":
            plantilla = "Se reporta problema en la capacidad y saturación del servicio.";
            break;
        case "Otro":
            plantilla = "Se reporta una incidencia no especificada.";
            break;
        default:
            plantilla = "";
    }

    // Construcción del mensaje final en un estilo natural y conversacional
    let message = "Buenos días, me gustaría reportar una incidencia en el servicio de autobuses.\n\n";
    message += `Mi nombre es ${fullName} y mi correo es ${email}.\n`;
    message += `Mi teléfono es ${phone}.\n\n`;
    message += "Detalles del reporte:\n";
    message += `- Tipo de incidencia: ${incidentType}.\n`;
    if (busNumber) message += `- Ruta/Autobús: ${busNumber}.\n`;
    message += `- Fecha y hora: ${incidentDate} ${incidentTime}.\n`;
    if (location) message += `- Ubicación: ${location}.\n`;
    message += `- Incidencia: ${plantilla}\n`;
    if (incidentMessage) {
        message += `- Comentarios adicionales: ${incidentMessage}\n`;
    }
    message += "\nReporte enviado desde la aplicación Yovoy Aguascalientes. ¡Gracias por atender mi reporte y que tengas un excelente día!";

    // Codificar el mensaje para URL
    const encodedMessage = encodeURIComponent(message);

    // Número de WhatsApp destino (incluye código de país: 52 para México)
    const whatsappNumber = "524499118294";
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // Efecto visual de éxito en el formulario
    const form = document.getElementById('reportForm');
    form.classList.add('report-success');

    // Abrir WhatsApp después de un breve retraso para mostrar la animación
    setTimeout(() => {
        window.open(whatsappURL, '_blank');
        form.reset();
        form.classList.remove('was-validated', 'report-success');
    }, 800);
}