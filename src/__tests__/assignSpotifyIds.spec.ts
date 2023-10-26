import { preparePlaylistItem } from '../tasks/assignSpotifyIds'
import * as spotifyApi from '../spotifyApi'

describe('assignSpotifyIds.ts', () => {
  describe('#preparePlaylistItem', () => {
    const getTrackSpy = jest
      .spyOn(spotifyApi, 'getTrack')
      .mockImplementation(jest.fn())
    const findTrackSpy = jest
      .spyOn(spotifyApi, 'findTrack')
      .mockImplementation(jest.fn())

    it('calls getTrack when link is open.spotify.com/track', async () => {
      const trackId = '4m08vFKrKbjEklzRIBwllU'
      const youtubeTrack = {
        artist: 'Dizzee Rascal',
        name: 'Money Right ft. Skepta',
        link: `https://open.spotify.com/track/${trackId}`,
      }
      const spotifyTrack = {
        id: trackId,
        artists: [
          {
            name: youtubeTrack.artist,
          } as spotifyApi.SpotifyArtist,
        ],
        name: youtubeTrack.name,
        uri: `spotify:track:${trackId}`,
      } as spotifyApi.SpotifyTrack
      const year = 2018
      getTrackSpy.mockResolvedValueOnce(spotifyTrack)

      const playlistItem = await preparePlaylistItem(youtubeTrack, year)

      expect(playlistItem).toEqual({
        youtubeTrack: youtubeTrack,
        spotifyTrack: {
          uri: spotifyTrack.uri,
          name: spotifyTrack.name,
          artists: spotifyTrack.artists.map((a) => a.name),
        },
      })
      expect(getTrackSpy).toBeCalledTimes(1)
      expect(findTrackSpy).toBeCalledTimes(0)
    })

    it('calls findTrack when link is open.spotify.com/album', async () => {
      const trackId = '4EdIYV0iL5DFpA9V4c7pwO'
      const youtubeTrack = {
        artist: 'Jessie Ware',
        name: 'Egoista',
        link: `https://open.spotify.com/album/${trackId}`,
      }
      const spotifyTrack = {
        id: trackId,
        artists: [
          {
            name: youtubeTrack.artist,
          } as spotifyApi.SpotifyArtist,
        ],
        name: youtubeTrack.name,
        uri: `spotify:track:${trackId}`,
      } as spotifyApi.SpotifyTrack

      const year = 2017

      findTrackSpy.mockResolvedValueOnce({
        tracks: {
          href: '',
          items: [spotifyTrack],
        },
      })

      const playlistItem = await preparePlaylistItem(youtubeTrack, year)

      expect(playlistItem).toEqual({
        youtubeTrack: youtubeTrack,
        spotifyTrack: {
          uri: spotifyTrack.uri,
          name: spotifyTrack.name,
          artists: spotifyTrack.artists.map((a) => a.name),
        },
      })
      expect(getTrackSpy).toBeCalledTimes(0)
      expect(findTrackSpy).toBeCalledTimes(1)
    })
  })
})
