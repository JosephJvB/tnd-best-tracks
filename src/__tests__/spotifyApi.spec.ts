import { SPOTIFY_ID_LENGTH } from '../constants'
import * as spotifyApi from '../spotifyApi'

describe('spotifyApi.ts', () => {
  describe('#extractSpotifyId', () => {
    it('returns null for invalid url', () => {
      const link = 'invalid url here'

      const id = spotifyApi.extractSpotifyId(link, 'track')

      expect(id).toBeNull()
    })

    it('returns null for non-spotify links', () => {
      const link = 'https://www.youtube.com/watch?v=DJs_thSFreI'

      const id = spotifyApi.extractSpotifyId(link, 'track')

      expect(id).toBeNull()
    })

    it('returns null when type does not match', () => {
      const link = 'https://open.spotify.com/track/4m08vFKrKbjEklzRIBwllU'

      const id = spotifyApi.extractSpotifyId(link, 'album')

      expect(id).toBeNull()
    })

    it('can extract spotify trackId', () => {
      const link = 'https://open.spotify.com/track/4m08vFKrKbjEklzRIBwllU'

      let id: null | string = null

      expect(() => {
        id = spotifyApi.extractSpotifyId(link, 'track')
      }).not.toThrow()
      expect(id).not.toBeNull()
      expect((id as unknown as string).length).toBe(SPOTIFY_ID_LENGTH)
    })

    it('can extract spotify albumId', () => {
      const link = 'https://open.spotify.com/album/4m08vFKrKbjEklzRIBwllU'

      let id: null | string = null

      expect(() => {
        id = spotifyApi.extractSpotifyId(link, 'album')
      }).not.toThrow()
      expect(id).not.toBeNull()
      expect((id as unknown as string).length).toBe(SPOTIFY_ID_LENGTH)
    })

    it('can extract spotify trackId with queryParams', () => {
      const link =
        'https://open.spotify.com/track/4m08vFKrKbjEklzRIBwllU?si=123&test=true'

      let id: null | string = null

      expect(() => {
        id = spotifyApi.extractSpotifyId(link, 'track')
      }).not.toThrow()
      expect(id).not.toBeNull()
      expect((id as unknown as string).length).toBe(SPOTIFY_ID_LENGTH)
    })

    it('can extract spotify trackId with pathParams', () => {
      const link =
        'https://open.spotify.com/track/4m08vFKrKbjEklzRIBwllU/some/other/params'

      let id: null | string = null

      expect(() => {
        id = spotifyApi.extractSpotifyId(link, 'track')
      }).not.toThrow()
      expect(id).not.toBeNull()
      expect((id as unknown as string).length).toBe(SPOTIFY_ID_LENGTH)
    })
  })
  describe('#findTrack', () => {
    const processExitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation(jest.fn() as any)
    const findTrackSpy = jest.spyOn(spotifyApi, 'findTrack')
    const normalizeTrackSpy = jest.spyOn(spotifyApi, 'normalizeTrackName')
    const normalizeArtistSpy = jest.spyOn(spotifyApi, 'normalizeArtistName')

    beforeAll(async () => {
      await spotifyApi.setToken()
    })

    describe('can handle ft. in trackname', () => {
      it('can find Denzel Curry__WOO ft. PlayThatBoiZay & Chief Pound__2023', async () => {
        const input = {
          name: 'WOO ft. PlayThatBoiZay & Chief Pound',
          artist: 'Denzel Curry',
          link: 'https://www.youtube.com/watch?v=geVZ6ayvyzY&pp=ygUzRGVuemVsIEN1cnJ5IC0gV09PIGZ0LiBQbGF5VGhhdEJvaVpheSAmIENoaWVmIFBvdW5k',
          year: 2023,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Phoenix__All Eyes on Me ft. BENEE, Chad Hugo & Pusha T__2023', async () => {
        const input = {
          name: 'All Eyes on Me ft. BENEE, Chad Hugo & Pusha T',
          artist: 'Phoenix',
          link: 'https://www.youtube.com/watch?v=zmA7_I_q5e8&pp=ygU3UGhvZW5peCAtIEFsbCBFeWVzIG9uIE1lIGZ0LiBCRU5FRSwgQ2hhZCBIdWdvICYgUHVzaGEgVA%3D%3D',
          year: 2023,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })
    })

    describe('can handle & in artistname', () => {
      it('can find Paul Wall & Termanology__Houston BBQ ft. Bun B__2023', async () => {
        const input = {
          name: 'Houston BBQ ft. Bun B',
          artist: 'Paul Wall & Termanology',
          link: 'https://www.youtube.com/watch?v=wbIXsr0nzPs&pp=ygUuUGF1bCBXYWxsLCBUZXJtYW5vbG9neSAtIEhvdXN0b24gQkJRIGZ0LiBCdW4gQg%3D%3D',
          year: 2023,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it("can find Wiki & Tony Seltzer__That Ain't Pat__2023", async () => {
        const input = {
          name: "That Ain't Pat",
          artist: 'Wiki & Tony Seltzer',
          link: 'https://youtu.be/b_9HBMHK7-s',
          year: 2023,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })
    })

    describe('misc issues', () => {
      it('can find Car Seat Headrest__We Looked Like Giants ( + shoutout to The Beths & Pickle Darling)__2023', async () => {
        const input = {
          name: 'We Looked Like Giants ( + shoutout to The Beths & Pickle Darling)',
          artist: 'Car Seat Headrest',
          link: 'https://www.youtube.com/watch?v=SkSewZhqXG8&pp=ygUpQ2FyIFNlYXQgSGVhZHJlc3QgLSBXZSBMb29rZWQgTGlrZSBHaWFudHM%3D',
          year: 2023,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find clipping.__Wriggle EP__2016', async () => {
        const input = {
          name: 'Wriggle EP',
          artist: 'clipping.',
          link: 'http://www.theneedledrop.com/articles/2016/6/clipping-wriggle',
          year: 2016,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find clipping.__"Baby Don\'t Sleep"__2016', async () => {
        const input = {
          name: '"Baby Don\'t Sleep"',
          artist: 'clipping.',
          link: 'http://www.theneedledrop.com/articles/2016/7/clipping-baby-dont-sleep',
          year: 2016,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Drug Dealer__Easy To Forget ft. Ariel Pink__2016', async () => {
        const input = {
          name: 'Easy To Forget ft. Ariel Pink',
          artist: 'Drug Dealer',
          link: 'http://www.theneedledrop.com/articles/2016/9/drugdealer-easy-to-forget-ft-ariel-pink',
          year: 2016,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find D.R.A.M.__Cash Machine__2016', async () => {
        const input = {
          name: 'Cash Machine',
          artist: 'D.R.A.M.',
          link: 'http://www.theneedledrop.com/articles/2016/9/big-baby-dram-cash-machine',
          year: 2016,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Lil Yachty__Like Wassup ft. K$upreme and BIGBRUTHACHUBBA__2016', async () => {
        const input = {
          name: 'Like Wassup ft. K$upreme and BIGBRUTHACHUBBA',
          artist: 'Lil Yachty',
          link: 'https://youtu.be/4Mvc7W8Hkp0',
          year: 2016,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it("can find ADULT.__They're Just Words ft. Douglas J. McCarthy__2017", async () => {
        const input = {
          name: "They're Just Words ft. Douglas J. McCarthy",
          artist: 'ADULT.',
          link: 'https://www.youtube.com/watch?v=p5HLW4TepBI',
          year: 2017,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it("can find Passion Pit__I'm Perfect__2017", async () => {
        const input = {
          name: "I'm Perfect",
          artist: 'Passion Pit',
          link: 'https://youtu.be/ZSQv0XRfVOk',
          year: 2017,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Parquet Courts__Captive of the Sun (Remix) ft. Bun B__2017', async () => {
        const input = {
          name: 'Captive of the Sun (Remix) ft. Bun B',
          artist: 'Parquet Courts',
          link: 'https://youtu.be/6eeY9scCsYY',
          year: 2017,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it("can find WAVVES__Daisy / You're Welcome__2017", async () => {
        const input = {
          name: "Daisy / You're Welcome",
          artist: 'WAVVES',
          link: 'https://soundcloud.com/ghost-ramp/daisy-single',
          year: 2017,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Los Angeles Police Department__Grown__2017', async () => {
        const input = {
          name: 'Grown',
          artist: 'Los Angeles Police Department',
          link: 'https://youtu.be/s5zfbNiuOyk',
          year: 2017,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it("can find First Aid Kit__You're The Problem Here__2017", async () => {
        const input = {
          name: "You're The Problem Here",
          artist: 'First Aid Kit',
          link: 'https://youtu.be/0esbbnY5Xvw',
          year: 2017,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find WAVVES__No Shade__2017', async () => {
        const input = {
          name: 'No Shade',
          artist: 'WAVVES',
          link: 'https://open.spotify.com/album/7mwIpBo4UBr1JKez0GxoR8',
          year: 2017,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Miya Folick__Touble Adjusting__2017', async () => {
        const input = {
          name: 'Touble Adjusting',
          artist: 'Miya Folick',
          link: 'http://www.theneedledrop.com/articles/2017/5/miya-folick-trouble-adjusting',
          year: 2017,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it("can find Brockhampton__Heat (forgot to mention, sorry. it's fire tho!)__2017", async () => {
        const input = {
          name: "Heat (forgot to mention, sorry. it's fire tho!)",
          artist: 'Brockhampton',
          link: 'https://youtu.be/Jpu0JZxDz-w',
          year: 2017,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Dangermouse__Chase Me ft. Run the Jewels and Big Boi__2017', async () => {
        const input = {
          name: 'Chase Me ft. Run the Jewels and Big Boi',
          artist: 'Dangermouse',
          link: 'http://vevo.ly/d1k64k',
          year: 2017,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find King Gizzard & The Lizard Wizard__The Lord of Lightning Vs. Balrog__2017', async () => {
        const input = {
          name: 'The Lord of Lightning Vs. Balrog',
          artist: 'King Gizzard & The Lizard Wizard',
          link: 'http://www.theneedledrop.com/articles/2017/6/king-gizzard-the-lizard-wizard-the-lord-of-lightning-vs-balrog',
          year: 2017,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find GHOSTEMANE X CLAMS CASINO__KALI YUGA__2017', async () => {
        const input = {
          name: 'KALI YUGA',
          artist: 'GHOSTEMANE X CLAMS CASINO',
          link: 'http://www.adultswim.com/music/singles-2017/3',
          year: 2017,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Bones__SeanPaulWasNeverThereToGiveMeTheLight ft. Danny Brown__2017', async () => {
        const input = {
          name: 'SeanPaulWasNeverThereToGiveMeTheLight ft. Danny Brown',
          artist: 'Bones',
          link: 'http://www.theneedledrop.com/articles/2017/6/bones-seanpaulwasnevertheretogimmethelight-ft-danny-brown',
          year: 2017,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it("can find Alex Cameron__Stanger's Kiss ft. Angel Olsen__2017", async () => {
        const input = {
          name: "Stanger's Kiss ft. Angel Olsen",
          artist: 'Alex Cameron',
          link: 'https://youtu.be/L4C-Lw-YaWg',
          year: 2017,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Courtney Barnett + Kurt Vile__Continental Breakfast__2017', async () => {
        const input = {
          name: 'Continental Breakfast',
          artist: 'Courtney Barnett + Kurt Vile',
          link: 'http://www.theneedledrop.com/articles/2017/10/courtney-barnett-kurt-vile-continental-breakfast',
          year: 2017,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find WESTSIDEDOOM__GORILLA MONSOON__2017', async () => {
        const input = {
          name: 'GORILLA MONSOON',
          artist: 'WESTSIDEDOOM',
          link: 'http://www.theneedledrop.com/articles/2017/10/westsidedoom-gorilla-monsoon',
          year: 2017,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Krallice & Dave Edwardson__Rank Mankind__2017', async () => {
        const input = {
          name: 'Rank Mankind',
          artist: 'Krallice & Dave Edwardson',
          link: 'https://krallice.bandcamp.com/track/rank-mankind',
          year: 2017,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Health x NOLIFE__Hard To Be A God__2017', async () => {
        const input = {
          name: 'Hard To Be A God',
          artist: 'Health x NOLIFE',
          link: 'https://youtu.be/_-XuV_SZYGI',
          year: 2017,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find DMX__Rudolph the Rednose Reindeer__2017', async () => {
        const input = {
          name: 'Rudolph the Rednose Reindeer',
          artist: 'DMX',
          link: 'https://open.spotify.com/album/4pPYffqEe0QKJPf4FEgH2u',
          year: 2017,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Lil Wayne__Bloody Mary ft. Juelz Santana & Big Bad Wolf__2018', async () => {
        const input = {
          name: 'Bloody Mary ft. Juelz Santana & Big Bad Wolf',
          artist: 'Lil Wayne',
          link: 'https://youtu.be/lYATz3STgew',
          year: 2018,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Royce Da 5\'9"__Boblo Boat ft. J. Cole__2018', async () => {
        const input = {
          name: 'Boblo Boat ft. J. Cole',
          artist: 'Royce Da 5\'9"',
          link: 'https://www.youtube.com/watch?v=iwcy5mDDDOU',
          year: 2018,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Lump__May I Be the Light__2018', async () => {
        const input = {
          name: 'May I Be the Light',
          artist: 'Lump',
          link: 'https://youtu.be/2dgOVuYp9SU',
          year: 2018,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Koenji Hyakkei__Dhorimviskha Digest__2018', async () => {
        const input = {
          name: 'Dhorimviskha Digest',
          artist: 'Koenji Hyakkei',
          link: 'https://www.youtube.com/watch?v=9L358RmKgN0&app=desktop',
          year: 2018,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Travis Scott & Young Thug__"Pick Up The Phone" ft. Quavo__2016', async () => {
        const input = {
          name: '"Pick Up The Phone" ft. Quavo',
          artist: 'Travis Scott & Young Thug',
          link: 'https://www.youtube.com/watch?v=__Wt9Rg-M8E',
          year: 2016,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Hot Dad__"Pokémon Go (Poké Don\'t Stop)"__2016', async () => {
        const input = {
          name: '"Pokémon Go (Poké Don\'t Stop)"',
          artist: 'Hot Dad',
          link: 'http://www.theneedledrop.com/articles/2016/7/hot-dad-pokmon-go-pok-dont-stop',
          year: 2016,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Czarface__"Machine, Man & Moster" ft. Conway__2016', async () => {
        const input = {
          name: '"Machine, Man & Moster" ft. Conway',
          artist: 'Czarface',
          link: 'https://youtu.be/2-sG2aZ72wk',
          year: 2016,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find WESTSIDEDOOM__2STINGS prod. The Alchemist__2017', async () => {
        const input = {
          id: 'WESTSIDEDOOM__2STINGS prod. The Alchemist__2017',
          name: '2STINGS prod. The Alchemist',
          artist: 'WESTSIDEDOOM',
          link: 'https://soundcloud.com/user-5212897/westsidedoom-2stings',
          year: 2017,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find YBN Cordae__Old N*ggas__2018', async () => {
        const input = {
          name: 'Old N*ggas',
          artist: 'YBN Cordae',
          link: 'https://www.youtube.com/watch?v=Wngm_Zbp8lo',
          year: 2018,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Bonnie "Prince" Billy__Blueberry Jam__2018', async () => {
        const input = {
          name: 'Blueberry Jam',
          artist: 'Bonnie "Prince" Billy',
          link: 'https://youtu.be/eJf2iY2Kbx0',
          year: 2018,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find FKi 1st__Good Gas ft. 2Chainz & A$AP Ferg__2018', async () => {
        const input = {
          name: 'Good Gas ft. 2Chainz & A$AP Ferg',
          artist: 'FKi 1st',
          link: 'https://youtu.be/VGceCqZL6JQ',
          year: 2018,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find K/DA__POP/STARS (ft. Madison Beer, (G)I-DLE, Jaira Burns)__2018', async () => {
        const input = {
          name: 'POP/STARS (ft. Madison Beer, (G)I-DLE, Jaira Burns)',
          artist: 'K/DA',
          link: 'https://youtu.be/UOxkGD8qRB4',
          year: 2018,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Malibu Ken (Aesop Rock / Tobacco)__Acid King__2018', async () => {
        const input = {
          name: 'Acid King',
          artist: 'Malibu Ken (Aesop Rock / Tobacco)',
          link: 'https://youtu.be/dzieBpafT2o',
          year: 2018,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Chrsitian Scott aTunde Adjuah__Ancestral Recall ft. Saul Williams__2019', async () => {
        const input = {
          name: 'Ancestral Recall ft. Saul Williams',
          artist: 'Chrsitian Scott aTunde Adjuah',
          link: 'https://christianscott.bandcamp.com/track/ancestral-recall-feat-saul-williams-2',
          year: 2019,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Freddie Gibbs & Madlib__Giannis ft Anderson .Paak__2019', async () => {
        const input = {
          name: 'Giannis ft Anderson .Paak',
          artist: 'Freddie Gibbs & Madlib',
          link: 'https://youtu.be/xo8Ls80pi0w',
          year: 2019,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Iglooghost, Kai Whiston, BABii__Lockii__2019', async () => {
        const input = {
          name: 'Lockii',
          artist: 'Iglooghost, Kai Whiston, BABii',
          link: 'https://youtu.be/HvgG-kifQnI',
          year: 2019,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Zac Flewids & Sylvan LaCue__Eyelids__2019', async () => {
        const input = {
          name: 'Eyelids',
          artist: 'Zac Flewids & Sylvan LaCue',
          link: 'https://youtu.be/oaTkJ9GNYJ4',
          year: 2019,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it("can find Bonnie 'Prince' Billy__At the Back of the Pit__2019", async () => {
        const input = {
          name: 'At the Back of the Pit',
          artist: "Bonnie 'Prince' Billy",
          link: 'https://youtu.be/LhMz9pvRNCQ',
          year: 2019,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Disclosure, Aminé & slowthai__My High__2020', async () => {
        const input = {
          name: 'My High',
          artist: 'Disclosure, Aminé & slowthai',
          link: 'https://www.youtube.com/watch?v=LKVazT09YQI',
          year: 2020,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Full of Hell x Health__Full of Health__2020', async () => {
        const input = {
          name: 'Full of Health',
          artist: 'Full of Hell x Health',
          link: 'https://www.youtube.com/watch?v=LVfBAHB_2hw',
          year: 2020,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find J. Cole__The Climb Back__2020', async () => {
        const input = {
          name: 'The Climb Back',
          artist: 'J. Cole',
          link: 'https://www.youtube.com/watch?v=oVaBgcJwkI4',
          year: 2020,
          videoPublishedDate: '2020-07-27T03:59:17Z',
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
        expect(result.tracks.items[0].artists[0].name).toBe('J. Cole')
      })

      it("can find Black Thought & El Michael's Affair__That Girl__2023", async () => {
        const input = {
          name: 'That Girl',
          artist: "Black Thought & El Michael's Affair",
          link: 'https://youtu.be/3lc6nriNBek',
          year: 2023,
          videoPublishedDate: '2023-02-20T23:48:52Z',
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Yung Gravy & bbno$__Off the Goop__2020', async () => {
        const input = {
          name: 'Off the Goop',
          artist: 'Yung Gravy & bbno$',
          link: 'https://youtu.be/c1eQOZPt0gw',
          year: 2020,
          videoPublishedDate: '2020-02-10T04:12:17Z',
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find DJ Shadow & King Gizzard__Black Hot Soup__2022', async () => {
        const input = {
          name: 'Black Hot Soup',
          artist: 'DJ Shadow & King Gizzard',
          link: 'https://www.youtube.com/watch?v=MJkbQLVeFPs',
          year: 2022,
          videoPublishedDate: '2022-01-17T04:34:53Z',
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Moneybagg Yo & Sexyy Redd__Big Dawg__2023', async () => {
        const input = {
          name: 'Big Dawg',
          artist: 'Moneybagg Yo & Sexyy Redd',
          link: 'https://www.youtube.com/watch?v=8VIXb1fxfIE&pp=ygUkTW9uZXliYWdnIFlvICYgU2V4eXkgUmVkZCAtIEJpZyBEYXdn',
          year: 2023,
          videoPublishedDate: '2023-09-25T03:40:43Z',
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it("can find Wet Leg__C'est Comme Ça (Paramore Cover)__2023", async () => {
        const input = {
          name: "C'est Comme Ça (Paramore Cover)",
          artist: 'Wet Leg',
          link: 'https://www.youtube.com/watch?v=c7fbrtPYPOE&pp=ygUqV2V0IExlZyAtIEMnZXN0IENvbW1lIMOHYSAoUGFyYW1vcmUgQ292ZXIp',
          year: 2023,
          videoPublishedDate: '2023-10-09T05:24:47Z',
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Quadeca__SCRAPYARD I__2023', async () => {
        const input = {
          name: 'SCRAPYARD I',
          artist: 'Quadeca',
          link: 'https://www.youtube.com/playlist?list=OLAK5uy_kvgbNUS-YlV2HxlP2ilchPRciHb4I3p-o',
          year: 2023,
          videoPublishedDate: '2023-10-16T07:33:42Z',
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })
    })

    describe.skip('songs are not on spotify!', () => {
      it('can find clairo__Lavender__2023', async () => {
        const input = {
          name: 'Lavender',
          artist: 'clairo',
          link: 'https://clairecottrill.bandcamp.com/track/lavender',
          year: 2023,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find The Avalanches__Bad Day ft. Freddie Gibbs__2017', async () => {
        const input = {
          name: 'Bad Day ft. Freddie Gibbs',
          artist: 'The Avalanches',
          link: 'https://www.youtube.com/watch?v=QY4r_MfGR94',
          year: 2017,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Ariel Pink & Weyes Blood__Tears On Fire__2017', async () => {
        const input = {
          name: 'Tears On Fire',
          artist: 'Ariel Pink & Weyes Blood',
          link: 'https://youtu.be/Wl5nG5DA2Is',
          year: 2017,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Young Thug__WTF You Doin ft. Quavo, Duke & Rich the Kid__2017', async () => {
        const input = {
          name: 'WTF You Doin ft. Quavo, Duke & Rich the Kid',
          artist: 'Young Thug',
          link: 'https://soundcloud.com/digital-trapstars/young-thug-quavo-duke-rich-the-kid-wtf-you-doin-prod-dj-durel',
          year: 2017,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find James Ferraro__Twilight Pretender (I forgot to mention it!)__2017', async () => {
        const input = {
          name: 'Twilight Pretender (I forgot to mention it!)',
          artist: 'James Ferraro',
          link: 'http://www.theneedledrop.com/articles/2017/8/james-ferraro-twilight-pretender-',
          year: 2017,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Classixx__Possessive__2017', async () => {
        const input = {
          name: 'Possessive',
          artist: 'Classixx',
          link: 'https://soundcloud.com/classixx/possessive',
          year: 2017,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find IGLOOGHOST__ᴗ ˳ ᴗ Snoring (Music to Sleep To)__2016', async () => {
        const input = {
          name: 'ᴗ ˳ ᴗ Snoring (Music to Sleep To)',
          artist: 'IGLOOGHOST',
          link: 'http://www.theneedledrop.com/articles/2016/7/iglooghost-snoring-music-to-sleep-to',
          year: 2016,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })
    })

    describe.skip('on spotify, but shadowbanned from search results?', () => {
      it('can find PWR BTTM__Answer My Text__2017', async () => {
        const input = {
          name: 'Answer My Text',
          artist: 'PWR BTTM',
          link: 'https://youtu.be/TlNHAkXDS10',
          year: 2017,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Kirin J Callinan__S.A.D__2017', async () => {
        const input = {
          name: 'S.A.D',
          artist: 'Kirin J Callinan',
          link: 'http://www.theneedledrop.com/articles/2017/5/kirin-j-callinan-sad',
          year: 2017,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })

      it('can find Zomby__ZKITTLES__2017', async () => {
        const input = {
          name: 'ZKITTLES',
          artist: 'Zomby',
          link: 'https://youtu.be/ZFnPbAzNLSk',
          year: 2017,
        }

        const result = await spotifyApi.findTrack(input)

        expect(processExitSpy).toBeCalledTimes(0)
        expect(findTrackSpy).toBeCalledTimes(2)
        expect(normalizeTrackSpy).toBeCalledTimes(1)
        expect(normalizeArtistSpy).toBeCalledTimes(1)
        expect(result.tracks.items.length).toBeGreaterThan(0)
      })
    })
  })
})
