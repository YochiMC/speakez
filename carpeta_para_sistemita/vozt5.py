#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
RECONOCIMIENTO DE VOZ MÓVIL - Envío a Firebase
Este script:
- Proporciona una interfaz web accesible desde el teléfono
- Captura audio desde el micrófono del teléfono
- Realiza reconocimiento de voz y envía el texto a Firebase
"""

import os
import json
import time
import threading
import requests
import http.server
import socketserver
import ssl
import qrcode
import base64
from io import BytesIO
from datetime import datetime

# Configuración del servidor web
SERVER_IP = '0.0.0.0'  # Escuchar en todas las interfaces
WEB_PORT = 8443        # Puerto para HTTPS

# Configuración de Firebase
FIREBASE_URL = "https://sistemas-programables-b4-d5995-default-rtdb.firebaseio.com"

# Configuración de SSL/HTTPS
SSL_CERT = 'cert.pem'  # Archivo de certificado
SSL_KEY = 'key.pem'    # Archivo de llave privada

# Directorio temporal
TEMP_DIR = '/tmp/voice_to_text'
if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)

# Función para registrar logs
def log_message(message):
    """Registra un mensaje con timestamp."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")

# Función para obtener dirección IP
def get_ip_address():
    """Obtiene la dirección IP local."""
    try:
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "localhost"

# Función para generar código QR
def generate_qr_code(url):
    """Genera un código QR para el URL."""
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return img_str

# Función para generar certificados SSL
def generate_self_signed_cert():
    """Genera certificados SSL autofirmados."""
    if os.path.exists(SSL_CERT) and os.path.exists(SSL_KEY):
        log_message("Certificados SSL encontrados.")
        return True
    
    log_message("Generando certificados SSL...")
    try:
        import subprocess
        cmd = [
            'openssl', 'req', '-x509', '-newkey', 'rsa:2048',
            '-keyout', SSL_KEY, '-out', SSL_CERT,
            '-days', '365', '-nodes',
            '-subj', '/CN=localhost'
        ]
        subprocess.run(cmd, check=True)
        log_message("Certificados SSL generados correctamente.")
        return True
    except Exception as e:
        log_message(f"Error generando certificados: {e}")
        return False

