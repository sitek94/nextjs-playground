// components/AudioVisualizer.js
import {useEffect, useRef} from 'react'
import {useState} from 'react'

export default function AudioVisualizer({
  audioBuffer,
}: {
  audioBuffer: AudioBuffer
}) {
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
    analyser.fftSize = 1024
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
      analyser.getByteTimeDomainData(dataArray)

      // Clear the canvas and set its fill style.
      canvasContext.clearRect(0, 0, canvas.width, canvas.height)
      canvasContext.fillStyle = '#000000'
      canvasContext.fillRect(0, 0, canvas.width, canvas.height)

      // Calculate the center point of the canvas.
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Calculate the maximum radius of the circle.
      const radius = Math.min(centerX, centerY) - 50

      // Set the stroke style of the waveform.
      canvasContext.strokeStyle = '#2FE8C3'
      canvasContext.lineWidth = 3

      // Draw the waveform.
      canvasContext.beginPath()
      for (let i = 0; i < bufferLength; i++) {
        const angle = (i / bufferLength) * Math.PI * 2
        const amplitude = dataArray[i] / 256
        const x = centerX + radius * Math.cos(angle) * amplitude
        const y = centerY + radius * Math.sin(angle) * amplitude
        if (i === 0) {
          canvasContext.moveTo(x, y)
        } else {
          canvasContext.lineTo(x, y)
        }
      }
      canvasContext.closePath()
      canvasContext.stroke()
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
