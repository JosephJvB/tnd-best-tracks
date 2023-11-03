import * as server from '../server'
import * as spotifyApi from '../spotifyApi'
import * as manageSpotifyPlaylists from '../tasks/manageSpotifyPlaylists'

describe('server_integration.ts', () => {
  describe('#performServerCallback', () => {
    it('returns the req.query.code from GET to /tony', async () => {
      const onStart = jest.fn(() => {
        manageSpotifyPlaylists.startSpotifyCallback()
      })

      const code = await server.performServerCallback(onStart)

      console.log({ code })

      expect(onStart).toBeCalledTimes(1)
      expect(code).toBeDefined()
    })
  })

  describe('#performServerCallback and #submitCode', () => {
    it(
      'receives req.query.code and gets valid access_token',
      async () => {
        const onStart = jest.fn(() => {
          manageSpotifyPlaylists.startSpotifyCallback()
        })

        const code = await server.performServerCallback(onStart)

        expect(onStart).toBeCalledTimes(1)
        expect(code).toBeDefined()

        const token = await spotifyApi.submitCode(code)

        expect(token).toBeDefined()

        console.log({
          token,
        })
      },
      10 * 1000 // increased timeout
    )
  })
})
