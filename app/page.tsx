'use client'

export default function Home() {
  return (
    <main>
      <button onClick={playIntro}>Start</button>

      <canvas></canvas>
    </main>
  )
}

async function playIntro() {
  const response = await fetch(`/api/audio`)
  const arrayBuffer = await response.arrayBuffer()

  const audioContext = new AudioContext()
  audioContext.decodeAudioData(arrayBuffer, buffer => {
    const source = audioContext.createBufferSource()
    source.buffer = buffer
    source.connect(audioContext.destination)
    source.start(0)
  })
}
