import * as sheetsApi from '../sheetsApi'

jest.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: jest.fn(),
    },
    sheets: jest.fn(() => ({
      spreadsheets: {
        batchUpdate: jest.fn(),
        values: {
          get: jest.fn(),
          append: jest.fn(),
        },
      },
    })),
  },
}))

describe('sheetsApi.ts', () => {
  describe('#getClient', () => {
    it('returns a google client', () => {
      const client = sheetsApi.getClient()

      expect(client?.spreadsheets?.batchUpdate).toBeDefined()
      expect(client?.spreadsheets?.values?.get).toBeDefined()
      expect(client?.spreadsheets?.values?.append).toBeDefined()
    })
    it('creates only one google client on repeated requests', () => {
      const client1 = sheetsApi.getClient()
      const client2 = sheetsApi.getClient()

      expect(client1).toBe(client2)
    })
  })
})