# HTML para la interfaz web móvil
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Reconocimiento de Voz Móvil</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
            color: #333;
        }
        .container {
            max-width: 500px;
            margin: 0 auto;
            padding: 20px;
        }
        header {
            text-align: center;
            padding: 15px 0;
            background-color: #4285F4;
            color: white;
            border-radius: 10px 10px 0 0;
            margin-bottom: 10px;
        }
        header h1 {
            margin: 0;
            font-size: 1.8rem;
        }
        .card {
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 20px;
            margin-bottom: 20px;
        }
        .btn {
            display: block;
            width: 100%;
            padding: 16px;
            border: none;
            border-radius: 50px;
            background-color: #4285F4;
            color: white;
            font-size: 18px;
            font-weight: bold;
            margin: 15px 0;
            cursor: pointer;
            transition: background-color 0.3s;
            box-shadow: 0 3px 6px rgba(0,0,0,0.1);
        }
        .btn:active {
            background-color: #3367d6;
        }
        .btn-danger {
            background-color: #EA4335;
        }
        .btn-danger:active {
            background-color: #c62828;
        }
        .visualizer {
            width: 100%;
            height: 80px;
            background-color: #222;
            border-radius: 10px;
            margin: 15px 0;
        }
        .status {
            padding: 12px;
            border-radius: 8px;
            margin: 15px 0;
            text-align: center;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .status-ready {
            background-color: #E1F5FE;
            color: #0288D1;
        }
        .status-recording {
            background-color: #FFEBEE;
            color: #E53935;
            animation: pulse 1.5s infinite;
        }
        .status-processing {
            background-color: #FFF8E1;
            color: #FFA000;
        }
        .status-success {
            background-color: #E8F5E9;
            color: #388E3C;
        }
        .status-error {
            background-color: #FFEBEE;
            color: #E53935;
        }
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.6; }
            100% { opacity: 1; }
        }
        .result {
            margin-top: 15px;
            border-left: 4px solid #4285F4;
            padding: 12px;
            background-color: #f9f9f9;
            border-radius: 4px;
            font-size: 16px;
            line-height: 1.5;
        }
        .history {
            max-height: 200px;
            overflow-y: auto;
            margin-top: 15px;
            border-top: 1px solid #eee;
            padding-top: 10px;
        }
        .history-item {
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .timer {
            text-align: center;
            font-size: 24px;
            margin: 10px 0;
            font-weight: bold;
            color: #E53935;
            display: none;
        }
        .dot {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 8px;
        }
        .dot-recording {
            background-color: #E53935;
            animation: pulse 1.5s infinite;
        }
        .dot-ready {
            background-color: #0288D1;
        }
        .dot-success {
            background-color: #388E3C;
        }
        .dot-error {
            background-color: #E53935;
        }
        .instructions {
            font-size: 14px;
            color: #666;
            margin-top: 15px;
            line-height: 1.4;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Reconocimiento de Voz</h1>
        </header>
        
        <div class="card">
            <div id="status" class="status status-ready">
                <span class="dot dot-ready"></span>
                Listo para grabar
            </div>
            
            <div id="timer" class="timer">00:00</div>
            <canvas id="visualizer" class="visualizer"></canvas>
            
            <button id="recordButton" class="btn">
                Iniciar Grabación
            </button>
            
            <div class="instructions">
                <p>Presiona el botón para comenzar la grabación. Habla con claridad y cuando termines, presiona nuevamente para detener y procesar el audio.</p>
            </div>
        </div>
        
        <div class="card">
            <h3>Texto Reconocido:</h3>
            <div id="recognizedText" class="result">Esperando grabación...</div>
            
            <h3>Historial:</h3>
            <div id="history" class="history">
                <div class="history-item">Sin registros</div>
            </div>
        </div>
    </div>
    
    <script>
        // Elementos del DOM
        const recordButton = document.getElementById('recordButton');
        const statusDiv = document.getElementById('status');
        const recognizedTextElement = document.getElementById('recognizedText');
        const visualizer = document.getElementById('visualizer');
        const timerElement = document.getElementById('timer');
        const historyElement = document.getElementById('history');
        
        // Variables para grabación
        let mediaRecorder = null;
        let audioChunks = [];
        let isRecording = false;
        let audioStream = null;
        let startTime = null;
        let timerInterval = null;
        
        // Inicializar visualizador
        function setupVisualizer(stream) {
            try {
                const canvasCtx = visualizer.getContext('2d');
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const source = audioContext.createMediaStreamSource(stream);
                const analyser = audioContext.createAnalyser();
                
                analyser.fftSize = 256;
                source.connect(analyser);
                
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                
                function draw() {
                    if (!isRecording) return;
                    
                    requestAnimationFrame(draw);
                    
                    analyser.getByteFrequencyData(dataArray);
                    
                    canvasCtx.fillStyle = 'rgb(34, 34, 34)';
                    canvasCtx.fillRect(0, 0, visualizer.width, visualizer.height);
                    
                    const barWidth = (visualizer.width / bufferLength) * 2.5;
                    let x = 0;
                    
                    for (let i = 0; i < bufferLength; i++) {
                        const barHeight = dataArray[i] / 255 * visualizer.height;
                        canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
                        canvasCtx.fillRect(x, visualizer.height - barHeight, barWidth, barHeight);
                        x += barWidth + 1;
                    }
                }
                
                canvasCtx.fillStyle = 'rgb(34, 34, 34)';
                canvasCtx.fillRect(0, 0, visualizer.width, visualizer.height);
                
                draw();
            } catch (error) {
                console.error('Error al configurar visualizador:', error);
            }
        }
        
        // Actualizar temporizador
        function updateTimer() {
            if (!startTime) return;
            
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            
            timerElement.textContent = `${minutes}:${seconds}`;
        }
        
        // Iniciar grabación
        async function startRecording() {
            try {
                // Solicitar permisos del micrófono
                const constraints = { 
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                };
                
                audioStream = await navigator.mediaDevices.getUserMedia(constraints);
                
                // Actualizar UI
                statusDiv.className = 'status status-recording';
                statusDiv.innerHTML = '<span class="dot dot-recording"></span> Grabando...';
                recordButton.textContent = 'Detener Grabación';
                recordButton.className = 'btn btn-danger';
                
                // Mostrar visualizador y temporizador
                setupVisualizer(audioStream);
                timerElement.style.display = 'block';
                startTime = Date.now();
                timerInterval = setInterval(updateTimer, 1000);
                updateTimer();
                
                // Determinar el formato disponible
                let mimeType = 'audio/webm';
                if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                    mimeType = 'audio/webm;codecs=opus';
                }
                
                // Crear MediaRecorder
                mediaRecorder = new MediaRecorder(audioStream, {
                    mimeType: mimeType
                });
                
                audioChunks = [];
                
                // Configurar eventos
                mediaRecorder.ondataavailable = event => {
                    if (event.data.size > 0) {
                        audioChunks.push(event.data);
                    }
                };
                
                // Iniciar grabación
                mediaRecorder.start(100); // Capturar en trozos de 100ms
                isRecording = true;
                
            } catch (error) {
                console.error('Error al iniciar grabación:', error);
                statusDiv.className = 'status status-error';
                statusDiv.innerHTML = '<span class="dot dot-error"></span> Error al acceder al micrófono';
                
                if (error.name === 'NotAllowedError') {
                    alert('Has denegado el permiso para usar el micrófono. Por favor, permite el acceso para usar esta función.');
                } else {
                    alert(`Error: ${error.message}`);
                }
            }
        }
        
        // Detener grabación
        function stopRecording() {
            if (!mediaRecorder) return;
            
            // Actualizar UI
            statusDiv.className = 'status status-processing';
            statusDiv.innerHTML = '<span class="dot dot-ready"></span> Procesando audio...';
            recordButton.textContent = 'Iniciar Grabación';
            recordButton.className = 'btn';
            timerElement.style.display = 'none';
            clearInterval(timerInterval);
            
            mediaRecorder.onstop = async () => {
                isRecording = false;
                
                try {
                    // Detener todas las pistas del stream
                    if (audioStream) {
                        audioStream.getTracks().forEach(track => track.stop());
                        audioStream = null;
                    }
                    
                    // Convertir chunks a blob
                    const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
                    
                    // Verificar si hay contenido
                    if (audioBlob.size < 1000) {
                        statusDiv.className = 'status status-error';
                        statusDiv.innerHTML = '<span class="dot dot-error"></span> Grabación demasiado corta';
                        return;
                    }
                    
                    // Enviar al servidor
                    try {
                        const formData = new FormData();
                        formData.append('audio', audioBlob, 'recording.webm');
                        
                        const response = await fetch('/process_audio', {
                            method: 'POST',
                            body: formData
                        });
                        
                        if (response.ok) {
                            const result = await response.json();
                            
                            if (result.status === 'success') {
                                statusDiv.className = 'status status-success';
                                statusDiv.innerHTML = '<span class="dot dot-success"></span> Texto reconocido correctamente';
                                
                                // Mostrar texto reconocido
                                if (result.recognized_text) {
                                    recognizedTextElement.textContent = result.recognized_text;
                                    
                                    // Añadir al historial
                                    const now = new Date();
                                    const timeString = now.toLocaleTimeString();
                                    const historyItem = document.createElement('div');
                                    historyItem.className = 'history-item';
                                    historyItem.innerHTML = `<strong>${timeString}</strong>: ${result.recognized_text}`;
                                    
                                    if (historyElement.firstChild.textContent === 'Sin registros') {
                                        historyElement.innerHTML = '';
                                    }
                                    
                                    historyElement.insertBefore(historyItem, historyElement.firstChild);
                                }
                            } else {
                                statusDiv.className = 'status status-error';
                                statusDiv.innerHTML = `<span class="dot dot-error"></span> ${result.message || 'Error en procesamiento'}`;
                            }
                        } else {
                            throw new Error(`Error: ${response.status}`);
                        }
                        
                    } catch (error) {
                        console.error('Error al enviar audio:', error);
                        statusDiv.className = 'status status-error';
                        statusDiv.innerHTML = `<span class="dot dot-error"></span> Error al enviar audio`;
                    }
                    
                } catch (error) {
                    console.error('Error al procesar audio:', error);
                    statusDiv.className = 'status status-error';
                    statusDiv.innerHTML = `<span class="dot dot-error"></span> Error al procesar audio`;
                }
            };
            
            // Detener grabación
            mediaRecorder.stop();
        }
        
        // Toggle grabación
        recordButton.addEventListener('click', () => {
            if (isRecording) {
                stopRecording();
            } else {
                startRecording();
            }
        });
        
        // Precargar el canvas del visualizador
        const canvasCtx = visualizer.getContext('2d');
        canvasCtx.fillStyle = 'rgb(34, 34, 34)';
        canvasCtx.fillRect(0, 0, visualizer.width, visualizer.height);
        
        // Comprobar soporte de API
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            statusDiv.className = 'status status-error';
            statusDiv.innerHTML = '<span class="dot dot-error"></span> Tu navegador no soporta grabación de audio';
            recordButton.disabled = true;
            alert('Tu navegador no soporta la grabación de audio. Por favor, utiliza un navegador moderno como Chrome, Firefox o Safari.');
        }
    </script>
