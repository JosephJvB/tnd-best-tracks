import {
  FromSpotify,
  FromYoutube,
  preparePlaylistItem,
} from '../tasks/assignSpotifyIds'
import * as spotifyApi from '../spotifyApi'

describe('assignSpotifyIds.ts', () => {
  describe('#preparePlaylistItem', () => {
    const findTrackSpy = jest
      .spyOn(spotifyApi, 'findTrack')
      .mockImplementation(jest.fn())

    it('does not call findTrack when link is open.spotify.com/track', async () => {
      const track = {
        artist: 'Dizzee Rascal',
        name: 'Money Right ft. Skepta',
        link: 'https://open.spotify.com/track/4m08vFKrKbjEklzRIBwllU',
      }
      const year = 2018

      const playlistItem = await preparePlaylistItem(track, year)

      expect(playlistItem.spotifyTrack.uri).toBeDefined()
      expect(playlistItem.spotifyTrack.uri).toBe(
        'spotify:track:4m08vFKrKbjEklzRIBwllU'
      )
      expect((playlistItem.spotifyTrack as FromYoutube).fromYoutube).toBe(true)
      expect(findTrackSpy).toBeCalledTimes(0)
    })

    it('calls findTrack when link is open.spotify.com/album', async () => {
      const track = {
        artist: 'Jessie Ware',
        name: 'Egoista',
        link: 'https://open.spotify.com/album/4EdIYV0iL5DFpA9V4c7pwO',
      }
      const year = 2017

      findTrackSpy.mockResolvedValueOnce({
        tracks: {
          href: '',
          items: [
            {
              uri: 'spotify:track:abc123',
              name: track.name,
              artists: [
                {
                  name: track.artist,
                } as spotifyApi.SpotifyArtist,
              ],
            } as spotifyApi.SpotifyTrack,
          ],
        },
      })

      const playlistItem = await preparePlaylistItem(track, year)

      expect(playlistItem.spotifyTrack.uri).toBeDefined()
      expect(playlistItem.spotifyTrack.uri).toBe('spotify:track:abc123')
      expect((playlistItem.spotifyTrack as FromSpotify).artist).toBe(
        track.artist
      )
      expect((playlistItem.spotifyTrack as FromSpotify).name).toBe(track.name)
      expect(findTrackSpy).toBeCalledTimes(1)
    })
  })
})
