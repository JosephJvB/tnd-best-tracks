import * as sheetsApi from '../../sheetsApi'

const SHEET_ID = '17-Vx_oswIG_Rw7S28xfE5TWx2HTJeE2r25zP4CAR5Ko'
sheetsApi.test__setSheetId(SHEET_ID)
const SHEET_NAME = 'TEST'

describe('integration/sheetsApi.ts', () => {
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
    it('getRows A1:F2', async () => {
      const rows = await sheetsApi.getRows(SHEET_NAME, 'A1:F2')

      expect(rows).toBeDefined()
      expect(rows.length).toBe(2)
      expect(rows[0]).toEqual([
        'id',
        'name',
        'artist',
        'date',
        'link',
        'spotify_id',
      ])
      expect(rows[1]).toEqual([
        'hello__joevb__2020',
        'hello',
        'joevb',
        'Tue Nov 14 2023 21:33:58 GMT+0000 (Greenwich Mean Time)',
        'https://test.com',
      ])
    })

    it('getRows A2:F1000', async () => {
      const rows = await sheetsApi.getRows(SHEET_NAME, 'A2:F1000')

      expect(rows).toBeDefined()
      expect(rows.length).toBeGreaterThan(2)
      // ie: doesnt return empty rows even if you ask for it
      expect(rows.length).toBeLessThan(800)
      expect(rows[0]).toEqual([
        'hello__joevb__2020',
        'hello',
        'joevb',
        'Tue Nov 14 2023 21:33:58 GMT+0000 (Greenwich Mean Time)',
        'https://test.com',
      ])
    })
  })

  describe('#addRow', () => {
    it('addRow A:F', async () => {
      const row = [
        `id_${Date.now()}`,
        'addRowTest',
        'A:F',
        new Date().toString(),
        'https://addRow.com',
      ]

      await expect(
        sheetsApi.addRow(SHEET_NAME, 'A:F', row)
      ).resolves.toBeUndefined()
    })
  })

  describe('#addRows', () => {
    it('addRows A:F', async () => {
      const row = [
        `id_${Date.now()}`,
        'addRowsTest',
        'A:F',
        new Date().toString(),
        'https://addRows.com',
      ]
      const rows = Array(3).fill(row)

      await expect(
        sheetsApi.addRows(SHEET_NAME, 'A:F', rows)
      ).resolves.toBeUndefined()
    })

    // doesnt work the way i want - only appends
    it('addRows A2:F', async () => {
      const row = [
        `id_${Date.now()}`,
        'addRowsTest',
        'A2:F',
        new Date().toString(),
        'https://addRows.com',
      ]
      const rows = Array(3).fill(row)

      await expect(
        sheetsApi.addRows(SHEET_NAME, 'A2:F', rows)
      ).resolves.toBeUndefined()
    })
  })

  describe('#upsertRows', () => {
    it('upsertRows A4:F', async () => {
      const row = [
        `id_${Date.now()}`,
        'upsertRowsTest',
        'A4:F',
        new Date().toString(),
        'https://upsertRows.com',
      ]
      const rows = Array(3).fill(row)

      await expect(
        sheetsApi.upsertRows(SHEET_NAME, 'A4:F', rows)
      ).resolves.toBeUndefined()
    })
  })
})
