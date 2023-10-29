import fs from 'fs'
import getSpotifyTracks, {
  batchGetById,
  searchSpotifyTracks,
  PrePlaylistItem,
  TrimSpotifyTrack,
} from '../tasks/getSpotifyTracks'
import * as spotifyApi from '../spotifyApi'
import * as mapUtil from '../mapUtil'
import {
  SPOTIFY_TRACKS_JSON_PATH,
  SPOTIFY_TRACK_ID_MAP_JSON_PATH,
  YOUTUBE_ID_MAP_JSON_PATH,
} from '../constants'
import { YoutubeTrack } from '../tasks/extractYoutubeTracks'

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
  const findTrackSpy = jest
    .spyOn(spotifyApi, 'findTrack')
    .mockImplementation(jest.fn())
  const getTracksSpy = jest
    .spyOn(spotifyApi, 'getTracks')
    .mockImplementation(jest.fn())
  describe('#batchGetById', () => {
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
      expect(saveMapFn).toBeCalledTimes(
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
            year: i,
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
            year: i,
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
            year: i,
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
            year: i,
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

  describe('#getSpotifyTracks', () => {
    const setTokenSpy = jest
      .spyOn(spotifyApi, 'setToken')
      .mockImplementation(jest.fn())
    const extractIdSpy = jest
      .spyOn(spotifyApi, 'extractSpotifyId')
      .mockImplementation(jest.fn())

    it('works when all spotify tracks are found as expected', async () => {
      const readFileSpy = jest
        .spyOn(fs, 'readFileSync')
        .mockImplementation(jest.fn())
      const writeFileSpy = jest
        .spyOn(fs, 'writeFileSync')
        .mockImplementation(jest.fn())

      const NUM_FOUND_TRACKS = 100
      const NUM_BY_BATCH = 55
      const input: YoutubeTrack[] = Array(100)
        .fill(0)
        .map((_, idx) => ({
          artist: `artist_${idx}`,
          name: `name_${idx}`,
          link: `link_${idx}`,
          year: idx,
        }))
      const spotifyTracks: spotifyApi.SpotifyTrack[] = input
        .slice(0, NUM_FOUND_TRACKS)
        .map((track, idx) => ({
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

      readFileSpy.mockReturnValueOnce(JSON.stringify(input))

      for (let i = 0; i < input.length; i++) {
        const id = i < NUM_BY_BATCH ? spotifyTracks[i].id : null
        extractIdSpy.mockReturnValueOnce(id)
      }

      const trackIdMap = new Map()
      const youtubeIdMap = new Map()
      loadMapFn.mockReturnValueOnce(trackIdMap)
      loadMapFn.mockReturnValueOnce(youtubeIdMap)

      for (let i = 0; i < NUM_BY_BATCH; i += 50) {
        const upper = Math.min(NUM_BY_BATCH, i + 50)
        getTracksSpy.mockResolvedValueOnce({
          tracks: spotifyTracks.slice(i, upper),
        })
      }
      for (let i = NUM_BY_BATCH; i < input.length; i++) {
        const track = spotifyTracks[i]
        const items = track ? [track] : []
        findTrackSpy.mockResolvedValueOnce({
          tracks: {
            href: '',
            items,
          },
        })
      }

      await getSpotifyTracks()

      expect(setTokenSpy).toBeCalledTimes(1)
      expect(extractIdSpy).toBeCalledTimes(input.length)
      for (const i of input) {
        expect(extractIdSpy).toBeCalledWith(i.link, 'track')
      }
      expect(mapHelperSpy).toBeCalledTimes(2)
      expect(loadMapFn).toBeCalledTimes(2)
      expect(getTracksSpy).toBeCalledTimes(2)
      for (let i = 0; i < NUM_BY_BATCH; i += 50) {
        expect(getTracksSpy).toBeCalledWith(
          input.slice(i, i + 50).map((t, idx) => spotifyTracks[idx].id)
        )
      }
      expect(saveMapFn).toBeCalledTimes(
        Math.ceil(NUM_BY_BATCH / 50) + input.length - NUM_BY_BATCH
      )
      expect(saveMapFn).toBeCalledWith(trackIdMap)
      expect(findTrackSpy).toBeCalledTimes(input.length - NUM_BY_BATCH)
      input.slice(NUM_BY_BATCH).forEach((i) => {
        expect(findTrackSpy).toBeCalledWith(i)
      })
      expect(saveMapFn).toBeCalledWith(youtubeIdMap)
      expect(writeFileSpy).toBeCalledTimes(1)
      expect(writeFileSpy.mock.calls[0][0]).toBe(SPOTIFY_TRACKS_JSON_PATH)
      const expectedPayload = input.map((i, idx) => ({
        id: [i.artist, i.name, i.year].join('__'),
        youtubeTrack: i,
        spotifyId: idx < NUM_BY_BATCH ? spotifyTracks[idx].id : null,
        spotifyTrack: {
          id: spotifyTracks[idx].id,
          uri: spotifyTracks[idx].uri,
          name: spotifyTracks[idx].name,
          artists: spotifyTracks[idx].artists.map((a) => a.name),
        },
      }))
      const writeFilePayload = JSON.parse(
        writeFileSpy.mock.calls[0][1].toString()
      )
      expect(writeFilePayload).toEqual(expectedPayload)
    })

    it('tracks missed by batch are found by single search', async () => {
      const readFileSpy = jest
        .spyOn(fs, 'readFileSync')
        .mockImplementation(jest.fn())
      const writeFileSpy = jest
        .spyOn(fs, 'writeFileSync')
        .mockImplementation(jest.fn())

      const NUM_FOUND_TRACKS = 100
      const NUM_GET_BY_BATCH = 55
      const NUM_MISSED_BY_BATCH = 15
      const NUM_FOUND_BY_BATCH = NUM_GET_BY_BATCH - NUM_MISSED_BY_BATCH
      const input: YoutubeTrack[] = Array(100)
        .fill(0)
        .map((_, idx) => ({
          artist: `artist_${idx}`,
          name: `name_${idx}`,
          link: `link_${idx}`,
          year: idx,
        }))
      const spotifyTracks: spotifyApi.SpotifyTrack[] = input
        .slice(0, NUM_FOUND_TRACKS)
        .map((track, idx) => ({
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

      readFileSpy.mockReturnValueOnce(JSON.stringify(input))

      for (let i = 0; i < input.length; i++) {
        const id = i < NUM_GET_BY_BATCH ? spotifyTracks[i].id : null
        extractIdSpy.mockReturnValueOnce(id)
      }

      const trackIdMap = new Map()
      const youtubeIdMap = new Map()
      loadMapFn.mockReturnValueOnce(trackIdMap)
      loadMapFn.mockReturnValueOnce(youtubeIdMap)

      for (let i = 0; i < NUM_GET_BY_BATCH; i += 50) {
        const upper = Math.min(NUM_FOUND_BY_BATCH, i + 50)
        getTracksSpy.mockResolvedValueOnce({
          tracks: spotifyTracks.slice(i, upper),
        })
      }
      for (let i = NUM_FOUND_BY_BATCH; i < input.length; i++) {
        const track = spotifyTracks[i]
        const items = track ? [track] : []
        findTrackSpy.mockResolvedValueOnce({
          tracks: {
            href: '',
            items,
          },
        })
      }

      await getSpotifyTracks()

      expect(setTokenSpy).toBeCalledTimes(1)
      expect(extractIdSpy).toBeCalledTimes(input.length)
      for (const i of input) {
        expect(extractIdSpy).toBeCalledWith(i.link, 'track')
      }
      expect(mapHelperSpy).toBeCalledTimes(2)
      expect(loadMapFn).toBeCalledTimes(2)
      expect(getTracksSpy).toBeCalledTimes(2)
      for (let i = 0; i < NUM_GET_BY_BATCH; i += 50) {
        expect(getTracksSpy).toBeCalledWith(
          input.slice(i, i + 50).map((t, idx) => spotifyTracks[idx].id)
        )
      }
      expect(saveMapFn).toBeCalledTimes(
        Math.ceil(NUM_GET_BY_BATCH / 50) + input.length - NUM_FOUND_BY_BATCH
      )
      expect(saveMapFn).toBeCalledWith(trackIdMap)
      expect(findTrackSpy).toBeCalledTimes(input.length - NUM_FOUND_BY_BATCH)
      input.slice(NUM_GET_BY_BATCH).forEach((i) => {
        expect(findTrackSpy).toBeCalledWith(i)
      })
      expect(saveMapFn).toBeCalledWith(youtubeIdMap)
      expect(writeFileSpy).toBeCalledTimes(1)
      expect(writeFileSpy.mock.calls[0][0]).toBe(SPOTIFY_TRACKS_JSON_PATH)
      const expectedPayload = input.map((i, idx) => ({
        id: [i.artist, i.name, i.year].join('__'),
        youtubeTrack: i,
        spotifyId: idx < NUM_GET_BY_BATCH ? spotifyTracks[idx].id : null,
        spotifyTrack: {
          id: spotifyTracks[idx].id,
          uri: spotifyTracks[idx].uri,
          name: spotifyTracks[idx].name,
          artists: spotifyTracks[idx].artists.map((a) => a.name),
        },
      }))
      const writeFilePayload = JSON.parse(
        writeFileSpy.mock.calls[0][1].toString()
      )
      expect(writeFilePayload).toEqual(expectedPayload)
    })
  })
})
