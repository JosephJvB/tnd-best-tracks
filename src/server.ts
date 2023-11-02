import express from 'express'
import { Server } from 'http'

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
      res.send(200)

      console.log('performServerCallback', {
        code: req.query.code,
        state: req.query.state,
      })

      if (!runningServer) {
        console.error('something is amiss here', {
          runningServer,
        })
        process.exit()
      }

      runningServer.close((err) => {
        if (err) {
          reject(err)
        } else {
          resolve(req.query.code)
        }
      })
    })

    const PORT = 3000
    runningServer = server.listen(PORT, () =>
      console.log('server started on', PORT)
    )
  })
}
