import { database } from './legacy/firebase.js';
import { FirebaseModel } from './models/FirebaseModel.js';
import { UIView } from './views/UIView.js';
import { WeatherView } from './views/WeatherView.js';
import { AppController } from './controllers/AppController.js';

/**
 * Punto de entrada principal de la aplicación
 * Inicializa la arquitectura MVC
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Inicializando aplicación MVC...');
  
  try {
    // Crear instancias de modelos, vistas y controladores
    const firebaseModel = new FirebaseModel();
    const uiView = new UIView();
    const weatherView = new WeatherView();
    const appController = new AppController(firebaseModel, uiView, weatherView);
    
    // Inicializar la aplicación
    await appController.init();
    
    console.log('Aplicación MVC inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar la aplicación:', error);
  }
});