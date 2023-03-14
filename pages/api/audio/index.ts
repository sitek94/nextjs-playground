import fs from 'fs'
import path from 'path'
import {NextApiRequest, NextApiResponse} from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const filePath = path.join(process.cwd(), 'public', 'audio', 'sample.mp3')
  const fileContents = fs.readFileSync(filePath)

  // set the response headers
  res.setHeader('Content-Type', 'audio/mpeg')
  res.setHeader('Content-Length', fileContents.length)
  res.setHeader('Content-Disposition', 'attachment; filename=song.mp3')

  res.end(fileContents)
}
