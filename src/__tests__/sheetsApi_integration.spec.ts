import * as sheetsApi from '../sheetsApi'

const SHEET_ID = '17-Vx_oswIG_Rw7S28xfE5TWx2HTJeE2r25zP4CAR5Ko'
const SHEET_NAME = 'TEST'
const CELL_RANGE = 'A1:D2'
sheetsApi.test__setSheetId(SHEET_ID)

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

  describe('#createSheet', () => {
    it('returns a new sheet tab', async () => {
      const sheetName = `test - ${new Date().toLocaleString()}`

      await expect(sheetsApi.createSheet(sheetName)).resolves.toBeUndefined()
    })
  })

  describe('#getRows', () => {
    it('returns the test data rows', async () => {
      const rows = await sheetsApi.getRows(SHEET_NAME, CELL_RANGE)

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
