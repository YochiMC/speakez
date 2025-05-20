# -*- coding: utf-8 -*-

"""
SISTEMA ESP32-CAM: MÓDULO DE DETECCIÓN QR
Este módulo se encarga exclusivamente de la detección de códigos QR
y el procesamiento de su contenido.

INSTRUCCIONES DE USO:
1. Asegúrate de que la ESP32-CAM esté conectada y transmitiendo video
2. Configura la IP correcta de la ESP32-CAM en ESPCAM_IP
3. Ejecuta este script: python qr_recognition.py
"""

import os
import time
import json
import threading
import requests
import webbrowser
import subprocess
from datetime import datetime
import numpy as np
import cv2
from urllib.parse import urlparse

# Configuración general
FIREBASE_URL = "https://sistemas-programables-b4-d5995-default-rtdb.firebaseio.com"
WEB_URL = "127.0.0.1:8080"

# Configuración ESP32-CAM
ESPCAM_IP = "192.168.62.202"
ESPCAM_STREAM_URL = f"http://{ESPCAM_IP}/stream"

# Configuración de detección de QR
QR_INTERVAL = 1  # Segundos entre escaneos QR
QR_OPEN_BROWSER = True  # Abrir navegador con URL detectada
QR_HISTORY_SIZE = 5  # Guardar las últimas 5 URLs detectadas

# Configuración de almacenamiento
SAVE_FRAMES = True  # Guardar frames con QR detectados
FRAMES_DIR = "detected_qr_frames"  # Directorio para guardar frames

# Variables globales
browser_opened = False
browser_process = None
browser_open_time = None
browser_close_scheduled = False
last_qr_url = ""  # Última URL de QR detectada
qr_url_history = []  # Historial de URLs detectadas
display_error_logged = False  # Para evitar registrar el mismo error repetidamente

# Crear directorios necesarios
if SAVE_FRAMES and not os.path.exists(FRAMES_DIR):
    os.makedirs(FRAMES_DIR)

#------------------------------------------------------------
# FUNCIONES GENERALES
#------------------------------------------------------------

