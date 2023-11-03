import * as server from '../server'
import * as manageSpotifyPlaylists from '../tasks/manageSpotifyPlaylists'

describe('server_integration.ts', () => {
  describe('#performServerCallback', () => {
    // need to await for spotify request! Increase timeout somehow
    it.skip('returns the req.query.code from GET to /tony', async () => {
      const onStart = jest.fn(() => {
        manageSpotifyPlaylists.startSpotifyCallback()
      })

      const code = await server.performServerCallback(onStart)

      console.log({ code })

      expect(onStart).toBeCalledTimes(1)
      expect(code).toBeDefined()
    })
  })
})
