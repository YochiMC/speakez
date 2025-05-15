import { database, ref, onValue, set } from '../legacy/firebase.js';

export class FirebaseModel {
    constructor() {
        this.listeners = {};
        this.data = {
            comando: "",
            sensores: {
                proximidad: false,
                rostro: false,
                temperatura: 0,
                humedad: 0
            }
        };
    }

    /**
     * Suscribirse a cambios en un path específico de Firebase
     * @param {string} path - Ruta en Firebase (ejemplo: 'Voz/texto_reconocido')
     * @param {Function} callback - Función a ejecutar cuando hay cambios
     * @returns {FirebaseModel} - Instancia para encadenamiento
     */
    subscribe(path, callback) {
        const reference = ref(database, path);
        this.listeners[path] = onValue(reference, snapshot => {
            const value = snapshot.val();
            callback(value);
        });
        return this;
    }

    /**
     * Cancelar la suscripción a un path
     * @param {string} path - Ruta en Firebase a la que se cancelará la suscripción
     * @returns {FirebaseModel} - Instancia para encadenamiento
     */
    unsubscribe(path) {
        if (this.listeners[path]) {
            this.listeners[path]();
            delete this.listeners[path];
        }
        return this;
    }

    /**
     * Establecer un valor en Firebase
     * @param {string} path - Ruta en Firebase
     * @param {any} value - Valor a establecer
     * @returns {Promise} - Promesa que se resuelve cuando se completa la operación
     */
    setValue(path, value) {
        const reference = ref(database, path);
        return set(reference, value);
    }

    /**
     * Restablecer el valor del comando de voz
     * @returns {Promise} - Promesa que se resuelve cuando se completa la operación
     */
    resetComando() {
        return this.setValue('Voz/texto_reconocido', "");
    }
}