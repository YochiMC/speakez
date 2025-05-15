/**
 * legacy-compatibility.js - Proporciona compatibilidad con el código antiguo
 * Este archivo establece funciones globales para mantener compatibilidad
 * con el código HTML existente que puede llamar a estas funciones.
 */

import navigationController from './controllers/NavigationController.js';

// Exportar funciones al objeto global (window) para mantener compatibilidad
// con el código HTML/JS existente que llame a estas funciones

// Función para mostrar subsección
window.showSubsection = function(section) {
    console.log(`[Legacy] Llamada a showSubsection('${section}')`);
    navigationController.showSection(section);
};

// Función para cerrar subsección
window.closeSubsection = function(sectionId) {
    console.log(`[Legacy] Llamada a closeSubsection('${sectionId}')`);
    navigationController.closeSection(sectionId);
};

// Función para mostrar contenido
window.showContent = function(contentId) {
    console.log(`[Legacy] Llamada a showContent('${contentId}')`);
    // Esta es una llamada directa a la vista ya que contentId es el ID del elemento
    const contentElement = document.getElementById(contentId);
    if (contentElement) {
        contentElement.style.display = 'flex';
        contentElement.classList.add('animate-in');
        document.body.style.overflow = 'hidden';
    }
};

// Función para cerrar contenido
window.closeContent = function(contentId) {
    console.log(`[Legacy] Llamada a closeContent('${contentId}')`);
    // Esta es una llamada directa a la vista ya que contentId es el ID del elemento
    const contentElement = document.getElementById(contentId);
    if (contentElement) {
        contentElement.classList.remove('animate-in');
        setTimeout(() => {
            contentElement.style.display = 'none';
        }, 300);
        document.body.style.overflow = 'auto';
    }
};

// Función para cargar y mostrar contenido
window.loadAndShowContent = async function(section, contentName) {
    console.log(`[Legacy] Llamada a loadAndShowContent('${section}', '${contentName}')`);
    await navigationController.loadAndShowContent(section, contentName);
};

console.log("[Legacy] Funciones de compatibilidad con código antiguo cargadas.");