</body>
</html>
"""

# Clase para manejar peticiones HTTPS
class HTTPSHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            # Servir la página principal
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(HTML_TEMPLATE.encode())
        else:
            # Para otros recursos
            super().do_GET()
    
    def do_POST(self):
        if self.path == '/process_audio':
            # Procesar solicitud de audio
            content_type = self.headers['Content-Type']
            log_message(f"Solicitud POST recibida. Content-Type: {content_type}")
            
            try:
                # Manejar diferentes tipos de contenido
                if 'multipart/form-data' in content_type:
                    # Procesar formulario
                    import cgi
                    env = {'REQUEST_METHOD': 'POST', 'CONTENT_TYPE': content_type}
                    form = cgi.FieldStorage(fp=self.rfile, headers=self.headers, environ=env)
                    
                    if 'audio' in form:
                        audio_field = form['audio']
                        audio_data = audio_field.file.read()
                        log_message(f"Audio recibido desde formulario: {len(audio_data)} bytes")
                    else:
                        raise ValueError("No se encontró campo 'audio' en el formulario")
                else:
                    # Leer directamente el cuerpo
                    content_length = int(self.headers['Content-Length'])
                    audio_data = self.rfile.read(content_length)
                    log_message(f"Audio recibido directamente: {len(audio_data)} bytes")
                
                # Guardar en archivo temporal
                import tempfile
                with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as temp:
                    temp_filename = temp.name
                    temp.write(audio_data)
                
                # Convertir audio a formato reconocible
                try:
                    import subprocess
                    wav_filename = temp_filename + '.wav'
                    
                    subprocess.run([
                        'ffmpeg', '-y', '-v', 'quiet',
                        '-i', temp_filename,
                        '-acodec', 'pcm_s16le',
                        '-ar', '16000',
                        '-ac', '1',
                        wav_filename
                    ], check=True)
                    
                    # Realizar reconocimiento de voz
                    import speech_recognition as sr
                    recognizer = sr.Recognizer()
                    
                    with sr.AudioFile(wav_filename) as source:
                        audio = recognizer.record(source)
                    
                    text = recognizer.recognize_google(audio, language="es-ES")
                    log_message(f"Texto reconocido: {text}")
                    
                    # Actualizar en Firebase
                    url = f"{FIREBASE_URL}/Voz/texto_reconocido.json"
                    response = requests.put(url, data=json.dumps(text))
                    
                    if response.ok:
                        log_message("Texto actualizado en Firebase")
                        # Actualizar timestamp
                        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        requests.put(f"{FIREBASE_URL}/Voz/timestamp.json", data=json.dumps(timestamp))
                    
                    # Responder al cliente
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    success_response = json.dumps({
                        "status": "success",
                        "recognized_text": text
                    })
                    self.wfile.write(success_response.encode())
                    
                except sr.UnknownValueError:
                    log_message("No se pudo reconocer el habla")
                    # Actualizar Firebase con error
                    requests.put(f"{FIREBASE_URL}/Voz/texto_reconocido.json", 
                                data=json.dumps("No se pudo reconocer el habla"))
                    
                    # Responder al cliente
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    error_response = json.dumps({
                        "status": "warning",
                        "message": "No se pudo reconocer el habla",
                        "recognized_text": "No se pudo reconocer el habla"
                    })
                    self.wfile.write(error_response.encode())
                
                except Exception as e:
                    log_message(f"Error en reconocimiento: {e}")
                    self.send_response(500)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    error_response = json.dumps({
                        "status": "error",
                        "message": str(e)
                    })
                    self.wfile.write(error_response.encode())
                
                finally:
                    # Limpiar archivos temporales
                    try:
                        os.remove(temp_filename)
                        if os.path.exists(wav_filename):
                            os.remove(wav_filename)
                    except:
                        pass
                
            except Exception as e:
                log_message(f"Error procesando POST: {e}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                error_response = json.dumps({"status": "error", "message": str(e)})
                self.wfile.write(error_response.encode())
        else:
            self.send_response(404)
            self.end_headers()

def main():
    """Función principal."""
    log_message("=== INICIANDO SERVIDOR DE RECONOCIMIENTO DE VOZ MÓVIL ===")
    
    # Generar certificados SSL si es necesario
    if not generate_self_signed_cert():
        log_message("No se pudieron generar certificados SSL. Abortando.")
        return
    
    # Crear y configurar servidor HTTPS
    handler = HTTPSHandler
    httpd = socketserver.TCPServer((SERVER_IP, WEB_PORT), handler)
    
    # Envolver con SSL
    httpd.socket = ssl.wrap_socket(
        httpd.socket,
        keyfile=SSL_KEY,
        certfile=SSL_CERT,
        server_side=True
    )
    
    # Generar y mostrar URL con código QR
    ip_address = get_ip_address()
    url = f"https://{ip_address}:{WEB_PORT}"
    
    log_message(f"Servidor iniciado en {url}")
    log_message("Escanea el código QR desde tu teléfono para acceder.")
    
    # Generar QR y guardar en archivo HTML
    qr_code_base64 = generate_qr_code(url)
    qr_file = os.path.join(TEMP_DIR, "qr_code.html")
    
    with open(qr_file, 'w') as f:
        f.write(f"""
        <!DOCTYPE html>
        <html>
        <head><title>Código QR para Reconocimiento de Voz</title></head>
        <body style="text-align: center; font-family: Arial;">
            <h1>Escanea este código QR</h1>
            <p>URL: {url}</p>
            <img src="data:image/png;base64,{qr_code_base64}" alt="QR Code" style="max-width: 300px;">
            <p>IMPORTANTE: Deberás aceptar el certificado de seguridad en tu navegador.</p>
        </body>
        </html>
        """)
    
    log_message(f"Código QR guardado en: {qr_file}")
    
    # Inicializar Firebase si es necesario
    try:
        # Verificar Firebase 
        response = requests.get(f"{FIREBASE_URL}/.json", timeout=5)
        if response.ok:
            log_message("Conexión con Firebase establecida.")
            
            # Inicializar la sección de voz si no existe
            voz = {
                "texto_reconocido": "Sistema iniciado",
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            requests.put(f"{FIREBASE_URL}/Voz.json", data=json.dumps(voz), timeout=5)
        else:
            log_message(f"Error conectando con Firebase: {response.status_code}")
    except Exception as e:
        log_message(f"Error conectando con Firebase: {e}")
    
    # Iniciar servidor
    try:
        log_message("Servidor listo para recibir conexiones. Presiona Ctrl+C para detener.")
        httpd.serve_forever()
    except KeyboardInterrupt:
        log_message("Servidor detenido por el usuario.")
    except Exception as e:
        log_message(f"Error en el servidor: {e}")
    finally:
        httpd.server_close()
        log_message("Servidor cerrado.")

if __name__ == "__main__":
    main()
