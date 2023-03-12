'use client'

import {useState} from 'react'

import AudioVisualizer from '@/components/audio-visualizer'

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
