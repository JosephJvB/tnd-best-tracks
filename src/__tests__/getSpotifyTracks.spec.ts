import {
  batchGetById,
  searchSpotifyTracks,
  PrePlaylistItem,
  TrimSpotifyTrack,
} from '../tasks/getSpotifyTracks'
import * as spotifyApi from '../spotifyApi'
import * as mapUtil from '../mapUtil'
import {
  SPOTIFY_TRACK_ID_MAP_JSON_PATH,
  YOUTUBE_ID_MAP_JSON_PATH,
} from '../constants'

describe('getSpotifyTracks.ts', () => {
  const loadMapFn = jest.fn()
  const saveMapFn = jest.fn()
  const mapHelperSpy = jest
    .spyOn(mapUtil, 'createMapHelper')
    .mockImplementation(
      jest.fn(() => ({
        load: loadMapFn,
        save: saveMapFn,
      }))
    )
  describe('#batchGetById', () => {
    const getTracksSpy = jest
      .spyOn(spotifyApi, 'getTracks')
      .mockImplementation(jest.fn())

    it('returns empty map if empty array is passed', async () => {
      const input: string[] = []

      const existingMap = new Map()
      loadMapFn.mockReturnValueOnce(existingMap)

      const result = await batchGetById(input)

      expect(mapHelperSpy).toBeCalledTimes(1)
      expect(mapHelperSpy).toBeCalledWith(SPOTIFY_TRACK_ID_MAP_JSON_PATH)
      expect(loadMapFn).toBeCalledTimes(1)
      expect(getTracksSpy).toBeCalledTimes(0)
      expect(saveMapFn).toBeCalledTimes(0)
      expect(result.size).toBe(0)
    })

    it('returns a map of the found spotifyIds: (5 / 10)', async () => {
      const NUM_FOUND_TRACKS = 5
      const input = Array(10)
        .fill(0)
        .map((_, i) => `id_${i}`)

      const spotifyTracks: spotifyApi.SpotifyTrack[] = input
        .slice(0, NUM_FOUND_TRACKS)
        .map((id, idx) => ({
          id: id,
          name: `name_${idx}`,
          uri: `uri_${idx}`,
          href: `href_${idx}`,
          artists: [
            {
              name: `artist_${idx}`,
            } as spotifyApi.SpotifyArtist,
          ],
        }))

      const existingMap = new Map()
      loadMapFn.mockReturnValueOnce(existingMap)

      getTracksSpy.mockResolvedValueOnce({
        tracks: spotifyTracks,
      })

      const result = await batchGetById(input)

      expect(mapHelperSpy).toBeCalledTimes(1)
      expect(mapHelperSpy).toBeCalledWith(SPOTIFY_TRACK_ID_MAP_JSON_PATH)
      expect(loadMapFn).toBeCalledTimes(1)
      expect(loadMapFn).toBeCalledWith()
      expect(getTracksSpy).toBeCalledTimes(Math.ceil(input.length / 50))
      for (let i = 0; i < input.length; i += 50) {
        expect(getTracksSpy).toBeCalledWith(input.slice(i, i + 50))
        expect(saveMapFn).toBeCalledWith(existingMap)
      }
      expect(saveMapFn).toBeCalledTimes(Math.ceil(input.length / 50))
      expect(result.size).toBe(NUM_FOUND_TRACKS)
    })

    it('returns a map of the found spotifyIds: (53 / 55)', async () => {
      const NUM_FOUND_TRACKS = 53
      const input = Array(55)
        .fill(0)
        .map((_, i) => `id_${i}`)

      const spotifyTracks: spotifyApi.SpotifyTrack[] = input
        .slice(0, NUM_FOUND_TRACKS)
        .map((id, idx) => ({
          id: id,
          name: `name_${idx}`,
          uri: `uri_${idx}`,
          href: `href_${idx}`,
          artists: [
            {
              name: `artist_${idx}`,
            } as spotifyApi.SpotifyArtist,
          ],
        }))

      const existingMap = new Map()
      loadMapFn.mockReturnValueOnce(existingMap)

      for (let i = 0; i < input.length; i += 50) {
        getTracksSpy.mockResolvedValueOnce({
          tracks: spotifyTracks.slice(i, i + 50),
        })
      }

      const result = await batchGetById(input)

      expect(mapHelperSpy).toBeCalledTimes(1)
      expect(mapHelperSpy).toBeCalledWith(SPOTIFY_TRACK_ID_MAP_JSON_PATH)
      expect(loadMapFn).toBeCalledTimes(1)
      expect(getTracksSpy).toBeCalledTimes(Math.ceil(input.length / 50))
      expect(saveMapFn).toBeCalledTimes(Math.ceil(input.length / 50))
      for (let i = 0; i < input.length; i += 50) {
        expect(getTracksSpy).toBeCalledWith(input.slice(i, i + 50))
        expect(saveMapFn).toBeCalledWith(existingMap)
      }
      expect(result.size).toBe(NUM_FOUND_TRACKS)
    })

    it('returns a map of the found spotifyIds: (420 / 690)', async () => {
      const NUM_FOUND_TRACKS = 420
      const input = Array(690)
        .fill(0)
        .map((_, i) => `id_${i}`)

      const spotifyTracks: spotifyApi.SpotifyTrack[] = input
        .slice(0, NUM_FOUND_TRACKS)
        .map((id, idx) => ({
          id: id,
          name: `name_${idx}`,
          uri: `uri_${idx}`,
          href: `href_${idx}`,
          artists: [
            {
              name: `artist_${idx}`,
            } as spotifyApi.SpotifyArtist,
          ],
        }))

      const existingMap = new Map()
      loadMapFn.mockReturnValueOnce(existingMap)

      for (let i = 0; i < input.length; i += 50) {
        getTracksSpy.mockResolvedValueOnce({
          tracks: spotifyTracks.slice(i, i + 50),
        })
      }

      const result = await batchGetById(input)

      expect(mapHelperSpy).toBeCalledWith(SPOTIFY_TRACK_ID_MAP_JSON_PATH)
      expect(loadMapFn).toBeCalledTimes(1)
      expect(getTracksSpy).toBeCalledTimes(Math.ceil(input.length / 50))
      for (let i = 0; i < input.length; i += 50) {
        expect(getTracksSpy).toBeCalledWith(input.slice(i, i + 50))
        expect(saveMapFn).toBeCalledWith(existingMap)
      }
      expect(result.size).toBe(NUM_FOUND_TRACKS)
    })

    it('can resume progress (420 / 690)', async () => {
      const NUM_FOUND_TRACKS = 420
      const input = Array(690)
        .fill(0)
        .map((_, i) => `id_${i}`)

      const spotifyTracks: spotifyApi.SpotifyTrack[] = input
        .slice(0, NUM_FOUND_TRACKS)
        .map((id, idx) => ({
          id: id,
          name: `name_${idx}`,
          uri: `uri_${idx}`,
          href: `href_${idx}`,
          artists: [
            {
              name: `artist_${idx}`,
            } as spotifyApi.SpotifyArtist,
          ],
        }))

      const numExistingTracks = 123
      const existingMap = new Map<string, TrimSpotifyTrack>(
        spotifyTracks.slice(0, numExistingTracks).map((t) => [
          t.id,
          {
            id: t.id,
            href: t.href,
            uri: t.uri,
            name: t.name,
            artists: t.artists.map((a) => a.name),
          },
        ])
      )
      loadMapFn.mockReturnValueOnce(existingMap)

      for (let i = numExistingTracks; i < input.length; i += 50) {
        getTracksSpy.mockResolvedValueOnce({
          tracks: spotifyTracks.slice(i, i + 50),
        })
      }

      const result = await batchGetById(input)

      expect(mapHelperSpy).toBeCalledWith(SPOTIFY_TRACK_ID_MAP_JSON_PATH)
      expect(loadMapFn).toBeCalledTimes(1)
      expect(getTracksSpy).toBeCalledTimes(
        Math.ceil((input.length - numExistingTracks) / 50)
      )
      for (let i = numExistingTracks; i < input.length; i += 50) {
        expect(getTracksSpy).toBeCalledWith(input.slice(i, i + 50))
        expect(saveMapFn).toBeCalledWith(existingMap)
      }
      expect(result.size).toBe(NUM_FOUND_TRACKS)
    })
  })

  describe('#searchSpotifyTracks', () => {
    const findTrackSpy = jest
      .spyOn(spotifyApi, 'findTrack')
      .mockImplementation(jest.fn())

    it('returns empty map if empty array is passed', async () => {
      const input: PrePlaylistItem[] = []

      const existingMap = new Map()
      loadMapFn.mockReturnValueOnce(existingMap)

      const result = await searchSpotifyTracks(input)

      expect(mapHelperSpy).toBeCalledTimes(1)
      expect(mapHelperSpy).toBeCalledWith(YOUTUBE_ID_MAP_JSON_PATH)
      expect(loadMapFn).toBeCalledTimes(1)
      expect(findTrackSpy).toBeCalledTimes(0)
      expect(saveMapFn).toBeCalledTimes(0)
      expect(result.size).toBe(0)
    })

    it('returns a map of the found spotifyIds: (5 / 10)', async () => {
      const NUM_FOUND_TRACKS = 5
      const input: PrePlaylistItem[] = Array(10)
        .fill(0)
        .map((_, i) => ({
          id: `id_${i}`,
          spotifyId: null,
          youtubeTrack: {
            name: `name_${i}`,
            artist: `artist_${i}`,
            year: `year_${i}`,
            link: `link_${i}`,
          },
          spotifyTrack: undefined,
        }))

      const spotifyTracks: spotifyApi.SpotifyTrack[] = input
        .slice(0, NUM_FOUND_TRACKS)
        .map((item, idx) => ({
          id: `id_${idx}`,
          name: `name_${idx}`,
          uri: `uri_${idx}`,
          href: `href_${idx}`,
          artists: [
            {
              name: `artist_${idx}`,
            } as spotifyApi.SpotifyArtist,
          ],
        }))

      input.forEach((item, idx) => {
        const track = spotifyTracks[idx]
        const items = track ? [spotifyTracks[idx]] : []
        findTrackSpy.mockResolvedValueOnce({
          tracks: {
            href: '',
            items,
          },
        })
      })

      const existingMap = new Map()
      loadMapFn.mockReturnValueOnce(existingMap)

      const result = await searchSpotifyTracks(input)

      expect(mapHelperSpy).toBeCalledTimes(1)
      expect(mapHelperSpy).toBeCalledWith(YOUTUBE_ID_MAP_JSON_PATH)
      expect(loadMapFn).toBeCalledTimes(1)
      expect(findTrackSpy).toBeCalledTimes(input.length)
      expect(saveMapFn).toBeCalledTimes(spotifyTracks.length)
      input.forEach((item) => {
        expect(findTrackSpy).toBeCalledWith(item.youtubeTrack)
      })
      spotifyTracks.forEach(() => {
        expect(saveMapFn).toBeCalledWith(existingMap)
      })
      expect(result.size).toBe(NUM_FOUND_TRACKS)
    })

    it('returns a map of the found spotifyIds: (53 / 55)', async () => {
      const NUM_FOUND_TRACKS = 53
      const input: PrePlaylistItem[] = Array(55)
        .fill(0)
        .map((_, i) => ({
          id: `id_${i}`,
          spotifyId: null,
          youtubeTrack: {
            name: `name_${i}`,
            artist: `artist_${i}`,
            year: `year_${i}`,
            link: `link_${i}`,
          },
          spotifyTrack: undefined,
        }))

      const spotifyTracks: spotifyApi.SpotifyTrack[] = input
        .slice(0, NUM_FOUND_TRACKS)
        .map((item, idx) => ({
          id: `id_${idx}`,
          name: `name_${idx}`,
          uri: `uri_${idx}`,
          href: `href_${idx}`,
          artists: [
            {
              name: `artist_${idx}`,
            } as spotifyApi.SpotifyArtist,
          ],
        }))

      input.forEach((item, idx) => {
        const track = spotifyTracks[idx]
        const items = track ? [spotifyTracks[idx]] : []
        findTrackSpy.mockResolvedValueOnce({
          tracks: {
            href: '',
            items,
          },
        })
      })

      const existingMap = new Map()
      loadMapFn.mockReturnValueOnce(existingMap)

      const result = await searchSpotifyTracks(input)

      expect(mapHelperSpy).toBeCalledTimes(1)
      expect(mapHelperSpy).toBeCalledWith(YOUTUBE_ID_MAP_JSON_PATH)
      expect(loadMapFn).toBeCalledTimes(1)
      expect(findTrackSpy).toBeCalledTimes(input.length)
      expect(saveMapFn).toBeCalledTimes(spotifyTracks.length)
      input.forEach((item) => {
        expect(findTrackSpy).toBeCalledWith(item.youtubeTrack)
      })
      spotifyTracks.forEach(() => {
        expect(saveMapFn).toBeCalledWith(existingMap)
      })
      expect(result.size).toBe(NUM_FOUND_TRACKS)
    })

    it('returns a map of the found spotifyIds: (420 / 690)', async () => {
      const NUM_FOUND_TRACKS = 420
      const input: PrePlaylistItem[] = Array(690)
        .fill(0)
        .map((_, i) => ({
          id: `id_${i}`,
          spotifyId: null,
          youtubeTrack: {
            name: `name_${i}`,
            artist: `artist_${i}`,
            year: `year_${i}`,
            link: `link_${i}`,
          },
          spotifyTrack: undefined,
        }))

      const spotifyTracks: spotifyApi.SpotifyTrack[] = input
        .slice(0, NUM_FOUND_TRACKS)
        .map((item, idx) => ({
          id: `id_${idx}`,
          name: `name_${idx}`,
          uri: `uri_${idx}`,
          href: `href_${idx}`,
          artists: [
            {
              name: `artist_${idx}`,
            } as spotifyApi.SpotifyArtist,
          ],
        }))

      input.forEach((item, idx) => {
        const track = spotifyTracks[idx]
        const items = track ? [track] : []
        findTrackSpy.mockResolvedValueOnce({
          tracks: {
            href: '',
            items,
          },
        })
      })

      const existingMap = new Map()
      loadMapFn.mockReturnValueOnce(existingMap)

      const result = await searchSpotifyTracks(input)

      expect(mapHelperSpy).toBeCalledTimes(1)
      expect(mapHelperSpy).toBeCalledWith(YOUTUBE_ID_MAP_JSON_PATH)
      expect(loadMapFn).toBeCalledTimes(1)
      expect(findTrackSpy).toBeCalledTimes(input.length)
      expect(saveMapFn).toBeCalledTimes(spotifyTracks.length)
      input.forEach((item) => {
        expect(findTrackSpy).toBeCalledWith(item.youtubeTrack)
      })
      spotifyTracks.forEach(() => {
        expect(saveMapFn).toBeCalledWith(existingMap)
      })
      expect(result.size).toBe(NUM_FOUND_TRACKS)
    })

    it('can resume progress (420 / 690)', async () => {
      const NUM_FOUND_TRACKS = 420
      const input: PrePlaylistItem[] = Array(690)
        .fill(0)
        .map((_, i) => ({
          id: `id_${i}`,
          spotifyId: null,
          youtubeTrack: {
            name: `name_${i}`,
            artist: `artist_${i}`,
            year: `year_${i}`,
            link: `link_${i}`,
          },
          spotifyTrack: undefined,
        }))

      const spotifyTracks: spotifyApi.SpotifyTrack[] = input
        .slice(0, NUM_FOUND_TRACKS)
        .map((item, idx) => ({
          id: `id_${idx}`,
          name: `name_${idx}`,
          uri: `uri_${idx}`,
          href: `href_${idx}`,
          artists: [
            {
              name: `artist_${idx}`,
            } as spotifyApi.SpotifyArtist,
          ],
        }))

      const numExistingTracks = 123
      input.slice(numExistingTracks).forEach((item, idx) => {
        const track = spotifyTracks[idx + numExistingTracks]
        const items = track ? [track] : []
        findTrackSpy.mockResolvedValueOnce({
          tracks: {
            href: '',
            items,
          },
        })
      })

      const existingMap = new Map<string, TrimSpotifyTrack>(
        spotifyTracks.slice(0, numExistingTracks).map((t, idx) => [
          input[idx].id,
          {
            id: t.id,
            href: t.href,
            uri: t.uri,
            name: t.name,
            artists: t.artists.map((a) => a.name),
          },
        ])
      )
      loadMapFn.mockReturnValueOnce(existingMap)

      const result = await searchSpotifyTracks(input)

      expect(mapHelperSpy).toBeCalledTimes(1)
      expect(mapHelperSpy).toBeCalledWith(YOUTUBE_ID_MAP_JSON_PATH)
      expect(loadMapFn).toBeCalledTimes(1)
      expect(findTrackSpy).toBeCalledTimes(input.length - numExistingTracks)
      expect(saveMapFn).toBeCalledTimes(
        spotifyTracks.length - numExistingTracks
      )
      input.slice(numExistingTracks).forEach((item) => {
        expect(findTrackSpy).toBeCalledWith(item.youtubeTrack)
      })
      spotifyTracks.slice(numExistingTracks).forEach(() => {
        expect(saveMapFn).toBeCalledWith(existingMap)
      })
      expect(result.size).toBe(NUM_FOUND_TRACKS)
    })
  })
})
