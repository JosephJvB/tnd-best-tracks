import * as sheetsApi from '../sheetsApi'

const SHEET_ID = '17-Vx_oswIG_Rw7S28xfE5TWx2HTJeE2r25zP4CAR5Ko'
sheetsApi.test__setSheetId(SHEET_ID)
const SHEET_NAME = 'TEST'

describe('sheetsApi_integration.ts', () => {
  describe('#getClient', () => {
    it('returns the authorized google sheets client', () => {
      const client = sheetsApi.getClient()

      expect(client).toBeDefined()
      expect(client.spreadsheets.batchUpdate).toBeDefined()
      expect(client.spreadsheets.values.get).toBeDefined()
      expect(client.spreadsheets.values.append).toBeDefined()
    })
  })

  describe('#getSpreadsheet', () => {
    it('returns the whole spreadsheet', async () => {
      const spreadsheet = await sheetsApi.getSpreadsheet()

      expect(spreadsheet).toBeDefined()
      expect(spreadsheet.properties?.title).toBe('UNIT TEST SPREADSHEET')
    })
  })

  describe('#createSheet', () => {
    it('returns a new sheet tab', async () => {
      const sheetName = `test - ${new Date().toLocaleString()}`

      const sheet = await sheetsApi.createSheet(sheetName)

      expect(sheet).toBeDefined()
      expect(sheet.properties?.title).toBe(sheetName)
    })
  })

  describe('#getRows', () => {
    it('returns the test data rows', async () => {
      const rows = await sheetsApi.getRows(SHEET_NAME, 'A1:D2')

      expect(rows).toBeDefined()
      expect(rows.length).toBe(2)
      expect(rows[0]).toEqual(['id', 'name', 'artist', 'year'])
      expect(rows[1]).toEqual(['hello__joevb__2020', 'hello', 'joevb', '2020'])
    })
  })

  describe('#addRow', () => {
    it('appends a single row to end of sheet', async () => {
      const row = [Date.now().toString(), '#addRow', 'joevb', '2020']

      await expect(
        sheetsApi.addRow(SHEET_NAME, 'A:D', row)
      ).resolves.toBeUndefined()
    })
  })

  describe('#addRows', () => {
    it('appends multiple rows to end of sheet', async () => {
      const row = [Date.now().toString(), '#addRows', 'joevb', '2020']
      const rows = Array(3).fill(row)

      await expect(
        sheetsApi.addRows(SHEET_NAME, 'A:D', rows)
      ).resolves.toBeUndefined()
    })
  })
})
