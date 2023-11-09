import axios from 'axios'
import * as server from '../server'
import ChildProcess from 'child_process'

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

      console.log({ code })

      expect(execSyncSpy).toBeCalledTimes(1)
      expect(code).toBe(mockCode)
    })
  })
})
