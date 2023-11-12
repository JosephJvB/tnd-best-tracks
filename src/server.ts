import express from 'express'
import { Server } from 'http'
import { AUTH_FLOW_INIT_URL } from './spotifyApi'
import { execSync } from 'child_process'

export type TonysRequest = express.Request<
  any,
  any,
  any,
  { code: string; state: string }
>

export const performServerCallback = () => {
  const server = express()

  let runningServer: Server | undefined

  return new Promise<string>((resolve, reject) => {
    server.get('/tony', async (req: TonysRequest, res) => {
      res.sendStatus(200)

      if (!runningServer) {
        console.error('something is amiss here', {
          runningServer,
        })
        process.exit()
      }

      runningServer.close((err) => {
        console.log('onClose', err)
        if (err) {
          reject(err)
        } else {
          resolve(req.query.code)
        }
      })
    })

    const PORT = 3000
    runningServer = server.listen(PORT, () => {
      console.log('server started on', PORT)

      execSync(`open -a Firefox "${AUTH_FLOW_INIT_URL}"`)
    })
  })
}
