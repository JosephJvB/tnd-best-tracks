import { YoutubeTrack } from '../tasks/extractYoutubeTracks'
import { allocateTracks } from '../tasks/getSpotifyTracks'

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
})
