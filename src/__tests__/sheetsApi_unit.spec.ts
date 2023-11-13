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

  describe('#createSheet', () => {
    it('calls batchUpdate with the expected args', async () => {
      const sheetName = 'test-sheet-name'

      await sheetsApi.createSheet(sheetName)

      const client = sheetsApi.getClient()

      const batchUpdateFn = client.spreadsheets
        .batchUpdate as jest.MockedFunction<
        typeof client.spreadsheets.batchUpdate
      >

      expect(batchUpdateFn).toHaveBeenCalledTimes(1)
      expect(batchUpdateFn).toHaveBeenCalledWith({
        spreadsheetId: sheetsApi.SHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        },
      })
    })
  })

  describe('#getRows', () => {
    it('calls values.get with the expected args', async () => {
      const sheetName = 'test-sheet-name'
      const range = 'A1:B2'

      const client = sheetsApi.getClient()
      const getValuesFn = client.spreadsheets.values
        .get as any as jest.MockedFunction<
        (...args: any) => Promise<{ data: { values: any[] } }>
      >
      // doesn't know which implimentation
      getValuesFn.mockResolvedValueOnce({
        data: {
          values: [],
        },
      })

      await sheetsApi.getRows(sheetName, range)

      expect(getValuesFn).toHaveBeenCalledTimes(1)
      expect(getValuesFn).toHaveBeenCalledWith({
        spreadsheetId: sheetsApi.SHEET_ID,
        range: `${sheetName}!${range}`,
      })
    })
  })

  describe('#addRow', () => {
    it('calls values.append with the expected args', async () => {
      const sheetName = 'test-sheet-name'
      const range = 'A1:B2'
      const row = ['v1', 'v2']

      const client = sheetsApi.getClient()
      const appendValuesFn = client.spreadsheets.values
        .append as any as jest.MockedFunction<(...args: any) => Promise<any>>

      await sheetsApi.addRow(sheetName, range, row)

      expect(appendValuesFn).toHaveBeenCalledTimes(1)
      expect(appendValuesFn).toHaveBeenCalledWith({
        spreadsheetId: sheetsApi.SHEET_ID,
        range: `${sheetName}!${range}`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        includeValuesInResponse: true,
        requestBody: {
          majorDimension: 'ROWS',
          values: [row],
        },
      })
    })
  })

  describe('#addRows', () => {
    it('calls values.append with the expected args', async () => {
      const sheetName = 'test-sheet-name'
      const range = 'A1:B2'
      const rows = [
        ['v1', 'v2'],
        ['v3', 'v4'],
      ]

      const client = sheetsApi.getClient()
      const appendValuesFn = client.spreadsheets.values
        .append as any as jest.MockedFunction<(...args: any) => Promise<any>>

      await sheetsApi.addRows(sheetName, range, rows)

      expect(appendValuesFn).toHaveBeenCalledTimes(1)
      expect(appendValuesFn).toHaveBeenCalledWith({
        spreadsheetId: sheetsApi.SHEET_ID,
        range: `${sheetName}!${range}`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        includeValuesInResponse: true,
        requestBody: {
          majorDimension: 'ROWS',
          values: rows,
        },
      })
    })
  })
})
