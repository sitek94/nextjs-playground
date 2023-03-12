'use client'

import classes from './page.module.css'

export default function Home() {
  return (
    <main className={classes.main}>
      <button onClick={playIntro}>Start</button>
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
