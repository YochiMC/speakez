/**
 * FirebaseModel.js - Maneja toda la interacción con Firebase
 */

// Importar desde Firebase (usando ES Modules correctamente)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

class FirebaseModel {
    constructor() {
        // Configuración de Firebase
        this.firebaseConfig = {
            apiKey: "AIzaSyB7S24-eWxAgZPSylbzGwzSdtR2U4L--hE",
            authDomain: "sistemas-programables-b4-d5995.firebaseapp.com",
            databaseURL: "https://sistemas-programables-b4-d5995-default-rtdb.firebaseio.com",
            projectId: "sistemas-programables-b4-d5995",
            storageBucket: "sistemas-programables-b4-d5995.firebasestorage.app",
            messagingSenderId: "967331639215",
            appId: "1:967331639215:web:f743dcf1554659f4c5495a",
            measurementId: "G-EDNN9CSXPT"
        };
        
        // Inicializar Firebase
        this.app = initializeApp(this.firebaseConfig);
        this.database = getDatabase(this.app);
        
        // Crear referencias a nodos frecuentemente usados
        this.voiceCommandRef = ref(this.database, 'Voz/texto_reconocido');
        this.sensorsRef = ref(this.database, 'Sensores');
        this.temperatureRef = ref(this.database, 'Sensores/dht');
    }
    
    /**
     * Obtiene una referencia a un nodo específico de la base de datos
     * @param {string} path - Ruta al nodo
     * @returns {object} Referencia al nodo
     */
    getRef(path) {
        return ref(this.database, path);
    }
    
    /**
     * Establece un valor en un nodo específico
     * @param {object} reference - Referencia al nodo
     * @param {any} value - Valor a establecer
     * @returns {Promise} Promesa que se resuelve cuando se completa la operación
     */
    setValue(reference, value) {
        return set(reference, value);
    }
    
    /**
     * Escucha cambios en un nodo específico
     * @param {object} reference - Referencia al nodo
     * @param {function} callback - Función a llamar cuando hay cambios
     */
    listenToChanges(reference, callback) {
        onValue(reference, callback);
    }
    
    /**
     * Resetea el valor del comando de voz
     * @returns {Promise} Promesa que se resuelve cuando se completa la operación
     */
    resetVoiceCommand() {
        return this.setValue(this.voiceCommandRef, "")
            .then(() => {
                console.log('El valor de "comando" se ha restablecido a una cadena vacía.');
            })
            .catch((error) => {
                console.error('Error al restablecer el valor de "comando":', error);
            });
    }
}

// Exporta una instancia única de FirebaseModel (Singleton)
const firebaseModel = new FirebaseModel();
export default firebaseModel;
export { ref, onValue, set }; // Exportar funciones de Firebase para compatibilidad