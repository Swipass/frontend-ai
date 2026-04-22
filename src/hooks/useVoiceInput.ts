// src/hooks/useVoiceInput.ts
import { useState, useCallback, useEffect, useRef } from 'react'

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export function useVoiceInput() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsSupported(false)
      setError('Speech recognition is not supported in this browser. Please type your command instead.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += text
        } else {
          // For interim, we update but don't finalize
          setTranscript(text)
        }
      }
      if (final) {
        setTranscript(final)
        setIsRecording(false)
        recognition.stop()
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error)
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access and try again.')
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.')
      } else {
        setError(`Speech recognition error: ${event.error}`)
      }
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  const startRecording = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition not supported. Please type your command.')
      return
    }
    setError(null)
    setTranscript('')
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
        setIsRecording(true)
      } catch (err) {
        console.error('Failed to start recognition', err)
        setError('Failed to start listening. Please try again.')
      }
    } else {
      setError('Speech recognition not initialized. Please refresh the page.')
    }
  }, [isSupported])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // ignore
      }
    }
    setIsRecording(false)
  }, [])

  return {
    isRecording,
    transcript,
    error,
    isSupported,
    startRecording,
    stopRecording,
  }
}