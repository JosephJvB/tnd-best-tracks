import * as spotifyApi from '../spotifyApi'
import { YoutubeTrack } from '../tasks/extractYoutubeTracks'
import {
  YoutubeTrackWithId,
  allocateTracks,
  handleBatchGet,
  handleSingleSearch,
} from '../tasks/getSpotifyTracks'

describe('getSpotifyTracks.ts', () => {
  describe('#allocateTracks', () => {
    it('separates tracks correctly based on track.link', () => {
      const input = [
        {
          link: 'https://open.spotify.com/album/4EdIYV0iL5DFpA9V4c7pwO',
        },
        {
          link: 'https://open.spotify.com/track/4m08vFKrKbjEklzRIBwllU',
        },
        {
          link: 'https://youtu.be/7iS0fawNZZ0',
        },
        {
          link: 'invalid url',
        },
      ] as YoutubeTrack[]

      const { toGet, toSearch } = allocateTracks(input)

      expect(toGet.length).toBe(1)
      expect(toSearch.length).toBe(3)
    })
  })

  describe('#handleBatchGet', () => {
    const getTracksSpy = jest.spyOn(spotifyApi, 'getTracks')
    const saveFn = jest.fn()

    it('combines youtube and spotify tracks by trackId', async () => {
      const youtubeTracks = [
        {
          trackId: 'id_0',
        },
      ] as YoutubeTrackWithId[]

      const spotifyTracks = youtubeTracks.map((t, i) => ({
        id: t.trackId,
        href: '',
        name: `name_${i}`,
        artists: [
          {
            name: `artist_${i}`,
          },
        ] as spotifyApi.SpotifyArtist[],
        uri: `spotify:track:${t.trackId}`,
      }))

      const combined = youtubeTracks.map((yt, i) => ({
        youtubeTrack: yt,
        spotifyTrack: {
          id: spotifyTracks[i].id,
          name: spotifyTracks[i].name,
          uri: spotifyTracks[i].uri,
          artists: spotifyTracks[i].artists.map((a) => a.name),
        },
      }))

      getTracksSpy.mockResolvedValueOnce({
        tracks: spotifyTracks,
      })

      await handleBatchGet(youtubeTracks, saveFn)

      expect(getTracksSpy).toBeCalledTimes(1)
      expect(getTracksSpy).toBeCalledWith(youtubeTracks.map((t) => t.trackId))
      expect(saveFn).toBeCalledTimes(1)
      expect(saveFn).toBeCalledWith(combined)
    })

    it('combines in batches of 50', async () => {
      const youtubeTracks = Array(55)
        .fill(0)
        .map((_, i) => ({
          trackId: `id_${i}`,
        })) as YoutubeTrackWithId[]

      const spotifyTracks = youtubeTracks.map((t, i) => ({
        id: t.trackId,
        href: `href_${i}`,
        name: `name_${i}`,
        artists: [
          {
            name: `artist_${i}`,
          },
        ] as spotifyApi.SpotifyArtist[],
        uri: `spotify:track:${t.trackId}`,
      }))

      const combined = youtubeTracks.map((yt, i) => ({
        youtubeTrack: yt,
        spotifyTrack: {
          id: spotifyTracks[i].id,
          name: spotifyTracks[i].name,
          uri: spotifyTracks[i].uri,
          artists: spotifyTracks[i].artists.map((a) => a.name),
        },
      }))

      getTracksSpy.mockResolvedValueOnce({
        tracks: spotifyTracks.slice(0, 50),
      })
      getTracksSpy.mockResolvedValueOnce({
        tracks: spotifyTracks.slice(50),
      })

      await handleBatchGet(youtubeTracks, saveFn)

      expect(getTracksSpy).toBeCalledTimes(2)
      expect(getTracksSpy).toHaveBeenNthCalledWith(
        1,
        youtubeTracks.slice(0, 50).map((t) => t.trackId)
      )
      expect(getTracksSpy).toHaveBeenNthCalledWith(
        2,
        youtubeTracks.slice(50).map((t) => t.trackId)
      )
      expect(saveFn).toBeCalledTimes(2)
      expect(saveFn).toHaveBeenNthCalledWith(1, combined.slice(0, 50))
      expect(saveFn).toHaveBeenNthCalledWith(2, combined.slice(50))
    })

    it('returns items with spotifyTrack undefined if not found', async () => {
      const youtubeTracks = Array(5)
        .fill(0)
        .map((_, i) => ({
          trackId: `id_${i}`,
        })) as YoutubeTrackWithId[]

      const spotifyTracks = youtubeTracks
        .map((t, i) => ({
          id: t.trackId,
          href: `href_${i}`,
          name: `name_${i}`,
          artists: [
            {
              name: `artist_${i}`,
            },
          ] as spotifyApi.SpotifyArtist[],
          uri: `spotify:track:${t.trackId}`,
        }))
        .slice(0, 3)

      const combined = youtubeTracks.map((yt, i) => ({
        youtubeTrack: yt,
        spotifyTrack: spotifyTracks[i]
          ? {
              id: spotifyTracks[i].id,
              name: spotifyTracks[i].name,
              uri: spotifyTracks[i].uri,
              artists: spotifyTracks[i].artists.map((a) => a.name),
            }
          : undefined,
      }))

      getTracksSpy.mockResolvedValueOnce({
        tracks: spotifyTracks,
      })

      await handleBatchGet(youtubeTracks, saveFn)

      expect(getTracksSpy).toBeCalledTimes(1)
      expect(getTracksSpy).toHaveBeenNthCalledWith(
        1,
        youtubeTracks.map((t) => t.trackId)
      )
      expect(saveFn).toBeCalledTimes(1)
      expect(saveFn).toHaveBeenNthCalledWith(1, combined)
    })
  })

  describe('#handleSingleSearch', () => {
    const findTrackSpy = jest.spyOn(spotifyApi, 'findTrack')
    const saveFn = jest.fn()

    it('combines youtube and spotify tracks by trackId', async () => {
      const year = 2020
      const youtubeTracks = Array(5)
        .fill(0)
        .map((_, i) => ({
          trackId: `id_${i}`,
        })) as YoutubeTrackWithId[]

      const spotifyTracks = youtubeTracks.map((t, i) => ({
        id: t.trackId,
        href: `href_${i}`,
        name: `name_${i}`,
        artists: [
          {
            name: `artist_${i}`,
          },
        ] as spotifyApi.SpotifyArtist[],
        uri: `spotify:track:${t.trackId}`,
      }))

      const combined = youtubeTracks.map((yt, i) => ({
        youtubeTrack: yt,
        spotifyTrack: {
          id: spotifyTracks[i].id,
          name: spotifyTracks[i].name,
          uri: spotifyTracks[i].uri,
          artists: spotifyTracks[i].artists.map((a) => a.name),
        },
      }))

      youtubeTracks.forEach((_, i) => {
        const t = spotifyTracks[i]
        findTrackSpy.mockResolvedValueOnce({
          tracks: {
            href: '',
            items: [
              {
                href: '',
                id: t.id,
                name: t.name,
                uri: t.uri,
                artists: t.artists,
              },
            ],
          },
        })
      })

      await handleSingleSearch(youtubeTracks, year, saveFn)

      expect(findTrackSpy).toBeCalledTimes(5)
      expect(findTrackSpy.mock.calls).toEqual(
        youtubeTracks.map((t) => [t, year])
      )
      expect(saveFn).toBeCalledTimes(5)
      expect(saveFn.mock.calls).toEqual(combined.map((c) => [[c]]))
    })

    it('returns items with spotifyTrack undefined if not found', async () => {
      const year = 2020
      const youtubeTracks = Array(5)
        .fill(0)
        .map((_, i) => ({
          trackId: `id_${i}`,
        })) as YoutubeTrackWithId[]

      const spotifyTracks = youtubeTracks
        .map((t, i) => ({
          id: t.trackId,
          href: `href_${i}`,
          name: `name_${i}`,
          artists: [
            {
              name: `artist_${i}`,
            },
          ] as spotifyApi.SpotifyArtist[],
          uri: `spotify:track:${t.trackId}`,
        }))
        .slice(0, 3)

      const combined = youtubeTracks.map((yt, i) => ({
        youtubeTrack: yt,
        spotifyTrack: spotifyTracks[i]
          ? {
              id: spotifyTracks[i].id,
              name: spotifyTracks[i].name,
              uri: spotifyTracks[i].uri,
              artists: spotifyTracks[i].artists.map((a) => a.name),
            }
          : undefined,
      }))

      youtubeTracks.forEach((_, i) => {
        const t = spotifyTracks[i]
        findTrackSpy.mockResolvedValueOnce({
          tracks: {
            href: '',
            items: t
              ? [
                  {
                    href: '',
                    id: t.id,
                    name: t.name,
                    uri: t.uri,
                    artists: t.artists,
                  },
                ]
              : [],
          },
        })
      })

      await handleSingleSearch(youtubeTracks, year, saveFn)

      expect(findTrackSpy).toBeCalledTimes(5)
      expect(findTrackSpy.mock.calls).toEqual(
        youtubeTracks.map((t) => [t, year])
      )
      expect(saveFn).toBeCalledTimes(5)
      expect(saveFn.mock.calls).toEqual(combined.map((c) => [[c]]))
    })
  })
})
