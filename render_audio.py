import pandas as pd
import numpy as np
import pyaudio
import time
from math import log10

def audio_recording():
    p = pyaudio.PyAudio()
    RATE = int(p.get_default_input_device_info()['defaultSampleRate'])
    DEVICE = p.get_default_input_device_info()['index']
    FORMAT = pyaudio.paInt16
    CHANNELS = 1
    
    INTERVAL = 0.10     # seconds 
    CHUNK = int(RATE * INTERVAL)

    print("Using: ", p.get_default_input_device_info())

    stream = p.open(format=pyaudio.paInt16,
                    channels=CHANNELS,
                    rate=RATE,
                    input=True,
                    input_device_index=DEVICE,
                    frames_per_buffer=CHUNK)
    
    print("Recoding... (Press Ctrl+C to stop)")

    try:
        while True:
            data = stream.read(CHUNK, exception_on_overflow=False)
            audio_data = np.frombuffer(data,dtype=np.int16)
            rms = np.sqrt(np.mean(audio_data**2))
            db = 20 * np.log10(rms) if rms > 0 else -np.inf
            print(f'Volume: {db:.2f}dB')
    except KeyboardInterrupt:
        print("Stopping recording ...")
    finally:
        stream.stop_stream()
        stream.close()
        p.terminate()
    


if __name__ == '__main__':
    audio_recording()