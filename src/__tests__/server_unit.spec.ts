import axios from 'axios'
import * as server from '../server'

describe('server_unit.ts', () => {
  describe('#performServerCallback', () => {
    it('returns the req.query.code from GET to /tony', async () => {
      const mockCode = 'code_123'
      const mockState = 'state_123'
      const onStart = jest.fn(async () => {
        await axios({
          method: 'get',
          url: 'http://localhost:3000/tony',
          params: {
            code: mockCode,
            state: mockState,
          },
        })
      })

      const code = await server.performServerCallback(onStart)

      expect(onStart).toBeCalledTimes(1)
      expect(code).toBe(mockCode)
    })
  })
})
