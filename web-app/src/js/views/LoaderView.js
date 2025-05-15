/**
 * LoaderView.js - Maneja la visualización del loader
 */

class LoaderView {
    /**
     * Muestra el loader con un retraso
     * @param {number} delay - Retraso en milisegundos
     */
    showLoader(delay = 2000) {
        console.log("[Loader] Activando loader...");
        setTimeout(() => {
            const loaderContainer = document.getElementById('loaderContainer');
            if (loaderContainer) {
                loaderContainer.style.display = 'flex';
            } else {
                console.error("[Loader] Elemento loaderContainer no encontrado");
            }
        }, delay);
    }
    
    /**
     * Oculta el loader con un retraso
     * @param {number} delay - Retraso en milisegundos
     */
    hideLoader(delay = 2000) {
        console.log("[Loader] Desactivando loader...");
        setTimeout(() => {
            const loaderContainer = document.getElementById('loaderContainer');
            if (loaderContainer) {
                loaderContainer.style.display = 'none';
            } else {
                console.error("[Loader] Elemento loaderContainer no encontrado");
            }
        }, delay);
    }
}

// Exporta una instancia única de LoaderView (Singleton)
const loaderView = new LoaderView();
export default loaderView;