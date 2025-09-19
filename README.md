# Speech-to-Text with Whisper

A simple web application for speech-to-text transcription using the Hugging Face Transformers.js library and the Xenova/whisper-base model.

## Features

- 🎤 Real-time microphone recording
- 🤖 AI-powered speech recognition using Whisper
- 📝 Clean, textbook-style interface
- 🌐 Runs entirely in the browser (no server required)
- 📱 Responsive design for mobile and desktop

## Usage

1. Open `index.html` in a modern web browser
2. Allow microphone permissions when prompted
3. Wait for the Whisper model to load (first time may take a moment)
4. Click the microphone button to start recording
5. Speak clearly into your microphone
6. Click the button again to stop recording and get the transcription

## Requirements

- Modern web browser with Web Audio API support
- Microphone access
- Internet connection (for loading the Whisper model)

## Technical Details

- **Model**: Xenova/whisper-base from Hugging Face
- **Framework**: Transformers.js
- **Audio Processing**: Web Audio API
- **Styling**: Custom CSS with textbook-inspired design

## Files

- `index.html` - Main HTML structure
- `styles.css` - Styling and layout
- `script.js` - JavaScript functionality and Whisper integration

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

Note: The application requires a secure context (HTTPS or localhost) for microphone access.