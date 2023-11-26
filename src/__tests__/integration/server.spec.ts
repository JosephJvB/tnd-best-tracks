import * as server from '../../server'
import * as spotifyApi from '../../spotifyApi'

describe('integration/server.ts', () => {
  describe('#BASIC_AUTH', () => {
    it('can create basic auth string', () => {
      expect(spotifyApi.BASIC_AUTH.length).toBeGreaterThan(10)

      console.log(spotifyApi.BASIC_AUTH)
    })
  })

  describe('#performServerCallback alone', () => {
    it(
      'returns the req.query.code from GET to /tony',
      async () => {
        const code = await server.performServerCallback()

        expect(code).toBeDefined()
      },
      10 * 1000
    )
  })

  describe('#performServerCallback and #submitCode', () => {
    it(
      'receives req.query.code and gets valid access_token',
      async () => {
        const code = await server.performServerCallback()

        expect(code).toBeDefined()

        const token = await spotifyApi.submitCode(code)

        expect(token).toBeDefined()

        console.log({
          token,
        })
      },
      10 * 1000
    )
  })
})
