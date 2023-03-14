'use client'

import {useState} from 'react'
// components/AudioVisualizer.js
import {useEffect, useRef} from 'react'

export default function Home() {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null)

  async function loadAudio() {
    const response = await fetch(`/api/audio`)
    const arrayBuffer = await response.arrayBuffer()

    const audioContext = new AudioContext()

    audioContext.decodeAudioData(arrayBuffer, buffer => {
      setAudioBuffer(buffer)
    })
  }

  return (
    <div>
      {audioBuffer ? (
        <AudioVisualizer audioBuffer={audioBuffer} />
      ) : (
        <button onClick={loadAudio}>Start Recording</button>
      )}
    </div>
  )
}

function AudioVisualizer({audioBuffer}: {audioBuffer: AudioBuffer}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const canvasContext = canvas?.getContext('2d')
    if (!canvas || !canvasContext) {
      return
    }
    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 512
    analyser.smoothingTimeConstant = 0.9
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    // Connect the audio stream to the AnalyserNode.
    const source = audioContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(analyser)
    analyser.connect(audioContext.destination)

    const drawWaveform = () => {
      requestAnimationFrame(drawWaveform)

      // Get the latest audio data.
      analyser.getByteFrequencyData(dataArray)

      // Clear the canvas and set its fill style.
      canvasContext.clearRect(0, 0, canvas.width, canvas.height)
      canvasContext.fillStyle = '#000000'
      canvasContext.fillRect(0, 0, canvas.width, canvas.height)

      // Calculate the center point of the canvas.
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Calculate the maximum radius of the circle.
      const radius = Math.min(centerX, centerY) - 200

      // Set the fill style of the rectangles.
      canvasContext.fillStyle = '#2FE8C3'
      const scalingFactor = 1
      const spacingFactor = 1

      for (let i = 0; i < bufferLength / 2 + 1; i++) {
        const angle = (i / bufferLength) * Math.PI * 2 - Math.PI / 2
        const mirroredAngle = angle //+ Math.PI

        const amplitude = Math.log10((dataArray[i] * scalingFactor) / 256 + 1)
        const rectangleHeight = radius * amplitude
        const rectangleWidth =
          ((2 * Math.PI * radius) / bufferLength) * spacingFactor

        // Draw the original rectangle.
        canvasContext.save()
        canvasContext.translate(centerX, centerY)
        // canvasContext.rotate(-Math.PI / 2)
        canvasContext.rotate(angle)
        canvasContext.beginPath()
        canvasContext.rect(
          radius,
          -rectangleWidth / 2,
          rectangleHeight,
          rectangleWidth,
        )
        canvasContext.closePath()
        canvasContext.fill()
        canvasContext.restore()

        // Draw the mirrored rectangle.
        canvasContext.save()
        canvasContext.translate(centerX, centerY)
        canvasContext.scale(-1, 1) // Flip along the Y-axis
        // canvasContext.rotate(-Math.PI / 2)
        canvasContext.rotate(mirroredAngle)
        canvasContext.beginPath()
        canvasContext.rect(
          radius,
          -rectangleWidth / 2,
          rectangleHeight,
          rectangleWidth,
        )
        canvasContext.closePath()
        canvasContext.fill()
        canvasContext.restore()
      }
    }

    // Start the visualization.
    setIsPlaying(true)
    source.start(0)
    drawWaveform()

    // Stop the visualization when the component unmounts.
    return () => {
      setIsPlaying(false)
      source.stop()
    }
  }, [audioBuffer])

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={800}
        height={800}
        style={{borderRadius: '50%', backgroundColor: '#000000'}}
      />
      {isPlaying && <button onClick={() => setIsPlaying(false)}>Pause</button>}
    </div>
  )
}

// const frequency = dataArray[i];
//         var r = (((frequency - 0) * (40 - 0)) / (255 - 0)) + 0;