def log_message(message):
    """Registra un mensaje en la consola con timestamp."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"[{timestamp}] {message}"
    print(log_entry)

def setup_display_environment():
    """Configura el entorno de visualización."""
    try:
        if 'DISPLAY' not in os.environ:
            os.environ['DISPLAY'] = ':0'
            log_message("Variable DISPLAY establecida a :0")
    except Exception as e:
        log_message(f"Error configurando entorno: {e}")

#------------------------------------------------------------
# FUNCIONES DE QR
#------------------------------------------------------------

def detect_qr_code(frame):
    """
    Detecta códigos QR en un frame.
    
    Args:
        frame: Imagen en formato OpenCV
    
    Returns:
        Lista de tuplas (datos, puntos) con información del QR
    """
    # Intentar usar pyzbar primero (más robusto)
    try:
        import pyzbar.pyzbar as pyzbar
        decoded_objects = pyzbar.decode(frame)
        if decoded_objects:
            results = []
            for obj in decoded_objects:
                data = obj.data.decode('utf-8')
                points = obj.polygon
                if len(points) == 4:
                    pts = np.array(points, np.int32)
                    pts = pts.reshape((-1, 1, 2))
                    results.append((data, pts))
            return results
    except ImportError:
        pass
    
    # Fallback a OpenCV QR detector
    qr_detector = cv2.QRCodeDetector()
    data, bbox, _ = qr_detector.detectAndDecode(frame)
    
    if data and bbox is not None:
        bbox = bbox.astype(int)
        return [(data, bbox)]
    
    return []

def is_valid_url(url):
    """Verifica si una cadena es una URL válida."""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

def process_qr_url(url):
    """
    Procesa una URL detectada en un código QR.
    Abre el navegador si está configurado para hacerlo.
    """
    global last_qr_url, qr_url_history
    
    if url == last_qr_url:
        return
    
    log_message(f"URL de QR detectada: {url}")
    last_qr_url = url
    
    # Añadir al historial
    if url not in qr_url_history:
        qr_url_history.insert(0, url)
        if len(qr_url_history) > QR_HISTORY_SIZE:
            qr_url_history = qr_url_history[:QR_HISTORY_SIZE]
    
    # Actualizar Firebase
    update_firebase_with_qr(url)
    
    # Abrir en navegador si está configurado
    if QR_OPEN_BROWSER:
        log_message(f"Abriendo URL en navegador: {url}")
        open_webpage(url)

def update_firebase_with_qr(data):
    """
    Actualiza Firebase con los datos del código QR.
    
    Args:
        data: Datos extraídos del código QR
    """
    try:
        # Información básica
        qr_info = {
            "url": data,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "historial": qr_url_history
        }
        
        # Enviar a Firebase
        url = f"{FIREBASE_URL}/QR.json"
        response = requests.put(url, data=json.dumps(qr_info))
        
        if response.ok:
            log_message("QR actualizado en Firebase")
            return True
        else:
            log_message(f"Error actualizando Firebase QR: {response.status_code}")
            return False
    except Exception as e:
        log_message(f"Error en actualización de Firebase QR: {e}")
        return False

def draw_qr_codes(frame, qr_detections):
    """
    Dibuja los códigos QR detectados en la imagen.
    
    Args:
        frame: Imagen original
        qr_detections: Lista de tuplas (datos, puntos) con los QR detectados
    
    Returns:
        Imagen con los códigos QR marcados
    """
    result = frame.copy()
    
    for data, points in qr_detections:
        # Dibujar contorno del QR
        cv2.polylines(result, [points], True, (0, 255, 0), 2)
        
        # Añadir texto con los datos
        x = points[0][0][0]
        y = points[0][0][1]
        
        # Fondo para el texto
        text_size = cv2.getTextSize(data[:20], cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)[0]
        cv2.rectangle(
            result, 
            (x, y - 30), 
            (x + text_size[0] + 10, y - 5), 
            (0, 255, 0), 
            -1
        )
        
        # Texto con los datos del QR
        cv2.putText(
            result, data[:20], (x + 5, y - 10),
            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 2
        )
        
        # Si es una URL, indicarlo
        if is_valid_url(data):
            cv2.putText(
                result, "URL", (x + 5, y - 50),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2
            )
    
    return result

def save_frame_with_qr(frame, qr_data):
    """
    Guarda el frame con el código QR detectado.
    
    Args:
        frame: Imagen en formato OpenCV
        qr_data: Lista de datos extraídos de los códigos QR
    
    Returns:
        Ruta del archivo guardado o None si no se pudo guardar
    """
    if not SAVE_FRAMES or not qr_data:
        return None
    
    try:
        # Crear nombre de archivo con timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{FRAMES_DIR}/qr_{timestamp}.jpg"
        
        # Guardar imagen
        cv2.imwrite(filename, frame)
        
        # Guardar datos en archivo separado
        with open(f"{FRAMES_DIR}/qr_{timestamp}.txt", "w") as f:
            for i, data in enumerate(qr_data):
                f.write(f"QR {i+1}: {data}\n")
        
        log_message(f"Frame con QR guardado como {filename}")
        return filename
    except Exception as e:
        log_message(f"Error guardando frame: {e}")
        return None

#------------------------------------------------------------
# FUNCIONES DE CONTROL DEL NAVEGADOR
#------------------------------------------------------------

def open_webpage(url):
    """Abre una página web en el navegador predeterminado."""
    global browser_opened, browser_process, browser_open_time, browser_close_scheduled
    
    if browser_opened:
        log_message("Navegador ya está abierto, extendiendo tiempo de apertura")
        browser_open_time = datetime.now()
        browser_close_scheduled = False
        return
    
    log_message(f"Abriendo navegador en URL: {url}")
    
    try:
        browser_process = subprocess.Popen(['chromium-browser', '--start-fullscreen', url], 
                                           stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        browser_opened = True
        browser_open_time = datetime.now()
        browser_close_scheduled = False
        log_message("Navegador abierto exitosamente")
        return
    except Exception as e:
        log_message(f"Error abriendo navegador con chromium: {e}")
    
    try:
        browser_process = subprocess.Popen(['firefox', url], 
                                           stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        browser_opened = True
        browser_open_time = datetime.now()
        browser_close_scheduled = False
        log_message("Navegador abierto con firefox")
        return
    except Exception as e:
        log_message(f"Error abriendo navegador con firefox: {e}")
    
    try:
        success = webbrowser.open(url)
        if success:
            browser_opened = True
            browser_open_time = datetime.now()
            browser_close_scheduled = False
            log_message("Navegador abierto con webbrowser")
    except Exception as e:
        log_message(f"Error abriendo navegador: {e}")

def close_webpage():
    """Cierra el navegador web si está abierto."""
    global browser_opened, browser_process, browser_open_time, browser_close_scheduled
    
    if not browser_opened:
        return
    
    log_message("Cerrando navegador...")
    
    if browser_process is not None:
        try:
            browser_process.terminate()
            time.sleep(0.5)
            if browser_process.poll() is None:
                browser_process.kill()
        except Exception as e:
            log_message(f"Error al cerrar proceso del navegador: {e}")
    
    try:
        subprocess.run(['killall', 'chromium-browser'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except:
        pass
    
    try:
        subprocess.run(['killall', 'firefox'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except:
        pass
    
    browser_opened = False
    browser_process = None
    browser_open_time = None
    browser_close_scheduled = False
    log_message("Navegador cerrado")

#------------------------------------------------------------
# FUNCIÓN PRINCIPAL DE PROCESAMIENTO DE QR
#------------------------------------------------------------

def process_qr_stream():
    """
    Obtiene stream de ESP32-CAM y realiza detección de códigos QR.
    """
    global browser_open_time, browser_close_scheduled, display_error_logged
    
    log_message(f"Iniciando procesamiento de stream para QR desde ESP32-CAM en {ESPCAM_IP}")
    
    cap = None
    last_qr_time = 0
    
    # Crear directorio para guardar frames si no existe
    if SAVE_FRAMES and not os.path.exists(FRAMES_DIR):
        try:
            os.makedirs(FRAMES_DIR)
            log_message(f"Directorio '{FRAMES_DIR}' creado exitosamente")
        except Exception as e:
            log_message(f"Error creando directorio '{FRAMES_DIR}': {e}")
    
    while True:
        try:
            # Intentar conectar al stream
            if cap is None or not cap.isOpened():
                log_message(f"Conectando al stream de ESP32-CAM: {ESPCAM_STREAM_URL}")
                cap = cv2.VideoCapture(ESPCAM_STREAM_URL)
                
                if not cap.isOpened():
                    log_message("No se pudo conectar al stream")
                    time.sleep(5)
                    continue
            
            # Leer frame del stream
            ret, frame = cap.read()
            
            if not ret:
                log_message("Error leyendo frame del stream")
                cap.release()
                cap = None
                time.sleep(2)
                continue
            
            # Crear una copia del frame para QR
            qr_frame = frame.copy()
            
            # Realizar detección de QR periódicamente
            current_time = time.time()
            if current_time - last_qr_time >= QR_INTERVAL:
                log_message("Escaneando código QR...")
                
                # Detectar códigos QR
                qr_detections = detect_qr_code(qr_frame)
                
                # Si se detectaron códigos QR
                if qr_detections and len(qr_detections) > 0:
                    log_message(f"Códigos QR detectados: {len(qr_detections)}")
                    
                    # Extraer datos QR
                    qr_data = [data for data, _ in qr_detections]
                    
                    # Guardar frame con QR detectado si está habilitado
                    if SAVE_FRAMES:
                        save_frame_with_qr(qr_frame, qr_data)
                    
                    # Procesar URLs de QR
                    for data in qr_data:
                        log_message(f"Datos QR: {data}")
                        
                        # Si es una URL, procesarla
                        if is_valid_url(data):
                            process_qr_url(data)
                        else:
                            # Si no es URL, simplemente guardar en Firebase
                            update_firebase_with_qr(data)
                else:
                    log_message("No se detectaron códigos QR")
                
                last_qr_time = current_time
            
            # Preparar información para mostrar
            info_text = []
            
            # Añadir información de QR si hay reciente
            if 'qr_detections' in locals() and qr_detections:
                info_text.append(f"QR: {len(qr_detections)} detectados")
            else:
                info_text.append(f"QR: Ninguno")
            
            # Dibujar resultados en el frame para visualización
            display_frame = frame.copy()
            
            # Dibujar códigos QR detectados si hay
            if 'qr_detections' in locals() and qr_detections:
                display_frame = draw_qr_codes(display_frame, qr_detections)
            
            # Dibujar información en la parte superior
            for i, text_line in enumerate(info_text):
                cv2.putText(
                    display_frame, text_line, (20, 30 + i * 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2
                )
                
            # En modo headless, no usamos imshow ni waitKey
            # Comprobar si podemos usar visualización
            try:
                if cv2.__version__ and hasattr(cv2, 'imshow') and os.environ.get('DISPLAY'):
                    cv2.imshow('Detección QR', display_frame)
                    key = cv2.waitKey(1) & 0xFF
                    
                    # Salir con 'q'
                    if key == ord('q'):
                        break
                    
                    # Forzar QR con 's'
                    if key == ord('s'):
                        log_message("Escaneo QR forzado por usuario")
                        last_qr_time = 0
            except Exception as e:
                # Si falla la visualización, simplemente continuamos sin ella
                # Solo registramos el error la primera vez para no llenar el log
                if not display_error_logged:
                    log_message(f"Modo sin visualización: {e}")
                    display_error_logged = True
            
            # Manejo del cierre del navegador si está abierto hace mucho tiempo
            if browser_opened:
                if browser_open_time:
                    elapsed = (datetime.now() - browser_open_time).total_seconds()
                    
                    # Cerrar después de 30 segundos
                    if elapsed >= 30 and not browser_close_scheduled:
                        browser_close_scheduled = True
                        log_message(f"Programando cierre del navegador en 5 segundos...")
                        threading.Timer(5, close_webpage).start()
            
            time.sleep(0.05)  # Pequeña pausa para no saturar CPU
            
        except Exception as e:
            log_message(f"Error en procesamiento de stream QR: {e}")
            if cap is not None:
                cap.release()
                cap = None
            time.sleep(5)
    
    if cap is not None:
        cap.release()
    
    # Intentar cerrar ventanas de OpenCV, pero solo si está disponible la función
    try:
        cv2.destroyAllWindows()
    except:
        pass

#------------------------------------------------------------
# MAIN
#------------------------------------------------------------

def main():
    log_message("=== INICIANDO SISTEMA DE DETECCIÓN QR CON ESP32-CAM ===")
    
    # Verificar si estamos en modo headless
    display_available = True
    try:
        if 'DISPLAY' not in os.environ:
            log_message("No se detectó variable DISPLAY, operando en modo headless")
            display_available = False
        # Intentar inicializar una ventana de prueba
        if display_available:
            try:
                cv2.namedWindow("test", cv2.WINDOW_NORMAL)
                cv2.destroyWindow("test")
                log_message("Visualización disponible")
            except:
                log_message("Error al crear ventana, operando en modo headless")
                display_available = False
    except Exception as e:
        log_message(f"Error al verificar display: {e}, asumiendo modo headless")
        display_available = False
    
    log_message(f"Modo de operación: {'Con visualización' if display_available else 'Headless (sin visualización)'}")
    
    # Configurar entorno
    setup_display_environment()
    
    # Verificar OpenCV para QR
    try:
        # Verificar disponibilidad del detector QR de OpenCV
        qr_detector = cv2.QRCodeDetector()
        log_message("Detector QR de OpenCV disponible")
        
        # Intentar importar pyzbar para mejor detección QR
        try:
            import pyzbar.pyzbar
            log_message("Detector QR mejorado (pyzbar) disponible")
        except ImportError:
            log_message("pyzbar no disponible, usando solo el detector QR de OpenCV")
            log_message("Para mejor detección, instalar: pip install pyzbar")
    except Exception as e:
        log_message(f"Error verificando detector QR: {e}")
        log_message("Continuando, pero la detección de QR puede no funcionar correctamente")
    
    # Probar conexión con Firebase
    try:
        response = requests.get(f"{FIREBASE_URL}/.json", timeout=5)
        if response.ok:
            log_message("Conexión con Firebase exitosa")
        else:
            log_message(f"Error conectando con Firebase: {response.status_code}")
    except Exception as e:
        log_message(f"Error conectando con Firebase: {e}")
    
    # Probar conexión con ESP32-CAM
    try:
        response = requests.get(f"http://{ESPCAM_IP}/", timeout=5)
        if response.ok:
            log_message("Conexión con ESP32-CAM exitosa")
        else:
            log_message(f"ESP32-CAM respondió con código: {response.status_code}")
    except Exception as e:
        log_message(f"No se pudo conectar con ESP32-CAM: {e}")
        log_message("Continuando de todos modos, se reintentará en el bucle principal")
    
    # Inicializar valores en Firebase
    try:
        # Inicializar nodo QR
        qr_data = {
            "url": "",
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "historial": []
        }
        requests.put(f"{FIREBASE_URL}/QR.json", data=json.dumps(qr_data), timeout=5)
        log_message("Nodo QR inicializado en Firebase")
    except Exception as e:
        log_message(f"Error inicializando Firebase: {e}")
    
    # Iniciar procesamiento
    try:
        process_qr_stream()
    except KeyboardInterrupt:
        log_message("Programa detenido por el usuario")
    except Exception as e:
        log_message(f"Error en el bucle principal: {e}")
    finally:
        log_message("Limpiando recursos...")
        if browser_opened:
            close_webpage()
        try:
            cv2.destroyAllWindows()
        except:
            pass
        log_message("Programa finalizado")

if __name__ == "__main__":
    main()