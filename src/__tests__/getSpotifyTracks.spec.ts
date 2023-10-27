import * as spotifyApi from '../spotifyApi'
import { PrePlaylistItem, tryAssignByGet } from '../tasks/getSpotifyTracks'

describe('getSpotifyTracks.ts', () => {
  describe('#tryAssignByGet', () => {
    const getTracksSpy = jest.spyOn(spotifyApi, 'getTracks')
    const saveFn = jest.fn()

    it('tries to add spotifyTracks by trackId', async () => {
      const spotifyTracks = Array(10)
        .fill(0)
        .map((_, i) => ({
          id: `id_${i}`,
          href: `href_${i}`,
          name: `name_${i}`,
          artists: [
            {
              name: `artist_${i}`,
            },
          ] as spotifyApi.SpotifyArtist[],
          uri: `spotify:track:id_${i}`,
        }))

      const items = Array(20)
        .fill(0)
        .map((_, i) => ({
          idx: i,
          spotifyId: spotifyTracks[i] ? spotifyTracks[i].id : undefined,
          spotifyTrack: undefined,
          youtubeTrack: {
            name: `name_${i}`,
            artist: `artist_${i}`,
            link: `link_${i}`,
          },
        })) as PrePlaylistItem[]

      getTracksSpy.mockResolvedValueOnce({
        tracks: spotifyTracks,
      })

      await tryAssignByGet(items, saveFn)

      expect(getTracksSpy).toBeCalledTimes(1)
      expect(getTracksSpy).toHaveBeenNthCalledWith(
        1,
        spotifyTracks.map((i) => i.id)
      )
      expect(saveFn).toBeCalledTimes(1)
      const firstCall = items.map((i, idx) => ({
        ...i,
        spotifyTrack: spotifyTracks[idx]
          ? {
              id: spotifyTracks[idx].id,
              uri: spotifyTracks[idx].uri,
              name: spotifyTracks[idx].name,
              artists: spotifyTracks[idx].artists.map((a) => a.name),
            }
          : undefined,
      }))
      expect(saveFn).toHaveBeenNthCalledWith(1, firstCall)
    })

    it('adds in batches of 50', async () => {
      const spotifyTracks = Array(55)
        .fill(0)
        .map((_, i) => ({
          id: `id_${i}`,
          href: `href_${i}`,
          name: `name_${i}`,
          artists: [
            {
              name: `artist_${i}`,
            },
          ] as spotifyApi.SpotifyArtist[],
          uri: `spotify:track:id_${i}`,
        }))

      const items = Array(60)
        .fill(0)
        .map((_, i) => ({
          idx: i,
          spotifyId: spotifyTracks[i] ? spotifyTracks[i].id : undefined,
          spotifyTrack: undefined,
          youtubeTrack: {
            name: `name_${i}`,
            artist: `artist_${i}`,
            link: `link_${i}`,
          },
        })) as PrePlaylistItem[]

      getTracksSpy
        .mockResolvedValueOnce({
          tracks: spotifyTracks.slice(0, 50),
        })
        .mockResolvedValueOnce({
          tracks: spotifyTracks.slice(50),
        })

      await tryAssignByGet(items, saveFn)

      expect(getTracksSpy).toBeCalledTimes(2)
      expect(getTracksSpy).toHaveBeenNthCalledWith(
        1,
        spotifyTracks.slice(0, 50).map((i) => i.id)
      )
      expect(getTracksSpy).toHaveBeenNthCalledWith(
        2,
        spotifyTracks.slice(50).map((i) => i.id)
      )
      expect(saveFn).toBeCalledTimes(2)
      // const firstCall = items.map((i, idx) => ({
      //   ...i,
      //   spotifyTrack:
      //     idx < 50
      //       ? {
      //           id: spotifyTracks[idx].id,
      //           uri: spotifyTracks[idx].uri,
      //           name: spotifyTracks[idx].name,
      //           artists: spotifyTracks[idx].artists.map((a) => a.name),
      //         }
      //       : undefined,
      // }))
      // currently both calls are the same!
      // https://github.com/jestjs/jest/issues/7950
      // expect(saveFn.mock.calls[0][0]).toEqual(saveFn.mock.calls[1][0])
      // expect(saveFn).toHaveBeenNthCalledWith(1, firstCall)
      const secondCall = items.map((i, idx) => ({
        ...i,
        spotifyTrack: spotifyTracks[idx]
          ? {
              id: spotifyTracks[idx].id,
              uri: spotifyTracks[idx].uri,
              name: spotifyTracks[idx].name,
              artists: spotifyTracks[idx].artists.map((a) => a.name),
            }
          : undefined,
      }))
      expect(saveFn).toHaveBeenNthCalledWith(2, secondCall)
    })
  })
})
