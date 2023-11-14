import * as sheetsApi from '../sheetsApi'

jest.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: jest.fn(),
    },
    sheets: jest.fn(() => ({
      spreadsheets: {
        get: jest.fn(),
        batchUpdate: jest.fn(),
        values: {
          get: jest.fn(),
          append: jest.fn(),
        },
      },
    })),
  },
}))

describe('sheetsApi_unit.ts', () => {
  describe('#rowToTrack', () => {
    const input = [
      'jvb_id',
      'joes track name',
      'joe van bo',
      new Date().toString(),
      'https://joevanbo.com',
    ]

    it('turns row to track without spotifyId', () => {
      const result = sheetsApi.rowToTrack(input)

      expect(result.id).toBe(input[0])
      expect(result.name).toBe(input[1])
      expect(result.artist).toBe(input[2])
      expect(result.video_published_date).toBe(input[3])
      expect(result.link).toBe(input[4])
      expect(result.spotify_id).toBe('')
    })

    it('turns row to track with spotifyId', () => {
      const spotifyId = 'jvb_spotify_id'
      const result = sheetsApi.rowToTrack([...input, spotifyId])

      expect(result.id).toBe(input[0])
      expect(result.name).toBe(input[1])
      expect(result.artist).toBe(input[2])
      expect(result.video_published_date).toBe(input[3])
      expect(result.link).toBe(input[4])
      expect(result.spotify_id).toBe(spotifyId)
    })
  })

  describe('#trackToRow', () => {
    const input = {
      id: 'jvb_id',
      name: 'joes track name',
      artist: 'joe van bo',
      video_published_date: new Date().toString(),
      link: 'https://joevanbo.com',
      spotify_id: '',
    }

    it('turns track to row without spotifyId', () => {
      const result = sheetsApi.trackToRow(input)

      expect(result.length).toBe(6)
      expect(result[0]).toBe(input.id)
      expect(result[1]).toBe(input.name)
      expect(result[2]).toBe(input.artist)
      expect(result[3]).toBe(input.video_published_date)
      expect(result[4]).toBe(input.link)
      expect(result[5]).toBe('')
    })

    it('turns track to row with spotifyId', () => {
      const spotifyId = 'jvb_spotify_id'
      const result = sheetsApi.trackToRow({ ...input, spotify_id: spotifyId })

      expect(result.length).toBe(6)
      expect(result[0]).toBe(input.id)
      expect(result[1]).toBe(input.name)
      expect(result[2]).toBe(input.artist)
      expect(result[3]).toBe(input.video_published_date)
      expect(result[4]).toBe(input.link)
      expect(result[5]).toBe(spotifyId)
    })
  })

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

  describe('#getSpreadsheet', () => {
    it('calls spreadsheets.get with the expected args', async () => {
      const spreadsheetTitle = 'mock title'

      const client = sheetsApi.getClient()
      const spreadsheetsGetFn = client.spreadsheets
        .get as any as jest.MockedFunction<
        (...args: any) => Promise<{
          data: sheetsApi.Spreadsheet
        }>
      >
      spreadsheetsGetFn.mockResolvedValueOnce({
        data: {
          properties: {
            title: spreadsheetTitle,
          },
        },
      })

      const result = await sheetsApi.getSpreadsheet()

      expect(spreadsheetsGetFn).toHaveBeenCalledTimes(1)
      expect(spreadsheetsGetFn).toHaveBeenCalledWith({
        spreadsheetId: sheetsApi.SHEET_ID,
      })
      expect(result.properties?.title).toBe(spreadsheetTitle)
    })
  })

  describe('#createSheet', () => {
    it('calls batchUpdate with the expected args', async () => {
      const sheetName = 'test-sheet-name'

      const client = sheetsApi.getClient()
      const batchUpdateFn = client.spreadsheets
        .batchUpdate as any as jest.MockedFunction<
        (...args: any) => Promise<{
          data: {
            replies: Array<{ addSheet: { properties: { title: string } } }>
          }
        }>
      >
      batchUpdateFn.mockResolvedValueOnce({
        data: {
          replies: [
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

      await sheetsApi.createSheet(sheetName)

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
