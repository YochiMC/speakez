// Inicializar la página
document.addEventListener('DOMContentLoaded', function() {
    initCamera();
    updateClock();
    fetchWeather();
    
    // Actualizar el reloj cada segundo
    setInterval(updateClock, 1000);
    
    // Actualizar el clima cada 10 minutos
    setInterval(fetchWeather, 600000);
});

// Mostrar subsección
function showSubsection(section) {
    const sectionElement = document.getElementById(section + '-section');
    if (sectionElement) {
        sectionElement.style.display = 'flex';
        sectionElement.classList.add('animate-in');
    }
}

// Cerrar subsección
function closeSubsection(sectionId) {
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
        sectionElement.classList.remove('animate-in');
        sectionElement.style.display = 'none';
    }
}