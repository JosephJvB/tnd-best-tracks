import axios from 'axios'
import * as server from '../server'
import ChildProcess from 'child_process'

// this test passes with node -v v16.15.1
// but fails with node -v v20.8.0
describe('server_unit.ts', () => {
  describe('#performServerCallback', () => {
    it('returns the req.query.code from GET to /tony', async () => {
      const mockCode = 'code_123'
      const mockState = 'state_123'

      const callbackToServer = jest.fn(async () => {
        await new Promise((r) => setTimeout(r, 100))
        await axios({
          method: 'get',
          url: 'http://localhost:3000/tony',
          params: {
            code: mockCode,
            state: mockState,
          },
        })
      })
      const execSyncSpy = jest
        .spyOn(ChildProcess, 'execSync')
        .mockImplementationOnce(callbackToServer as any)

      const code = await server.performServerCallback()

      expect(execSyncSpy).toBeCalledTimes(1)
      expect(code).toBe(mockCode)
    })
  })
})
