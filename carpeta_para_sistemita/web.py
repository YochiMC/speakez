#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
SISTEMA COMPLETO: Detección de Rostros + Reconocimiento de Voz
Todo integrado en un solo archivo para evitar problemas de importación
- Modificado para obtener datos del sensor sónico desde Firebase
- Ajustado para que el zumbador responda proporcionalmente a la distancia
"""

import os
import time
import json
import threading
import requests
import webbrowser
import subprocess
import signal
from datetime import datetime
import socket
import wave
import tempfile
import numpy as np
import speech_recognition as sr
import cv2

# Intentar importar GPIO y sensores, pero si falla, permitir que el script siga funcionando
try:
    import RPi.GPIO as GPIO
    import Adafruit_DHT
    GPIO_AVAILABLE = True
except ImportError:
    print("ADVERTENCIA: No se pudieron importar módulos GPIO o Adafruit_DHT")
    print("Algunas funcionalidades de hardware no estarán disponibles")
    GPIO_AVAILABLE = False

# Configuración geneal
TEMP_DIR = '/tmp/audio_commands'
FIREBASE_URL = "https://sistemas-programables-b4-d5995-default-rtdb.firebaseio.com"
WEB_URL = "127.0.0.1:8080"

# Configuración del servidor de voz
SERVER_IP = '0.0.0.0'  # Escuchar en todas las interfaces
SERVER_PORT = 8765

# Configuración ESP32-CAM
ESPCAM_IP = "192.168.62.202"  # Cambiar a la IP de tu ESP32-CAM
ESPCAM_STREAM_URL = f"http://{ESPCAM_IP}/stream"

# Configuración de tiempos
BROWSER_MIN_OPEN_TIME = 10  # Tiempo mínimo que permanece abierto el navegador (segundos)
BROWSER_CLOSE_DELAY = 5     # Tiempo de espera antes de cerrar cuando no hay detección
FIREBASE_CHECK_INTERVAL = 1 # Tiempo entre verificaciones de Firebase para el sensor sónico

# Configuración de GPIO (solo si está disponible)
if GPIO_AVAILABLE:
    # Definición de pines (BCM)
    DHT_PIN = 0       # Pin físico 27 -> GPIO0
    LDR_PIN = 5       # Pin físico 29 -> GPIO5
    # Eliminamos TRIGGER_PIN y ECHO_PIN ya que no se usarán directamente
    SERVO_PIN = 19    # Pin físico 35 -> GPIO19
    BUZZER_PIN = 26   # Pin físico 37 -> GPIO26
    
    # Configuración de pines
    GPIO.setmode(GPIO.BCM)
    GPIO.setwarnings(False)
    # Eliminamos la configuración de pines para HC-SR04
    GPIO.setup(SERVO_PIN, GPIO.OUT)    # Servo
    GPIO.setup(BUZZER_PIN, GPIO.OUT)   # Buzzer
    GPIO.setup(LDR_PIN, GPIO.IN)
    
    # Configuración del servo
    servo_pwm = GPIO.PWM(SERVO_PIN, 50)
    servo_pwm.start(7.5)

# Configuración de OpenCV para detección de rostros
face_cascade = None
prototxt_path = "/home/pi/face_detection/deploy.prototxt"  # Cambiar ruta si es necesario
model_path = "/home/pi/face_detection/res10_300x300_ssd_iter_140000.caffemodel"  # Cambiar ruta si es necesario
face_net = None

# Variables globales
last_servo_pos = 0
browser_opened = False
browser_process = None
face_detected = False
proximity_detected = False
browser_open_time = None
browser_close_scheduled = False
last_voice_command = ""
current_distance = 100.0  # Valor inicial para la distancia

# Crear directorio temporal si no existe
if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)

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
# FUNCIONES DE RECONOCIMIENTO DE VOZ
#------------------------------------------------------------

def speech_to_text(audio_file):
    """Convierte un archivo de audio WAV a texto usando reconocimiento de voz."""
    recognizer = sr.Recognizer()
    
    try:
        with sr.AudioFile(audio_file) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data, language="es-MX")
            return text
    except sr.UnknownValueError:
        log_message("El audio no pudo ser entendido")
        return None
    except sr.RequestError as e:
        log_message(f"Error en solicitud a Google Speech Recognition: {e}")
        return None
    except Exception as e:
        log_message(f"Error en reconocimiento de voz: {e}")
        return None

def process_command(text):
    """Procesa el comando de voz reconocido."""
    global last_voice_command
    
    if text is None:
        return "No se pudo reconocer el comando"
    
    text = text.lower()
    log_message(f"Comando reconocido: {text}")
    last_voice_command = text
    
    # Actualizar Firebase con el comando reconocido
    try:
        url = f"{FIREBASE_URL}/Sensores/comando_voz.json"
        response = requests.put(url, data=json.dumps(text))
        if response.ok:
            log_message("Comando de voz actualizado en Firebase")
    except Exception as e:
        log_message(f"Error actualizando Firebase: {e}")
    
    # Procesar comandos
    response = execute_voice_command(text)
    if response:
        return response
    else:
        return f"Comando recibido: {text}"

def execute_voice_command(command):
    """Ejecuta comandos reconocidos."""
    global browser_opened, browser_close_scheduled
    
    if command is None or command == "":
        return None
    
    command = command.lower()
    log_message(f"Ejecutando comando: {command}")
    
    if "abrir" in command and "navegador" in command:
        log_message("Ejecutando: Abrir navegador")
        open_webpage(WEB_URL)
        return "Abriendo navegador"
    
    elif "cerrar" in command and "navegador" in command:
        log_message("Ejecutando: Cerrar navegador")
        close_webpage()
        return "Cerrando navegador"
    
    elif "mover" in command and "servo" in command:
        if "izquierda" in command or "cero" in command:
            log_message("Ejecutando: Mover servo a 0 grados")
            move_servo(0)
            return "Moviendo servo a 0 grados"
        elif "derecha" in command or "180" in command:
            log_message("Ejecutando: Mover servo a 180 grados")
            move_servo(180)
            return "Moviendo servo a 180 grados"
        elif "centro" in command or "medio" in command or "90" in command:
            log_message("Ejecutando: Mover servo a 90 grados")
            move_servo(90)
            return "Moviendo servo a 90 grados"
        return "Comando de servo no específico"
    
    elif "activar" in command and "alarma" in command:
        log_message("Ejecutando: Activar alarma")
        set_buzzer(True, 5)
        return "Activando alarma"
    
    elif "temperatura" in command or "humedad" in command:
        log_message("Ejecutando: Leer temperatura y humedad")
        read_dht()
        return "Leyendo temperatura y humedad"
    
    return None

def handle_client(client_socket, client_address):
    """Maneja la conexión con un cliente (ESP32)."""
    log_message(f"Conexión establecida desde {client_address}")
    
    try:
        # Recibir tamaño de la cabecera
        header_size_bytes = client_socket.recv(4)
        header_size = int.from_bytes(header_size_bytes, byteorder='little')
        
        # Recibir cabecera JSON
        header_json = client_socket.recv(header_size).decode('utf-8')
        header = json.loads(header_json)
        
        log_message(f"Cabecera recibida: {header}")
        
        # Extraer información del audio
        sample_rate = header['sample_rate']
        channels = header['channels']
        audio_format = header['format']
        audio_length = header['length']
        
        # Crear archivo temporal para guardar el audio
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        audio_file = os.path.join(TEMP_DIR, f"audio_{timestamp}.wav")
        
        # Recibir datos de audio
        audio_data = bytearray()
        bytes_received = 0
        
        while bytes_received < audio_length:
            chunk = client_socket.recv(min(4096, audio_length - bytes_received))
            if not chunk:
                break
            audio_data.extend(chunk)
            bytes_received += len(chunk)
            
            # Mostrar progreso
            progress = bytes_received / audio_length * 100
            log_message(f"Recibiendo audio: {progress:.1f}% ({bytes_received}/{audio_length} bytes)")
        
        log_message(f"Audio recibido completo: {len(audio_data)} bytes")
        
        # Convertir los datos de audio a formato WAV
        with wave.open(audio_file, 'wb') as wf:
            wf.setnchannels(channels)
            wf.setsampwidth(2)  # 16 bits = 2 bytes por muestra
            wf.setframerate(sample_rate)
            wf.writeframes(audio_data)
        
        log_message(f"Audio guardado en {audio_file}")
        
        # Convertir audio a texto
        log_message("Iniciando reconocimiento de voz...")
        text = speech_to_text(audio_file)
        
        if text:
            log_message(f"Texto reconocido: '{text}'")
            response = process_command(text)
        else:
            log_message("No se pudo reconocer texto en el audio")
            response = "No se pudo reconocer el comando"
        
        # Enviar respuesta al cliente
        client_socket.send(response.encode('utf-8'))
        
    except Exception as e:
        log_message(f"Error procesando datos del cliente: {e}")
    finally:
        client_socket.close()
        log_message(f"Conexión cerrada con {client_address}")

def start_server():
    """Inicia el servidor de reconocimiento de voz."""
    log_message("Iniciando servidor de reconocimiento de voz...")
    
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    
    try:
        server.bind((SERVER_IP, SERVER_PORT))
        server.listen(5)
        log_message(f"Servidor escuchando en {SERVER_IP}:{SERVER_PORT}")
        
        while True:
            client_socket, client_address = server.accept()
            client_thread = threading.Thread(
                target=handle_client,
                args=(client_socket, client_address)
            )
            client_thread.daemon = True
            client_thread.start()
            
    except KeyboardInterrupt:
        log_message("Servidor detenido por el usuario")
    except Exception as e:
        log_message(f"Error en el servidor: {e}")
    finally:
        server.close()
        log_message("Servidor cerrado")

#------------------------------------------------------------
# FUNCIONES DE DETECCIÓN DE ROSTROS
#------------------------------------------------------------

def init_face_detector():
    """Inicializa el detector de rostros usando OpenCV DNN o Haar Cascades."""
    global face_cascade, face_net
    
    # Intentar usar DNN primero (más preciso)
    try:
        if os.path.exists(prototxt_path) and os.path.exists(model_path):
            face_net = cv2.dnn.readNetFromCaffe(prototxt_path, model_path)
            log_message("Detector de rostros DNN inicializado correctamente")
            return True
    except Exception as e:
        log_message(f"Error inicializando DNN: {e}")
    
    # Fallback a Haar Cascades
    try:
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        if face_cascade.empty():
            raise Exception("No se pudo cargar el clasificador Haar")
        log_message("Detector de rostros Haar Cascade inicializado correctamente")
        return True
    except Exception as e:
        log_message(f"Error inicializando Haar Cascade: {e}")
        return False

def detect_faces_dnn(frame):
    """Detecta rostros usando el modelo DNN."""
    if face_net is None:
        return []
    
    (h, w) = frame.shape[:2]
    blob = cv2.dnn.blobFromImage(cv2.resize(frame, (300, 300)), 1.0, (300, 300), (104.0, 177.0, 123.0))
    
    face_net.setInput(blob)
    detections = face_net.forward()
    
    faces = []
    for i in range(detections.shape[2]):
        confidence = detections[0, 0, i, 2]
        
        if confidence > 0.7:  # Umbral de confianza
            box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
            (x1, y1, x2, y2) = box.astype("int")
            faces.append((x1, y1, x2 - x1, y2 - y1))
    
    return faces

def detect_faces_haar(frame):
    """Detecta rostros usando Haar Cascades."""
    if face_cascade is None:
        return []
    
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    return faces

def espcam_face_detection():
    """Obtiene stream de ESP32-CAM y detecta rostros."""
    global face_detected, browser_open_time, browser_close_scheduled
    
    log_message(f"Iniciando detección de rostros desde ESP32-CAM en {ESPCAM_IP}")
    
    # Inicializar detector de rostros
    if not init_face_detector():
        log_message("No se pudo inicializar el detector de rostros")
        return
    
    stream = None
    cap = None
    last_face_status = None
    no_face_count = 0
    
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
            
            # Detectar rostros
            if face_net is not None:
                faces = detect_faces_dnn(frame)
            else:
                faces = detect_faces_haar(frame)
            
            # Actualizar estado de detección
            current_face_status = len(faces) > 0
            
            # Requerir varios frames sin rostros antes de cambiar estado a false
            if not current_face_status:
                no_face_count += 1
                if no_face_count < 5:  # Necesita 5 frames sin rostros
                    current_face_status = face_detected  # Mantener estado anterior
            else:
                no_face_count = 0
            
            # Si cambió el estado
            if current_face_status != last_face_status:
                face_detected = current_face_status
                log_message(f"Cambio de estado - Rostro detectado: {face_detected}")
                
                # Control de servo cuando cambia el estado
                if not face_detected:
                    log_message("No se detecta rostro - Moviendo servo a 180°")
                    move_servo(180)
                else:
                    log_message(f"Detectados {len(faces)} rostro(s)")
                
                # Actualizar Firebase
                try:
                    url = f"{FIREBASE_URL}/Sensores/rostro_detectado.json"
                    fb_response = requests.put(url, data=json.dumps(face_detected))
                    if fb_response.ok:
                        log_message(f"Firebase actualizado - rostro_detectado: {face_detected}")
                except Exception as e:
                    log_message(f"Error actualizando Firebase: {e}")
                
                # Control del navegador
                if face_detected:
                    log_message("¡Rostro detectado! Abriendo navegador...")
                    open_webpage(WEB_URL)
                
                last_face_status = current_face_status
            
            # Manejo del cierre del navegador
            if browser_opened and not face_detected and not proximity_detected:
                if browser_open_time:
                    elapsed = (datetime.now() - browser_open_time).total_seconds()
                    
                    if elapsed >= BROWSER_MIN_OPEN_TIME:
                        if not browser_close_scheduled:
                            browser_close_scheduled = True
                            log_message(f"Programando cierre del navegador en {BROWSER_CLOSE_DELAY} segundos...")
                            threading.Timer(BROWSER_CLOSE_DELAY, close_webpage).start()
            
            time.sleep(0.05)  # Pequeña pausa para no saturar CPU
            
        except Exception as e:
            log_message(f"Error en detección de rostros: {e}")
            if cap is not None:
                cap.release()
                cap = None
            time.sleep(5)
    
    if cap is not None:
        cap.release()
    cv2.destroyAllWindows()

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
# FUNCIONES DE HARDWARE (Solo disponibles si GPIO está instalado)
#------------------------------------------------------------

def servo_angle_to_duty(angle):
    """Convierte ángulo del servo a ciclo de trabajo."""
    return 2.5 + (angle / 180) * 10.0

def move_servo(angle):
    """Mueve el servo a un ángulo específico (0-180)."""
    global last_servo_pos
    
    if not GPIO_AVAILABLE:
        log_message(f"Simulando: Mover servo a {angle}°")
        last_servo_pos = angle
        
        # Actualizar Firebase aunque no exista el hardware
        try:
            url = f"{FIREBASE_URL}/Actuadores/Servo.json"
            response = requests.put(url, data=json.dumps(angle))
            if response.ok:
                log_message(f"Servo actualizado en Firebase: {angle}°")
        except Exception as e:
            log_message(f"Error al actualizar servo en Firebase: {e}")
        
        return
    
    if angle == last_servo_pos:
        return
    
    last_servo_pos = angle
    
    duty = servo_angle_to_duty(angle)
    servo_pwm.ChangeDutyCycle(duty)
    time.sleep(0.3)
    servo_pwm.ChangeDutyCycle(0)
    
    try:
        url = f"{FIREBASE_URL}/Actuadores/Servo.json"
        response = requests.put(url, data=json.dumps(angle))
        if response.ok:
            log_message(f"Servo actualizado en Firebase: {angle}°")
    except Exception as e:
        log_message(f"Error al actualizar servo en Firebase: {e}")

def set_buzzer(state, beep_count=1, interval=0.1, duty_cycle=50):
    """
    Activa o desactiva el buzzer con diferentes parámetros según proximidad.
    
    Args:
        state (bool): True para activar, False para desactivar
        beep_count (int): Número de beeps
        interval (float): Intervalo entre beeps (más corto = más rápido)
        duty_cycle (int): Ciclo de trabajo PWM (mayor = más "fuerte", rango 0-100)
    """
    if not GPIO_AVAILABLE:
        log_message(f"Simulando: {'Activar' if state else 'Desactivar'} buzzer ({beep_count} beeps, intervalo: {interval}s, intensidad: {duty_cycle}%)")
        
        # Actualizar Firebase aunque no exista el hardware
        try:
            url = f"{FIREBASE_URL}/Actuadores/Zumbador.json"
            data = {
                "activo": state,
                "beeps": beep_count,
                "intervalo": interval,
                "intensidad": duty_cycle
            }
            response = requests.put(url, data=json.dumps(data))
            if response.ok:
                log_message(f"Zumbador actualizado en Firebase")
        except Exception as e:
            log_message(f"Error al actualizar zumbador en Firebase: {e}")
        
        return
    
    # Crear PWM para zumbador si es necesario
    buzzer_pwm = GPIO.PWM(BUZZER_PIN, 440)  # 440Hz (nota La)
    
    if state:
        for _ in range(beep_count):
            # Iniciar PWM con el ciclo de trabajo especificado
            buzzer_pwm.start(duty_cycle)
            time.sleep(interval)
            buzzer_pwm.stop()
            time.sleep(interval)
    else:
        GPIO.output(BUZZER_PIN, GPIO.LOW)
    
    try:
        url = f"{FIREBASE_URL}/Actuadores/Zumbador.json"
        data = {
            "activo": state,
            "beeps": beep_count,
            "intervalo": interval,
            "intensidad": duty_cycle
        }
        response = requests.put(url, data=json.dumps(data))
        if response.ok:
            log_message(f"Zumbador actualizado en Firebase")
    except Exception as e:
        log_message(f"Error al actualizar zumbador en Firebase: {e}")

def read_dht():
    """Lee datos del sensor DHT22."""
    if not GPIO_AVAILABLE:
        log_message("Simulando: Lectura de temperatura y humedad")
        temperature = 25.0
        humidity = 50.0
        
        # Datos simulados
        dht_data = f"{temperature:.1f}°C / {humidity:.1f}%"
        log_message(f"Temp={temperature:.1f}°C  Humidity={humidity:.1f}%")
        
        try:
            url = f"{FIREBASE_URL}/Sensores/dht.json"
            response = requests.put(url, data=json.dumps(dht_data))
            if response.ok:
                log_message("DHT actualizado en Firebase")
        except Exception as e:
            log_message(f"Error al actualizar DHT en Firebase: {e}")
        
        return dht_data
    
    humidity, temperature = Adafruit_DHT.read_retry(Adafruit_DHT.DHT22, DHT_PIN)
    
    if humidity is not None and temperature is not None:
        dht_data = f"{temperature:.1f}°C / {humidity:.1f}%"
        log_message(f"Temp={temperature:.1f}°C  Humidity={humidity:.1f}%")
        
        try:
            url = f"{FIREBASE_URL}/Sensores/dht.json"
            response = requests.put(url, data=json.dumps(dht_data))
            if response.ok:
                log_message("DHT actualizado en Firebase")
        except Exception as e:
            log_message(f"Error al actualizar DHT en Firebase: {e}")
        
        return dht_data
    else:
        log_message("Error leyendo el sensor DHT22")
        return None

def read_ldr():
    """Lee el nivel de luz del sensor LDR."""
    if not GPIO_AVAILABLE:
        # Simulación de lectura
        log_message("Simulando: Lectura de sensor de luz")
        light_value = 50  # Valor medio simulado
        
        try:
            url = f"{FIREBASE_URL}/Sensores/LDR.json"
            response = requests.put(url, data=json.dumps(str(light_value)))
            if response.ok:
                log_message("LDR actualizado en Firebase")
        except Exception as e:
            log_message(f"Error al actualizar LDR en Firebase: {e}")
        
        return light_value
    
    def rc_time():
        count = 0
        GPIO.setup(LDR_PIN, GPIO.OUT)
        GPIO.output(LDR_PIN, GPIO.LOW)
        time.sleep(0.1)
        
        GPIO.setup(LDR_PIN, GPIO.IN)
        while GPIO.input(LDR_PIN) == GPIO.LOW and count < 1000:
            count += 1
        
        return count
    
    light_count = rc_time()
    light_value = max(0, min(100, 100 - (light_count / 10)))
    light_value = int(light_value)
    
    log_message(f"Nivel de luz: {light_value}%")
    
    try:
        url = f"{FIREBASE_URL}/Sensores/LDR.json"
        response = requests.put(url, data=json.dumps(str(light_value)))
        if response.ok:
            log_message("LDR actualizado en Firebase")
    except Exception as e:
        log_message(f"Error al actualizar LDR en Firebase: {e}")
    
    return light_value

def get_sonar_distance_from_firebase():
    """Obtiene el valor de distancia desde Firebase en lugar de medir directamente."""
    global current_distance, proximity_detected, browser_close_scheduled
    
    try:
        url = f"{FIREBASE_URL}/Sensores/Sonico.json"
        response = requests.get(url, timeout=2)
        
        if response.ok:
            distance = float(response.json())
            
            # Registrar cambios significativos en la distancia
            if abs(distance - current_distance) > 5:
                log_message(f"Distancia actual: {distance} cm")
            
            # Actualizar valor global
            current_distance = distance
            
            # Actualizar estado de proximidad
            new_proximity_status = distance < 20
# Actualizar estado de proximidad
           
            new_proximity_status = distance < 20
            if new_proximity_status != proximity_detected:
                proximity_detected = new_proximity_status
                
                try:
                    url = f"{FIREBASE_URL}/Sensores/deteccion_proximidad.json"
                    response = requests.put(url, data=json.dumps(proximity_detected))
                    if response.ok:
                        log_message(f"Estado de proximidad actualizado: {proximity_detected}")
                except Exception as e:
                    log_message(f"Error al actualizar proximidad en Firebase: {e}")
                
                # Abrir navegador por proximidad
                if proximity_detected:
                    log_message("¡Proximidad detectada! Abriendo navegador...")
                    open_webpage(WEB_URL)
                    browser_close_scheduled = False
            
            # Realizar acciones basadas en la distancia
            process_distance_actions(distance)
            
            return distance
        else:
            log_message(f"Error obteniendo distancia de Firebase: {response.status_code}")
            return None
            
    except Exception as e:
        log_message(f"Error consultando Firebase para distancia: {e}")
        return None

def process_distance_actions(distance):
    """Procesa acciones basadas en la distancia del sensor ultrasónico."""
    if distance is None:
        return
    
    # Mover servo a 180° si la distancia es mayor a 40cm
    if distance > 40:
        log_message(f"Distancia mayor a 40cm ({distance}cm) - Moviendo servo a 180°")
        move_servo(180)
    
    # Otras funcionalidades basadas en distancia
    if 9 <= distance <= 11:
        log_message("Objeto detectado a ~10cm, moviendo servo a 130°")
        move_servo(130)
    
    # Control del zumbador basado en la proximidad de forma proporcional
    if distance < 20:
        # Cuanto más cerca, más rápido y fuerte sonará el zumbador
        
        # Nivel 1: Distancia 15-20cm (Alarma suave)
        if 15 <= distance < 20:
            log_message(f"Objeto cercano ({distance}cm): Alarma suave")
            set_buzzer(True, beep_count=2, interval=0.3, duty_cycle=30)
        
        # Nivel 2: Distancia 10-15cm (Alarma media)
        elif 10 <= distance < 15:
            log_message(f"Objeto muy cercano ({distance}cm): Alarma media")
            set_buzzer(True, beep_count=3, interval=0.2, duty_cycle=50)
        
        # Nivel 3: Distancia 5-10cm (Alarma fuerte)
        elif 5 <= distance < 10:
            log_message(f"Objeto muy cercano ({distance}cm): Alarma fuerte")
            set_buzzer(True, beep_count=4, interval=0.15, duty_cycle=70)
        
        # Nivel 4: Distancia 0-5cm (Alarma crítica)
        elif 0 <= distance < 5:
            log_message(f"¡OBJETO EXTREMADAMENTE CERCANO ({distance}cm)!: Alarma crítica")
            set_buzzer(True, beep_count=5, interval=0.1, duty_cycle=100)

#------------------------------------------------------------
# FUNCIÓN PRINCIPAL
#------------------------------------------------------------

def main():
    log_message("=== INICIANDO SISTEMA INTEGRADO DE DETECCIÓN Y VOZ ===")
    
    # Configurar entorno
    setup_display_environment()
    
    # Iniciar servidor de reconocimiento de voz en un thread separado
    voice_server_thread = threading.Thread(target=start_server)
    voice_server_thread.daemon = True
    voice_server_thread.start()
    log_message("Servidor de reconocimiento de voz iniciado")
    
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
    
    # Inicializar valores en Firebase
    try:
        sensores = {
            "LDR": "50",
            "Sonico": 100.0,
            "dht": "25.0°C / 50.0%",
            "rostro_detectado": False,
            "deteccion_proximidad": False,
            "comando_voz": ""
        }
        requests.put(f"{FIREBASE_URL}/Sensores.json", data=json.dumps(sensores), timeout=5)
        log_message("Estructura de sensores inicializada en Firebase")
    except Exception as e:
        log_message(f"Error inicializando Firebase: {e}")
    
    # Iniciar thread de detección de rostros
    face_thread = threading.Thread(target=espcam_face_detection, daemon=True)
    face_thread.start()
    
    # Señal de inicio
    log_message("Sistema iniciado correctamente")
    move_servo(0)
    set_buzzer(True, 2)
    
    # Variables de tiempo
    last_dht_read = 0
    last_ldr_read = 0
    last_distance_check = 0
    last_firebase_check = 0
    
    # Bucle principal
    try:
        while True:
            current_time = time.time()
            
            # Leer sensor DHT22 cada 30 segundos
            if current_time - last_dht_read >= 30:
                read_dht()
                last_dht_read = current_time
            
            # Leer sensor LDR cada 10 segundos
            if current_time - last_ldr_read >= 10:
                light_level = read_ldr()
                last_ldr_read = current_time
                
                # Control automático basado en luz
                if light_level < 30 and light_level > 0:
                    log_message("Está oscuro: moviendo servo a 180°")
                    move_servo(180)
                elif light_level > 70 and light_level < 100:
                    log_message("Hay mucha luz: moviendo servo a 0°")
                    move_servo(0)
            
            # Verificar valor del sensor de distancia desde Firebase cada 1 segundo
            if current_time - last_distance_check >= FIREBASE_CHECK_INTERVAL:
                get_sonar_distance_from_firebase()
                last_distance_check = current_time
            
            # Verificar Firebase por comandos de voz cada 2 segundos
            if current_time - last_firebase_check >= 2:
                try:
                    url = f"{FIREBASE_URL}/Sensores/comando_voz.json"
                    response = requests.get(url, timeout=2)
                    if response.ok:
                        command = response.json()
                        if command and command != last_voice_command:
                            log_message(f"Nuevo comando de voz en Firebase: {command}")
                            last_voice_command = command
                            execute_voice_command(command)
                except Exception as e:
                    log_message(f"Error verificando Firebase: {e}")
                last_firebase_check = current_time
            
            time.sleep(0.5)
    
    except KeyboardInterrupt:
        log_message("Programa detenido por el usuario")
    except Exception as e:
        log_message(f"Error en el bucle principal: {e}")
    finally:
        log_message("Limpiando recursos...")
        if browser_opened:
            close_webpage()
        if GPIO_AVAILABLE:
            servo_pwm.stop()
            GPIO.cleanup()
        log_message("Programa finalizado")

if __name__ == "__main__":
    main()