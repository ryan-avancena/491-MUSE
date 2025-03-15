import numpy as np
import pyaudio
from flask_socketio import SocketIO

def audio_recording(socketio):
    p = pyaudio.PyAudio()
    RATE = int(p.get_default_input_device_info()['defaultSampleRate'])
    DEVICE = p.get_default_input_device_info()['index']
    FORMAT = pyaudio.paInt16
    CHANNELS = 1
    INTERVAL = 0.10  # seconds
    CHUNK = int(RATE * INTERVAL)

    stream = p.open(format=FORMAT,
                    channels=CHANNELS,
                    rate=RATE,
                    input=True,
                    input_device_index=DEVICE,
                    frames_per_buffer=CHUNK)
    
    print("Recording audio...")

    try:
        while True:
            data = stream.read(CHUNK, exception_on_overflow=False)
            audio_data = np.frombuffer(data, dtype=np.int16)
            rms = np.sqrt(np.mean(audio_data**2))
            db = 20 * np.log10(rms) if rms > 0 else -np.inf

            # Emit volume data to the frontend
            socketio.emit('audio_data', {'volume': db})
    except KeyboardInterrupt:
        print("Stopping recording ...")
    finally:
        stream.stop_stream()
        stream.close()
        p.terminate()
