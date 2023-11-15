import { MISSING_TRACKS_JSON_PATH } from '../constants'
import { loadJsonFile } from '../fsUtil'
import {
  ALL_DATA_RANGE,
  SHEET_NAME,
  SheetTrack,
  getRows,
  itemToTrack,
  rowToTrack,
  trackToRow,
  upsertRows,
} from '../sheetsApi'
import { PrePlaylistItem } from './getSpotifyTracks'

export default async function () {
  const items = loadJsonFile<PrePlaylistItem[]>(MISSING_TRACKS_JSON_PATH)
  console.log('  > loaded', items.length, 'missing tracks from file')

  const foundRows = await getRows(SHEET_NAME, ALL_DATA_RANGE)
  console.log('  >', foundRows.length, 'existing missing tracks in spreadsheet')

  const nextTrackMap = new Map<string, SheetTrack>()
  foundRows.forEach((r) => {
    const t = rowToTrack(r)
    nextTrackMap.set(t.id, t)
  })
  let numNewRows = 0
  items.forEach((i) => {
    if (nextTrackMap.has(i.id)) {
      return
    }
    numNewRows++
    const t = itemToTrack(i)
    nextTrackMap.set(i.id, t)
  })

  console.log('  >', numNewRows, 'new rows to add to spreadsheet')
  if (numNewRows === 0) {
    return
  }

  const nextTracks = [...nextTrackMap.values()]

  nextTracks.sort(
    (a, z) => new Date(z.date).getTime() - new Date(a.date).getTime()
  )

  const nextRows = nextTracks.map((t) => trackToRow(t))

  console.log('  > upserting', nextRows.length, 'rows in spreadsheet')
  await upsertRows(SHEET_NAME, ALL_DATA_RANGE, nextRows)
}
