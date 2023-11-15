import * as updateSpreadsheet from '../../tasks/updateSpreadsheet'
import * as sheetsApi from '../../sheetsApi'
import * as fsUtil from '../../fsUtil'
import { PrePlaylistItem } from '../../tasks/getSpotifyTracks'

describe('unit/updateSpreadsheet.ts', () => {
  // hide logs
  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(jest.fn())
  const loadJsonSpy = jest
    .spyOn(fsUtil, 'loadJsonFile')
    .mockImplementation(jest.fn())
  const getRowsSpy = jest
    .spyOn(sheetsApi, 'getRows')
    .mockImplementation(jest.fn())
  const upsertRowsSpy = jest
    .spyOn(sheetsApi, 'upsertRows')
    .mockImplementation(jest.fn())
  const trackToRowSpy = jest.spyOn(sheetsApi, 'trackToRow')
  const rowToTrackSpy = jest.spyOn(sheetsApi, 'rowToTrack')
  const itemToTrackSpy = jest.spyOn(sheetsApi, 'itemToTrack')

  describe('#updateSpreadsheet', () => {
    it('adds all tracks to an empty sheet', async () => {
      const date = new Date().toString()
      const items = Array(5)
        .fill(0)
        .map((_, idx) => ({
          id: `id_${idx}`,
          youtubeTrack: {
            name: `name_${idx}`,
            artist: `artist_${idx}`,
            link: `link_${idx}`,
            videoPublishedDate: date,
          },
        })) as PrePlaylistItem[]

      loadJsonSpy.mockReturnValueOnce(items)
      getRowsSpy.mockResolvedValueOnce([])

      await updateSpreadsheet.default()

      expect(rowToTrackSpy).toHaveBeenCalledTimes(0)
      expect(itemToTrackSpy).toHaveBeenCalledTimes(items.length)
      expect(trackToRowSpy).toHaveBeenCalledTimes(items.length)
      items.forEach((i) => {
        expect(trackToRowSpy).toHaveBeenCalledWith({
          id: i.id,
          name: i.youtubeTrack.name,
          artist: i.youtubeTrack.artist,
          link: i.youtubeTrack.link,
          date: i.youtubeTrack.videoPublishedDate,
          spotify_id: '',
        })
      })
      expect(getRowsSpy).toHaveBeenCalledTimes(1)
      expect(upsertRowsSpy).toHaveBeenCalledTimes(1)
      expect(upsertRowsSpy.mock.calls[0][2].length).toBe(items.length)
    })

    it('adds all tracks to an existing sheet with some rows', async () => {
      const numExistingRows = 2
      const date = new Date().toString()
      const items = Array(5)
        .fill(0)
        .map((_, idx) => ({
          id: `id_${idx}`,
          youtubeTrack: {
            name: `name_${idx}`,
            artist: `artist_${idx}`,
            link: `link_${idx}`,
            videoPublishedDate: date,
          },
        })) as PrePlaylistItem[]

      loadJsonSpy.mockReturnValueOnce(items)
      getRowsSpy.mockResolvedValueOnce(
        items
          .slice(0, numExistingRows)
          .map((i) => [
            i.id,
            i.youtubeTrack.name,
            i.youtubeTrack.artist,
            i.youtubeTrack.videoPublishedDate,
            i.youtubeTrack.link,
            '',
          ])
      )

      await updateSpreadsheet.default()

      expect(rowToTrackSpy).toHaveBeenCalledTimes(numExistingRows)
      expect(itemToTrackSpy).toHaveBeenCalledTimes(items.length)
      expect(trackToRowSpy).toHaveBeenCalledTimes(items.length)
      items.forEach((i) => {
        expect(trackToRowSpy).toHaveBeenCalledWith({
          id: i.id,
          name: i.youtubeTrack.name,
          artist: i.youtubeTrack.artist,
          link: i.youtubeTrack.link,
          date: i.youtubeTrack.videoPublishedDate,
          spotify_id: '',
        })
      })
      expect(getRowsSpy).toHaveBeenCalledTimes(1)
      expect(upsertRowsSpy).toHaveBeenCalledTimes(1)
      expect(upsertRowsSpy.mock.calls[0][2].length).toBe(items.length)
    })

    it('does not call upsert if no new rows to add', async () => {
      const date = new Date().toString()
      const items = Array(5)
        .fill(0)
        .map((_, idx) => ({
          id: `id_${idx}`,
          youtubeTrack: {
            name: `name_${idx}`,
            artist: `artist_${idx}`,
            link: `link_${idx}`,
            videoPublishedDate: date,
          },
        })) as PrePlaylistItem[]

      loadJsonSpy.mockReturnValueOnce(items)
      getRowsSpy.mockResolvedValueOnce(
        items.map((i) => [
          i.id,
          i.youtubeTrack.name,
          i.youtubeTrack.artist,
          i.youtubeTrack.videoPublishedDate,
          i.youtubeTrack.link,
          '',
        ])
      )

      await updateSpreadsheet.default()

      expect(rowToTrackSpy).toHaveBeenCalledTimes(items.length)
      expect(itemToTrackSpy).toHaveBeenCalledTimes(items.length)
      expect(trackToRowSpy).toHaveBeenCalledTimes(0)
      expect(getRowsSpy).toHaveBeenCalledTimes(1)
      expect(upsertRowsSpy).toHaveBeenCalledTimes(0)
    })
  })
})
