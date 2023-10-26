import { extractTrackList_v2 } from '../tasks/extractBestTracks'
import { PlaylistItem } from '../youtubeApi'

describe('extractBestTracks.ts', () => {
  describe('#extractTrackList_v2', () => {
    // const consoleErrorSpy = jest
    //   .spyOn(console, 'error')
    //   .mockImplementation(jest.fn())

    it('skips non-needledrop videos', () => {
      const item = {
        snippet: {
          channelId: 'tony',
          videoOwnerChannelId: 'not-tony',
        },
      } as PlaylistItem

      const result = extractTrackList_v2(item)

      expect(result.length).toBe(0)
    })

    it('skips private videos', () => {
      const item = {
        snippet: {
          channelId: 'tony',
          videoOwnerChannelId: 'tony',
        },
        status: {
          privacyStatus: 'private',
        },
      } as PlaylistItem

      const result = extractTrackList_v2(item)

      expect(result.length).toBe(0)
    })

    it('skips raw review videos', () => {
      const item = {
        snippet: {
          channelId: 'tony',
          videoOwnerChannelId: 'tony',
          title: 'Gucci Mane & Metro Boomin - Drop Top Wop MIXTAPE REVIEW',
        },
        status: {
          privacyStatus: 'public',
        },
      } as PlaylistItem

      const result = extractTrackList_v2(item)

      expect(result.length).toBe(0)
    })

    it('can parse last item', () => {
      const item = {
        id: 'UExQNENTZ2w3Szdvcjg0QUFocjd6bExOcGdoRW5LV3UyYy4xNEMzREYwQzc3REUwNDY0',
        snippet: {
          channelId: 'tony',
          videoOwnerChannelId: 'tony',
          publishedAt: '2023-10-23T04:48:40Z',
          title:
            'Danny Brown, Sampha, The Kid LAROI, Charli XCX | Weekly Track Roundup: 10/22/23',
          description:
            "2023 FAV TRACKS PLAYLIST: https://music.apple.com/us/playlist/my-fav-singles-of-2023/pl.u-mJjJTyKgxEy\n\nTND Patreon: https://www.patreon.com/theneedledrop\n\nTurntable Lab link: http://turntablelab.com/theneedledrop\n\n\n!!!BEST TRACKS THIS WEEK!!!\n\nKali Uchis - Te Mata\nhttps://www.youtube.com/watch?v=PVx4TQoIc-o&pp=ygUUS2FsaSBVY2hpcyAtIFRlIE1hdGE%3D\n\nDanny Brown - Tantor\nhttps://youtu.be/r9n7-22clP0?si=C2Cx1xRQ7NSDqXhw\nReview: https://www.youtube.com/watch?v=4MnmUWDx2b0\n\nNicolas Jaar & Ali Sethi - Nazar Se\nhttps://www.youtube.com/watch?v=AWh9mC3l-m0&pp=ygUjTmljb2xhcyBKYWFyICYgQWxpIFNldGhpIC0gTmF6YXIgU2U%3D\n\nIDLES - Dancer ft. LCD Soundsystem\nhttps://www.youtube.com/watch?v=A3ZZj5y6Qt4&pp=ygUgSWRsZXMgJiBMQ0QgU291bmRzeXN0ZW0gLSBEYW5jZXI%3D\n\nCaroline Polachek - Dang\nhttps://www.youtube.com/watch?v=UX5ahM24o8A&pp=ygUYQ2Fyb2xpbmUgUG9sYWNoZWsgLSBEYW5n\n\nAna Frango Elétrico - Boy of Stranger Things\nhttps://www.youtube.com/watch?v=cyOgrfXRaMo&pp=ygUtQW5hIEZyYW5nbyBFbMOpdHJpY28gLSBCb3kgb2YgU3RyYW5nZXIgVGhpbmdz\n\nbeabadoobee & Laufey - A Night to Remember\nhttps://www.youtube.com/watch?v=k0optPS9qrA&pp=ygUqYmVhYmFkb29iZWUgJiBMYXVmZXkgLSBBIE5pZ2h0IHRvIFJlbWVtYmVy\n\nJockstrap & Taylor Skye - Good Girl\nhttps://www.youtube.com/watch?v=AraqJiF6ozM&pp=ygUVSm9ja3N0cmFwIC0gR29vZCBHaXJs\n\nSampha - Dancing Circles\nhttps://www.youtube.com/watch?v=UhE5io7Nyk4&pp=ygUYU2FtcGhhIC0gRGFuY2luZyBDaXJjbGVz\n\nMaruja - One Hand Behind the Devil\nhttps://www.youtube.com/watch?v=WuGuXBPvvmQ&pp=ygUiTWFydWphIC0gT25lIEhhbmQgQmVoaW5kIHRoZSBEZXZpbA%3D%3D\n\nImperial Triumphant - Motorbreath (Metallica Cover)\nhttps://www.youtube.com/watch?v=D31DHDeGtaU&pp=ygUhSW1wZXJpYWwgVHJpdW1waGFudCAtIE1vdG9yYnJlYXRo\n\nFloating Points - Birth4000\nhttps://www.youtube.com/watch?v=MWLpR6Fsc6Q&pp=ygUbRmxvYXRpbmcgUG9pbnRzIC0gQmlydGg0MDAw\n\nKurt Vile - Another good year for the roses\nhttps://www.youtube.com/watch?v=c7ICRtoiFrw&pp=ygUrS3VydCBWaWxlIC0gQW5vdGhlciBnb29kIHllYXIgZm9yIHRoZSByb3Nlcw%3D%3D\n\nclairo - Lavender\nhttps://clairecottrill.bandcamp.com/track/lavender\n\nFrost Children - Stare at the Sun\nhttps://youtu.be/DM4WkKDWlaE\n\n\n…meh…\n\nMannequin Pussy - I Don’t Know You\nhttps://www.youtube.com/watch?v=A4OYERIEpYA&pp=ygUkTWFubmVxdWluIFB1c3N5IC0gSSBEb27igJl0IEtub3cgWW91\n\nBADBADNOTGOOD & Charlotte Day Wilson - Sleeper\nhttps://youtu.be/7iS0fawNZZ0\n\nThe Kid LAROI, Jung Kook, Central Cee - Too Much\nhttps://www.youtube.com/watch?v=83Lv790h79k&pp=ygUwVGhlIEtpZCBMQVJPSSwgSnVuZyBLb29rLCBDZW50cmFsIENlZSAtIFRvbyBNdWNo\n\nEvian Christ - Yxguden ft. Bladee\nhttps://www.youtube.com/watch?v=xSV3M3lFv58&pp=ygUhRXZpYW4gQ2hyaXN0IC0gWXhndWRlbiBmdC4gQmxhZGVl\n\nKevin Abstract - What Should I Do?\nhttps://www.youtube.com/watch?v=eKXC_6h4XXo&pp=ygUiS2V2aW4gQWJzdHJhY3QgLSBXaGF0IFNob3VsZCBJIERvPw%3D%3D\n\nRachel Chinouriri - The Hills\nhttps://www.youtube.com/watch?v=G5lKmUw_Vxs&pp=ygUdUmFjaGVsIENoaW5vdXJpcmkgLSBUaGUgSGlsbHM%3D\n\n2 Chainz & Lil Wayne - Presha\nhttps://www.youtube.com/watch?v=0Mmv28qrObA&pp=ygUdMiBDaGFpbnogJiBMaWwgV2F5bmUgLSBQcmVzaGE%3D\n\nWu-Tang Clan - Claudine ft Ghostface Killah, Mathematics & Nicole Bus\nhttps://www.youtube.com/watch?v=QcStXEtngz8&pp=ygVFV3UtVGFuZyBDbGFuIC0gQ2xhd2RpbmUgZnQgR2hvc3RmYWNlIEtpbGxhaCwgTWF0aGVtYXRpY3MgJiBOaWNvbGUgQnVz\n\nRick Ross & Meek Mill - Lyrical Eazy\nhttps://www.youtube.com/watch?v=hwsn7V2bdzA&pp=ygUrUmljayBSb3NzICYgTWVlayBNaWxsIC0gVG9vIEdvb2QgdG8gQmUgVHJ1ZQ%3D%3D\n\nJay Rock & Ab-Soul - Blowfly\nhttps://www.youtube.com/watch?v=fJ6BEH0iMpc&pp=ygUcSmF5IFJvY2sgJiBBYi1Tb3VsIC0gQmxvd2ZseQ%3D%3D\n\nCharli XCX - In the City ft. Sam Smith\nhttps://www.youtube.com/watch?v=kmvi8wsHzDU&pp=ygUmQ2hhcmxpIFhDWCAtIEluIHRoZSBDaXR5IGZ0LiBTYW0gU21pdGg%3D\n\n\n!!!WORST TRACKS THIS WEEK!!!\n\nLil Tracy, Corbin, Black Kray - Hello There\nhttps://www.youtube.com/watch?v=PCJ8iLsYIoY\n\nCORPSE - DISDAIN\nhttps://www.youtube.com/watch?v=qD_Sygcsabk&pp=ygUQQ09SUFNFIC0gRGlzZGFpbg%3D%3D\n\nSteve Aoki & Paris Hilton - Lighter\nhttps://www.youtube.com/watch?v=r9qMc02a0_M\n\n21 Savage - Call Me Revenge ft. D4vd\nhttps://www.youtube.com/watch?v=7uxEA0mjQO0&pp=ygUkMjEgU2F2YWdlIC0gQ2FsbCBNZSBSZXZlbmdlIGZ0LiBENHZk\n\nPoppy - Hard\nhttps://www.youtube.com/watch?v=_a75VfQC2s8&pp=ygUMUG9wcHkgLSBIYXJk\n\nYungblud, Oli Sykes of Bring Me the Horizon - Happier\nhttps://www.youtube.com/watch?v=bshhAYyrR6g&pp=ygUzWXVuZ2JsdWQsIE9saSBTeWtlcywgQnJpbmcgTWUgdGhlIEhvcml6b24gLSBIYXBwaWVy\n\nDolly Parton - Wrecking Ball ft. Miley Cyrus\nhttps://www.youtube.com/watch?v=nQMr3VV1u48\n\nwill.i.am & J Balvin - Let’s Go\nhttps://youtu.be/y242XIPPykg?si=WIb5hfd-Ukebgwn3\n\n===================================\nSubscribe: http://bit.ly/1pBqGCN\n\nPatreon: https://www.patreon.com/theneedledrop\n\nOfficial site: http://theneedledrop.com\n\nTwitter: http://twitter.com/theneedledrop\n\nInstagram: https://www.instagram.com/afantano\n\nTikTok: https://www.tiktok.com/@theneedletok\n\nTND Twitch: https://www.twitch.tv/theneedledrop\n\nShorts channel: https://www.youtube.com/@FantanoShorts\n===================================\n\nY'all know this is just my opinion, right?",
        },
        status: {
          privacyStatus: 'public',
        },
      } as PlaylistItem

      const result = extractTrackList_v2(item)

      expect(result.length).toBeGreaterThan(0)
    })

    it('can parse 7/26 (Taylor Swift, J. Cole, Gorillaz, Kero Kero Bonito)', () => {
      const item = {
        id: 'UExQNENTZ2w3Szdvcjg0QUFocjd6bExOcGdoRW5LV3UyYy4xNEMzREYwQzc3REUwNDY0',
        snippet: {
          channelId: 'tony',
          videoOwnerChannelId: 'tony',
          publishedAt: '2020-07-27T03:59:17Z',
          title:
            'Weekly Track Roundup: 7/26 (Taylor Swift, J. Cole, Gorillaz, Kero Kero Bonito)',
          description:
            "FAV TRACKS Spotify playlist:\nhttps://open.spotify.com/playlist/34mJ2w9MY78Bz0Pd5h4P5o?si=44VxevVRTXydLgmRq1btew\n\nTND Patreon: https://www.patreon.com/theneedledrop\n\nTurntable Lab link: http://turntablelab.com/theneedledrop\n\n\r\n!!!BEST TRACKS THIS WEEK!!!\n\nJ. Cole - The Climb Back\nhttps://www.youtube.com/watch?v=oVaBgcJwkI4\nReview: https://youtu.be/fc4NCzoFFEU\n\nGorillaz - PAC-MAN ft. ScHoolboy Q\nhttps://youtu.be/G-7U-FDql1A\nReview: https://www.youtube.com/watch?v=QzJUr2zuPiA\n\nTaylor Swift - Exile ft. Bon Iver\nhttps://youtu.be/osdoLjUNFnA\n\nThe Rolling Stones - Scarlet ft. Jimmy Page\nhttps://youtu.be/Fl0COtEG-TM\n\nBackxwash - Stigmata ft. DeathIrl & Ada Rook\nhttps://backxwash.bandcamp.com/track/stigmata-produced-by-backxwash-3\n\nJ Balvin, Dua Lipa, Bad Bunny & Tainy - Un Dia\nhttps://www.youtube.com/watch?v=BjhW3vBA1QU\n\nPorter Robinson - Get Your Wish (DJ NOT PORTER ROBINSON Remix)\nhttps://www.youtube.com/watch?v=CwZtyJeLbq0\n\nSki Mask the Slump God - Burn the Hoods\nhttps://www.youtube.com/watch?v=9AGAeGsBCvc\n\nThe Flaming Lips - You n Me Sellin' Weed\nhttps://www.youtube.com/watch?v=HvJZw2jwKNo\n\nKero Kero Bonito - It's Bugsnax!\nhttps://www.youtube.com/watch?v=sQTk4eK2fP4\n\nUniform - Dispatches from the Gutter\nhttps://www.youtube.com/watch?v=T7K61Pdvnd8\n\nNathan Dawe x KSI - Lighter\nhttps://www.youtube.com/watch?v=Di0nAk2_Tpw\n\nOliver Tree - Let Me Down ft. Blink-182\nhttps://www.youtube.com/watch?v=_tKaMsrODVo\n\n\n...meh...\n\nNapalm Death - Backlash Just Because\nhttps://www.youtube.com/watch?v=FFDHuCeaM_Y\n\nJaden - Cabin Fever\nhttps://www.youtube.com/watch?v=rXQWaYFsyHs\n\nJaga Jazzist - Tomita (Edit)\nhttps://www.youtube.com/watch?v=_fAgA8RLGbs\n\nThe Avalanches - Wherever You Go ft. Jamie xx, Neneh Cherry & CLYPSO\nhttps://www.youtube.com/watch?v=939w8RwaLSY\n\nBree Runway & Maliibu Miitch - Gucci\nhttps://www.youtube.com/watch?v=W4xzeXjxaS8\n\nDorian Electra - Give Great Thanks\nhttps://www.youtube.com/watch?v=AbhE8sEqKqc\n\nKylie Minogue - Say Something\nhttps://www.youtube.com/watch?v=pRzwD2LLXSI\n\nSmino, JID & Kenny Beats - Baguetti\nhttps://www.youtube.com/watch?v=-IdbbH_OWhc\n\nChronixx - Cool as the Breeze / Friday\nhttps://www.youtube.com/watch?v=qsCV2LBoAG0\n\nChase B & Don Toliver - Cafeteria ft. Gunna\nhttps://www.youtube.com/watch?v=GlwcRpOUe6s\n\n\n!!!WORST TRACKS THIS WEEK!!!\n\n070 Shake - Guilty Conscience (Tame Impala Remix)\nhttps://www.youtube.com/watch?v=4Nsq7ft9bjs\n\nMaroon 5 - Nobody's Love\nhttps://www.youtube.com/watch?v=7ghhRHRP6t4\n\nEarl Sweatshirt - Ghost ft. Navy Blue\nhttps://www.youtube.com/watch?v=Mjb_xnJ-Y0U  \n\nHeadie One x Drake - Only You Freestyle\nhttps://www.youtube.com/watch?v=znQriFAMBRs\n\nJ. Cole - Lion King on Ice\nhttps://www.youtube.com/watch?v=MxiSSSa5K2s\nReview: https://youtu.be/fc4NCzoFFEU \r\n\r\n===================================\r\nSubscribe: http://bit.ly/1pBqGCN\r\n\r\nPatreon: https://www.patreon.com/theneedledrop\r\n\r\nOfficial site: http://theneedledrop.com\r\n\r\nTND Twitter: http://twitter.com/theneedledrop\r\n\r\nTND Facebook: http://facebook.com/theneedledrop\r\n\r\nSupport TND: http://theneedledrop.com/support\r\n===================================\r\n\r\nY'all know this is just my opinion, right?",
        },
        status: {
          privacyStatus: 'public',
        },
      } as PlaylistItem

      const result = extractTrackList_v2(item)

      expect(result.length).toBeGreaterThan(0)
      expect(result.length).toBe(13)
    })

    it('can parse Weekly Track Roundup: 11/21/22', () => {
      const item = {
        id: 'UExQNENTZ2w3Szdvcjg0QUFocjd6bExOcGdoRW5LV3UyYy4xNEMzREYwQzc3REUwNDY0',
        snippet: {
          channelId: 'tony',
          videoOwnerChannelId: 'tony',
          publishedAt: '2020-07-27T03:59:17Z',
          title:
            'Travis Scott, Phoebe Bridgers, Chance the Rapper, Kelela | Weekly Track Roundup: 11/21/22',
          description:
            "2022 FAV TRACKS PLAYLIST: https://music.apple.com/us/playlist/my-fav-singles-of-2022/pl.u-e92LIK9VM5K\n\nTND Patreon: https://www.patreon.com/theneedledrop\n\nTurntable Lab link: http://turntablelab.com/theneedledrop\n\nAUSTEN SHOUTOUT\nKali Malone w/ Stephen O'Malley & Lucy Railton - Does Spring Hide Its Joy v2.3\nhttps://kalimalone.bandcamp.com/album/does-spring-hide-its-joy\n\n!!!BEST TRACKS THIS WEEK!!!\n\nYard Act vs. Mad Professor - Pour More\nhttps://youtu.be/Pc2dZbz87-8\n\nChat Pile - Tenkiller\nhttps://youtu.be/U-5FKTNFz1E\n\nGucci Mane - Letter to Takeoff\nhttps://www.youtube.com/watch?v=n-9F1B_OPAM\n\nPhoebe Bridgers - So Much Wine\nhttps://www.youtube.com/watch?v=4SBhPYhI-XA\n\nAb-Soul - Gang'Nem ft. Fre$h\nhttps://youtu.be/605sWoD5qxU\n\nSaweetie - DON'T SAY NOTHIN'\nhttps://www.youtube.com/watch?v=hDgG0_CK_jU\n\nBlack Belt Eagle Scout - My Blood Runs Through This Land\nhttps://www.youtube.com/watch?v=ntg4az1AsdM\n\nFousheé - Spend the Money ft. Lil Uzi Vert\nhttps://youtu.be/ybiy_2NQ9ik\n\nChristian Lee Hutson - Silent Night\nhttps://youtu.be/RHWAlvhiAKY\n\nJane Remover - Contingency Song\nhttps://youtu.be/cLM7xB3UDKc\n\nFatoumata Diawara - Nsera ft. Daman Albarn\nhttps://youtu.be/VfMDqUSgbck\n\nShame - Fingers of Steel\nhttps://youtu.be/ULLsuL0y-Fk\n\nKelela - On the Run\nhttps://youtu.be/getdc1zzvnc\n\nTkay Maidza - Nights in December\nhttps://youtu.be/2d4FTBml1Pw\n\n\n...meh...\n\nRomy & Fred again.. - Strong\nhttps://youtu.be/3aFF09jjZwk\n\nRosie Thomas - We Should Be Together ft. Sufjan Stevens\nhttps://youtu.be/xRxdaa0GBbE\n\nKorn - Worst Is on Its Way (HEALTH Remix) ft. Danny Brown & Meechy Darko\nhttps://youtu.be/HbtYiLaVzj8\n\nLil Ugly Mane - Redacted Fog\nhttps://liluglymane.bandcamp.com/album/redacted-fog\n\nCrosses - Sensation\nhttps://youtu.be/UuxALeNE96g\n\nDon Toliver - Do It Right\nhttps://www.youtube.com/watch?v=kcr3NC7fsKY\n\nRoddy Ricch - Twin ft. Lil Durk\nhttps://www.youtube.com/watch?v=wIgAmimmz8Q\n\nPharrell Williams & Travis Scott - Down in Atlanta\nhttps://www.youtube.com/watch?v=t_Jhj-gBYCs\n\n\n!!!WORST TRACKS THIS WEEK!!!\n\nChance the Rapper - YAH Know ft. King Promise\nhttps://youtu.be/bcZsfqcBiog\n\n\n===================================\nSubscribe: http://bit.ly/1pBqGCN\n\nPatreon: https://www.patreon.com/theneedledrop\n\nOfficial site: http://theneedledrop.com\n\nTwitter: http://twitter.com/theneedledrop\n\nInstagram: https://www.instagram.com/afantano\n\nTikTok: https://www.tiktok.com/@theneedletok\n\nTND Twitch: https://www.twitch.tv/theneedledrop\n===================================\n\nY'all know this is just my opinion, right?",
        },
        status: {
          privacyStatus: 'public',
        },
      } as PlaylistItem

      const result = extractTrackList_v2(item)

      expect(result.length).toBeGreaterThan(0)
      expect(result).toEqual([
        'Yard Act vs. Mad Professor - Pour More',
        'Chat Pile - Tenkiller',
        'Gucci Mane - Letter to Takeoff',
        'Phoebe Bridgers - So Much Wine',
        "Ab-Soul - Gang'Nem ft. Fre$h",
        "Saweetie - DON'T SAY NOTHIN'",
        'Black Belt Eagle Scout - My Blood Runs Through This Land',
        'Fousheé - Spend the Money ft. Lil Uzi Vert',
        'Christian Lee Hutson - Silent Night',
        'Jane Remover - Contingency Song',
        'Fatoumata Diawara - Nsera ft. Daman Albarn',
        'Shame - Fingers of Steel',
        'Kelela - On the Run',
        'Tkay Maidza - Nights in December',
      ])
    })

    it('can parse Weekly Track Roundup: 10/16/22', () => {
      const item = {
        id: 'UExQNENTZ2w3Szdvcjg0QUFocjd6bExOcGdoRW5LV3UyYy4xNEMzREYwQzc3REUwNDY0',
        snippet: {
          channelId: 'tony',
          videoOwnerChannelId: 'tony',
          publishedAt: '2020-07-27T03:59:17Z',
          title:
            'Lil Yachty, blink-182, Queen, Poppy | Weekly Track Roundup: 10/16/22',
          description:
            "2022 FAV TRACKS PLAYLIST: https://music.apple.com/us/playlist/my-fav-singles-of-2022/pl.u-e92LIK9VM5K\n\nTND Patreon: https://www.patreon.com/theneedledrop\n\nTurntable Lab link: http://turntablelab.com/theneedledrop\n\nShorts channel: https://www.youtube.com/channel/UCfpcfju9rBs5o_xQLXmLQHQ/featured\n\n\n!!!BEST TRACK THIS WEEK!!!\n\nMen I Trust - Girl\nhttps://www.youtube.com/watch?v=6Y9gxXsFoI8\n\nTkay Maidza - High Beams (JPEGMAFIA Remix)\nhttps://www.youtube.com/watch?v=J9diGjY4o6s\n\nWeyes Blood - Grapevine\nhttps://youtu.be/uzKQP141Vuw\n\nG Jones & Eprom - R.A.V.E.\nhttps://www.youtube.com/watch?v=ux6FpKi_khE\n\nPlains - Hurricane\nhttps://youtu.be/0OBxqFV1Fq4\n\nLil Yachty - Poland\nhttps://www.youtube.com/watch?v=s9PzYuVwCSE\n\n\n...meh...\n\nDry Cleaning - No Decent Shoes for Rain\nhttps://www.youtube.com/watch?v=XyfYFznhyJI\n\nKelela - Washed Away\nhttps://www.youtube.com/watch?v=A45gzN0cgow\n\nShow Me the Body - WW4\nhttps://www.youtube.com/watch?v=fwh-SKn1HrE\n\nDoechii - Stressed\nhttps://www.youtube.com/watch?v=3hSbGHfAbqM\n\nQueen - Face It Alone\nhttps://www.youtube.com/watch?v=ijj_hheGEi0\n\ngirl in red - October Passed Me By\nhttps://www.youtube.com/watch?v=c8W4WRNz3gM\n\nPoppy - Shapes\nhttps://www.youtube.com/watch?v=lvlOBN-eQVA\n\nbbno$ - i see london i see france\nhttps://www.youtube.com/watch?v=LXyV5hKqA98\n\n\n!!!WORST TRACKS THIS WEEK!!!\n\nblink-182 - Edging\nhttps://www.youtube.com/watch?v=7MI3buZedOw\n\nStormzy - Hide & Seek\nhttps://www.youtube.com/watch?v=BXd62mMu1UY\n \n\n===================================\nSubscribe: http://bit.ly/1pBqGCN\n\nPatreon: https://www.patreon.com/theneedledrop\n\nOfficial site: http://theneedledrop.com\n\nTwitter: http://twitter.com/theneedledrop\n\nInstagram: https://www.instagram.com/afantano\n\nTikTok: https://www.tiktok.com/@theneedletok\n\nTND Twitch: https://www.twitch.tv/theneedledrop\n===================================\n\nY'all know this is just my opinion, right?",
        },
        status: {
          privacyStatus: 'public',
        },
      } as PlaylistItem

      const result = extractTrackList_v2(item)

      expect(result.length).toBeGreaterThan(0)
      expect(result.length).toBe(6)
    })

    it('can parse Weekly Track Roundup: 11/11', () => {
      const item = {
        id: 'UExQNENTZ2w3Szdvcjg0QUFocjd6bExOcGdoRW5LV3UyYy4xNEMzREYwQzc3REUwNDY0',
        snippet: {
          channelId: 'tony',
          videoOwnerChannelId: 'tony',
          publishedAt: '2020-07-27T03:59:17Z',
          title:
            'Weekly Track Roundup: 11/11 (Earl Sweatshirt, K/DA, J.I.D & J. Cole, Anderson .Paak)',
          description:
            "Get a shirt: http://theneedledrop.com/support\n\nFAV TRACKS Spotify playlist: https://open.spotify.com/user/tndausten/playlist/6eJIhC4KhMXDWrmheBW74m\n\nTurntable Lab link: http://turntablelab.com/theneedledrop\nBrockhampton Vinyl Pre-Order: http://turntablelab.com/iridescence-tnd\n\nAmazon link: http://amzn.to/1KZmdWI\n\nSHOUTOUTS:\n\nChief Keef's Drill Symphony\nhttps://www.youtube.com/watch?v=bSuhFHw5epk\nhttps://www.youtube.com/watch?v=YOO8oyQ1Hug\nhttps://www.youtube.com/watch?v=l37Tx8GDSLg\n\nIntegrity - Bark At the Moon (Ozzy Cover)\nhttps://integrity.bandcamp.com/album/bark-at-the-moon-ozzy-osbourne-cover\n\nGuerilla Toss - Jay Glass Dubs vs Guerilla Toss: https://guerillatoss.bandcamp.com/album/jay-glass-dubs-vs-guerilla-toss\n\n!!!BEST SONGS THIS WEEK!!!\n\nEarl Sweatshirt - Nowhere2go\nhttps://www.youtube.com/watch?v=UCceUo94X1g\nReview: https://youtu.be/cgdIw6PGFnI\n\nJPEGMAFIA & Kenny Beats - Puff Daddy\nhttps://soundcloud.com/jpegmafia/puff-daddy\nReview: https://www.youtube.com/watch?v=dxVcRdCrE4s\n\nSaba - Stay Right Here ft. Mick Jenkins & Xavier Omär\nhttps://soundcloud.com/sabapivot/stay-right-here-ft-xavier-omar-and-mick-jenkins\n\nJ.I.D, J. Cole - Off Deez\nhttps://youtu.be/CzY9Pjorkxs\n\nAnderson .Paak - Who R U?\nhttps://youtu.be/bWBg_g43WB8\n\nHealth X Youth Code - Innocence\nhttps://youtu.be/gW5R59e_z-c\n\nLil Wayne - In This House ft. Gucci Mane\nhttps://itunes.apple.com/us/album/in-this-house-feat-gucci-mane/1441839390?i=1441839391\n\nConor Oberst - No One Changes\nhttps://conoroberst.bandcamp.com/album/no-one-changes-the-rockaways\n\nK/DA - POP/STARS (ft. Madison Beer, (G)I-DLE, Jaira Burns)\nhttps://youtu.be/UOxkGD8qRB4\n\n...meh...\n\nSmino - Klink\nhttps://www.youtube.com/watch?v=EnH_1wPTQ9Q\n\nIceage - Balm of Gilead\nhttps://youtu.be/nqY2SPZ4H9s\n\nSmashing Pumpkins - Knights of Malta\nhttps://youtu.be/O80Kwt4zcxs\n\nMineral - Aurora\nhttps://youtu.be/X3kOyzJL7SY\n\n\n!!!WORST SONGS THIS WEEK!!!\n\nXXXTENTACION - BAD\nhttps://www.youtube.com/watch?v=P1t9T1TAOBI\nReview: https://www.youtube.com/watch?v=nyzpFetVUrQ\n\nPanda Bear - Dolphin\nhttps://youtu.be/Eo6Sf80Uco8\n\nIbibio Sound Machine - Basquiat\nhttps://youtu.be/qGoDbhnFnSM\n\nTyler, The Creator - I Am the Grinch\nhttps://youtu.be/8CKEcOBCSQg\n\nIce Cube - Arrest the President\nhttps://www.youtube.com/watch?v=y9oUnC8JtXY\n\n===================================\nSubscribe: http://bit.ly/1pBqGCN\n\nOfficial site: http://theneedledrop.com\n\nTND Twitter: http://twitter.com/theneedledrop\n\nTND Facebook: http://facebook.com/theneedledrop\n\nSupport TND: http://theneedledrop.com/support\n===================================\n\nY'all know this is just my opinion, right?",
        },
        status: {
          privacyStatus: 'public',
        },
      } as PlaylistItem

      const result = extractTrackList_v2(item)

      expect(result.length).toBeGreaterThan(0)
      expect(result.length).toBe(9)
    })

    it('can parse Weekly Track Roundup: 2/22/21', () => {
      const item = {
        id: 'UExQNENTZ2w3Szdvcjg0QUFocjd6bExOcGdoRW5LV3UyYy4xNEMzREYwQzc3REUwNDY0',
        snippet: {
          channelId: 'tony',
          videoOwnerChannelId: 'tony',
          publishedAt: '2020-07-27T03:59:17Z',
          title:
            'King Gizzard, NF, Denzel Curry, Iceage | Weekly Track Roundup: 2/22/21',
          description:
            '2021 FAV TRACKS PLAYLIST: https://open.spotify.com/playlist/7hXc9PnNqJtnV4hMmsqgIR?si=BDDSbBnoQzS1KPhndqwfkg\n\nTND Patreon: https://www.patreon.com/theneedledrop\n\nTurntable Lab link: http://turntablelab.com/theneedledrop\n\nTND NEWSLETTER: https://www.theneedledrop.com/newsletter\n\n\n\n!!BEST TRACKS THIS WEEK!!!\n\nGenesis Owusu - Gold Chains\nhttps://open.spotify.com/track/0T7PAJKN2k6k7kBSWIcw34?si=hhE2Uw5HQQWeoO_omF3gdA\n\nStill Woozy - Rocky\nhttps://open.spotify.com/track/5uDohC8URXwbGiHAMuKGoa?si=IQOGi6HKR_CQkDtO6nlOyA\n\nLord Huron - Not Dead Yet\nhttps://open.spotify.com/track/5NRbNXwXHM9mYgxMhzVWTP?si=ed8bQ8i7SG-DZx2pTigU-g\n\nMahalia - Jealous ft. Rico Nasty\nhttps://open.spotify.com/track/0IIn18QlxCeUpLPRaR6a7K?si=3iZziHKuSH-gGlIgKBRA-Q\n\nTash Sultana - Greed\nhttps://open.spotify.com/track/1c9NFMnYVnU8J56Ccj9BFo?si=Uo2Vey4vQP-t-Z4QYwO0SQ\n\nDenzel Curry & Kenny Beats - So.Incredible.pkg [Robert Glasper Version] ft. Smino\nhttps://open.spotify.com/track/4eOtmXtgxmzDsZcdc0lwiz?si=wJHtDqnASwO4GDCntuszdA\n\nNick Hakim - QADIR (BBNG Remix)\nhttps://open.spotify.com/track/5x41LqlyowJ4ng2VbhwlX2?si=uq8UxNsNTxShxrO3Koeqxw\n\nAlice Phoebe Lou - Dirty Mouth\nhttps://open.spotify.com/track/6zX3RXmaMLY28wlLRCrT7Q?si=ku-2QCX-SSW2YYeFzFMWyQ\n\nIceage - Vendetta\nhttps://open.spotify.com/track/6HQRRt7mkkwuJxbJxgbnpf?si=FDOwTHdYRe2gqkSURDd3kw\n\nGojira - Born for One Thing\nhttps://open.spotify.com/track/3imV0hhAWp4YQGP9gdm8xe?si=uIF91YzPQ0iuded9z8TRmQ\n\nGalen Tipton - pixie ring\nhttps://open.spotify.com/track/1dpUCzuT5fFQRxhTuTiTjI?si=9koCnnMfQEe2QcURwK6APA\n\nAndrew W.K. - Babalon\nhttps://open.spotify.com/track/6eNl8oAig5rYUJS62zt91P?si=V3UawV6KT1qArG0UQMRxJg\n\nVegyn - I See You Sometimes ft. Jeshi\nhttps://youtu.be/5LuyydVBfos\n\nBill Callahan & Bonnie "Prince" Billy - The Wild Kindness ft. Cassie Berman\nhttps://youtu.be/-Xug9Ty0FD0\n\n\n...meh...\n\nMyd - Born a Loser\nhttps://open.spotify.com/track/1jwfn6MIDfs7BczMX2bS5J?si=R0wYsNgeQdSjFlNuHi8IZQ\n\nNF - Clouds\nhttps://www.youtube.com/watch?v=fibYknUCIU4\n\nLost Girls - Menneskekollektivet\nhttps://youtu.be/1Ah7o9sxpHk\n\n24kGoldn - 3, 2, 1\nhttps://www.youtube.com/watch?v=WbHfQgVi1GA\n\nKing Gizzard & the Lizard Wizard - Pleura\nhttps://open.spotify.com/track/6nmufQUcWf9MTXTKXoGLzI?si=cV1n3EfuSa623nv4PNDY0Q\n\nKaytranada - Caution\nhttps://open.spotify.com/album/4JOlhEazXmlErhrnmABjYZ?si=-ZjaepeZS4yOOWVxtM5S6Q\n\nStereolab - The Super It\nhttps://open.spotify.com/track/0BrBwqdNQaEh7On0GlYvxp?si=hYEE6k4yQTCzHnnyelcmnQ\n\nAndy Morin - Dolphin (Remix) ft. Payday\nhttps://www.youtube.com/watch?v=goBSafAZQ0I\n\nserpentwithfeet - Same Size Shoe\nhttps://open.spotify.com/track/0dedT0AfVJO8ebgLee0prY?si=i0azPYJJRPaMtDe9ZlcHjw\n\nELIO - Charger ft. Charli XCX\nhttps://open.spotify.com/track/0WDjZuWS4Z0ATgR8eL5cr1?si=CnHCHeyJS8OdeFiRoIOPxg\n\nManchester Orchestra - Bed Head\nhttps://open.spotify.com/track/7oeyJeknYRMuD9ufVzyglS?si=W-YOWOp3RNyGt9SjQ2f7UA\n\n\n!!!WORST TRACKS THIS WEEK!!!\n\nLil Yachty - Hit Bout It\nhttps://open.spotify.com/album/5TD1ySNZ2lB0UfuMUMWjq0?si=JwnaO5FPRn2jBGv6vPhyvA\n\nTory Lanez - Feels ft. Chris Brown\n\nPapa Roach - Broken As Me ft. Danny Worsnop of Asking Alexandria\nhttps://open.spotify.com/track/5ndiViQR5pAE1WPWTINHQb?si=9oLQAhOzRbG3Vu0cvdAaPw\n\nThe Blossom - Hardcore Happy\nhttps://www.youtube.com/watch?v=y-wR41tIZKQ\n\n6ix9ine - ZAZA\nhttps://youtu.be/EZcYZ5eDpu0\n\n===================================\nSubscribe: http://bit.ly/1pBqGCN\n\nPatreon: https://www.patreon.com/theneedledrop\n\nOfficial site: http://theneedledrop.com\n\nTwitter: http://twitter.com/theneedledrop\n\nInstagram: https://www.instagram.com/afantano\n\nTND Twitch: https://www.twitch.tv/theneedledrop\n===================================\n\nY\'all know this is just my opinion, right?',
        },
        status: {
          privacyStatus: 'public',
        },
      } as PlaylistItem

      const result = extractTrackList_v2(item)

      expect(result.length).toBeGreaterThan(0)
    })

    it('can parse FAV & WORST TRACKS: 8/21', () => {
      const item = {
        id: 'UExQNENTZ2w3Szdvcjg0QUFocjd6bExOcGdoRW5LV3UyYy4xNEMzREYwQzc3REUwNDY0',
        snippet: {
          channelId: 'tony',
          videoOwnerChannelId: 'tony',
          publishedAt: '2020-07-27T03:59:17Z',
          title:
            'FAV & WORST TRACKS: 8/21 (Danny Brown, Metallica, Crystal Castles, Isaiah Rashad)',
          description:
            'Amazon link:\nhttp://amzn.to/1KZmdWI\n\n!!!FAV TRACKS THIS WEEK!!!\n\nWrekmeister Harmonies - "Some Were Saved Some Drowned"\nhttp://www.theneedledrop.com/articles/2016/8/wrekmeister-harmonies-some-were-saved-some-drowned\n\nIsaiah Rashad - "i mean"\nhttp://www.theneedledrop.com/articles/2016/8/isaiah-rashad-i-mean\n\nSun Kil Moon - "I Love Portugal"\nhttp://www.theneedledrop.com/articles/2016/8/sun-kil-moon-i-love-portugal\n\nDanny Brown - "Pneumonia"\nhttp://www.theneedledrop.com/articles/2016/8/danny-brown-pneumonia\n\nDumbfoundead - "Harambe"\nhttp://www.theneedledrop.com/articles/2016/8/dumbfoundead-harambe\n\nKa - "Just"\nhttp://www.theneedledrop.com/articles/2016/8/ka-just\n\nKool Keith - "Super Hero" ft. MF DOOM\nhttp://www.theneedledrop.com/articles/2016/8/kool-keith-super-hero-ft-mf-doom\n\nMEH...\n\nEarl Sweatshirt ft. Knxwledge - Balance\n\nMetallica - Hardwired\n\nPixies - Talent\n\n!!!WORST TRACKS THIS WEEK!!!\n\nTouche Amore - Skyscraper ft. Julien Baker\n\nCrystal Castles - Sadist\n\n===================================\nSubscribe: http://bit.ly/1pBqGCN\n\nOfficial site: http://theneedledrop.com\n\nTND Twitter: http://twitter.com/theneedledrop\n\nTND Facebook: http://facebook.com/theneedledrop\n\nSupport TND: http://theneedledrop.com/support\n===================================\n\nY\'all know this is just my opinion, right?',
        },
        status: {
          privacyStatus: 'public',
        },
      } as PlaylistItem

      const result = extractTrackList_v2(item)

      expect(result.length).toBeGreaterThan(0)
    })

    it('can parse FAV & WORST TRACKS: 7/24', () => {
      const item = {
        id: 'UExQNENTZ2w3Szdvcjg0QUFocjd6bExOcGdoRW5LV3UyYy4xNEMzREYwQzc3REUwNDY0',
        snippet: {
          channelId: 'tony',
          videoOwnerChannelId: 'tony',
          publishedAt: '2020-07-27T03:59:17Z',
          title:
            'FAV & WORST TRACKS: 7/24 (Desiigner, Skrillex & Rick Ross, and Street Sects)',
          description:
            'Amazon link:\nhttp://amzn.to/1KZmdWI\n\nWorst Track: Major Lazer - Cold Water ft. Bieber and Mo\n\nChris Farren - "Say U Want Me"\nhttp://www.theneedledrop.com/articles/2016/7/chris-farren-say-u-want-me\n\nScreaming Females – “Skeleton”\nhttp://www.theneedledrop.com/articles/2016/7/screaming-females-skeleton\n\nDenzel Curry - "Today" ft. Boogie & Allan Kingdom\nhttp://www.theneedledrop.com/articles/2016/7/denzel-curry-today-ft-boogie-allan-kingdom\n\nA. G. Cook - "Superstar"\nhttp://www.theneedledrop.com/articles/2016/7/a-g-cook-superstar\n\nDabbla - "Randeer"\nhttp://www.theneedledrop.com/articles/2016/7/dabbla-randeer\n\nSkrillex & Rick Ross - "Purple Lamborghini"\nhttp://www.theneedledrop.com/articles/2016/7/skrillex-rick-ross-purple-lamborghini\n\nStreet Sects - "And I Grew into Ribbons"\nhttp://www.theneedledrop.com/articles/2016/7/street-sects-and-i-grew-into-ribbons\n\nDJ Windows 98 (Win Butler) – “K33p Ur Dr34ms” (Suicide Remix)\nhttp://www.theneedledrop.com/articles/2016/7/dj-windows-98-win-butler-k33p-ur-dr34ms-suicide-remix\n\n===================================\nSubscribe: http://bit.ly/1pBqGCN\n\nOfficial site: http://theneedledrop.com\n\nTND Twitter: http://twitter.com/theneedledrop\n\nTND Facebook: http://facebook.com/theneedledrop\n\nSupport TND: http://theneedledrop.com/support\n===================================\n\nY\'all know this is just my opinion, right?',
        },
        status: {
          privacyStatus: 'public',
        },
      } as PlaylistItem

      const result = extractTrackList_v2(item)

      expect(result.length).toBeGreaterThan(0)
      expect(result.length).toBe(8)
      expect(result).toEqual([
        'Chris Farren - "Say U Want Me"',
        'Screaming Females - “Skeleton”',
        'Denzel Curry - "Today" ft. Boogie & Allan Kingdom',
        'A. G. Cook - "Superstar"',
        'Dabbla - "Randeer"',
        'Skrillex & Rick Ross - "Purple Lamborghini"',
        'Street Sects - "And I Grew into Ribbons"',
        'DJ Windows 98 (Win Butler) - “K33p Ur Dr34ms” (Suicide Remix)',
      ])
    })

    it('can parse FAV & WORST TRACKS: 7/17', () => {
      const item = {
        id: 'UExQNENTZ2w3Szdvcjg0QUFocjd6bExOcGdoRW5LV3UyYy4xNEMzREYwQzc3REUwNDY0',
        snippet: {
          channelId: 'tony',
          videoOwnerChannelId: 'tony',
          publishedAt: '2020-07-27T03:59:17Z',
          title:
            'FAV & WORST TRACKS: 7/17 (Justice, Good Charlotte, Migos, Katy Perry)',
          description:
            'Amazon link:\nhttp://amzn.to/1KZmdWI\n\nJustice - "Safe and Sound"\nhttp://www.theneedledrop.com/articles/2016/7/justice-safe-and-sound\n\nQuays - "Your Side" ft. Nancy Andersen\nhttp://www.theneedledrop.com/articles/2016/7/quays-your-side-ft-nancy-andersen\n\nTobacco - "Human Om"\nhttp://www.theneedledrop.com/articles/2016/7/tobacco-human-om\n\nSwain - "Hold My Head"\nhttp://www.theneedledrop.com/articles/2016/7/swain-hold-my-head\n\nJagwar Ma - "O B 1"\nhttp://www.theneedledrop.com/articles/2016/7/jagwar-ma-o-b-1\n\nJeff Rosenstock - "Festival Song"\nhttp://www.theneedledrop.com/articles/2016/7/jeff-rosenstock-festival-song\n\nMigos - "Now" ft. Gucci Mane\nhttp://www.theneedledrop.com/articles/2016/7/migos-now-ft-gucci-mane\n\nPreoccupations - "Degraded"\nhttp://www.theneedledrop.com/articles/2016/7/preoccupations-degraded\n\nWorst track:\nGood Charlotte’s “Life Can’t Get Much Better”\n\nRunner-ups:\nKaty Perry’s “Rise”\nBritney Spears’ “Make Me” ft. G-Eazy\n\n===================================\nSubscribe: http://bit.ly/1pBqGCN\n\nOfficial site: http://theneedledrop.com\n\nTND Twitter: http://twitter.com/theneedledrop\n\nTND Facebook: http://facebook.com/theneedledrop\n\nSupport TND: http://theneedledrop.com/support\n===================================\n\nY\'all know this is just my opinion, right?',
        },
        status: {
          privacyStatus: 'public',
        },
      } as PlaylistItem

      const result = extractTrackList_v2(item)

      expect(result.length).toBeGreaterThan(0)
    })

    it('can parse FAV TRACKS: 7/10', () => {
      const item = {
        id: 'UExQNENTZ2w3Szdvcjg0QUFocjd6bExOcGdoRW5LV3UyYy4xNEMzREYwQzc3REUwNDY0',
        snippet: {
          channelId: 'tony',
          videoOwnerChannelId: 'tony',
          publishedAt: '2020-07-27T03:59:17Z',
          title: 'FAV TRACKS: 7/10 (Gucci Mane, Lil Yachty, Arca, Iglooghost)',
          description:
            'Amazon link:\nhttp://amzn.to/1KZmdWI\n\nDefiled - "Fear from Above"\nhttp://www.theneedledrop.com/articles/2016/7/defiled-fear-from-above\n\nGucci Mane - "First Day out tha Feds"\nhttp://www.theneedledrop.com/articles/2016/7/gucci-mane-first-day-out-tha-feds\n\nCarnage - "Mase in \'97" ft. Lil Yachty\nhttp://www.theneedledrop.com/articles/2016/7/carnage-mase-in-97-ft-lil-yachty\n\nIGLOOGHOST - ᴗ ˳ ᴗ Snoring (Music to Sleep To)\nhttp://www.theneedledrop.com/articles/2016/7/iglooghost-snoring-music-to-sleep-to\n\nArca - Entrañas\nhttp://www.theneedledrop.com/articles/2016/7/arca-entranas\n\nScHoolboy Q - "THat Part" (Black Hippy Remix)\nhttp://www.theneedledrop.com/articles/2016/7/schoolboy-q-that-part-black-hippy-remix\n\nFactory Floor - "Ya"\nhttp://www.theneedledrop.com/articles/2016/7/factory-floor-ya\n\n===================================\nSubscribe: http://bit.ly/1pBqGCN\n\nOfficial site: http://theneedledrop.com\n\nTND Twitter: http://twitter.com/theneedledrop\n\nTND Facebook: http://facebook.com/theneedledrop\n\nSupport TND: http://theneedledrop.com/support\n===================================\n\nY\'all know this is just my opinion, right?',
        },
        status: {
          privacyStatus: 'public',
        },
      } as PlaylistItem

      const result = extractTrackList_v2(item)

      expect(result.length).toBeGreaterThan(0)
      expect(result.length).toBe(7)
    })

    it('can parse FAV & WORST TRACKS: 7/31', () => {
      const item = {
        id: 'UExQNENTZ2w3Szdvcjg0QUFocjd6bExOcGdoRW5LV3UyYy4xNEMzREYwQzc3REUwNDY0',
        snippet: {
          channelId: 'tony',
          videoOwnerChannelId: 'tony',
          publishedAt: '2020-07-27T03:59:17Z',
          title:
            'FAV & WORST TRACKS: 7/31 (Mac Miller, clipping. and DJ Khaled)',
          description:
            'Amazon link:\nhttp://amzn.to/1KZmdWI\n\n!!!FAV TRACKS THIS WEEK!!!\n\nTravis Scott & Young Thug - "Pick Up The Phone" ft. Quavo\nhttps://www.youtube.com/watch?v=__Wt9Rg-M8E\n\nAlunaGeorge, Leikeli47, Dreezy - "Mean What I Mean"\nhttps://youtu.be/NbtEy1Wdqj0\n\nBrain Tentacles -"The Sadist"\nhttp://www.theneedledrop.com/articles/2016/7/brain-tentacles-the-sadist\n\nclipping. - "Baby Don\'t Sleep"\nhttp://www.theneedledrop.com/articles/2016/7/clipping-baby-dont-sleep\n\nInjury Reserve - "Oh Shit!!!"\nhttp://www.theneedledrop.com/articles/2016/7/injury-reserve-oh-shit\n\nHot Dad - "Pokémon Go (Poké Don\'t Stop)"\nhttp://www.theneedledrop.com/articles/2016/7/hot-dad-pokmon-go-pok-dont-stop\n\nDJ Khaled - "Holy Key" ft. Kendrick Lamar, Big Sean & Betty Wright\nhttp://www.theneedledrop.com/articles/2016/7/dj-khaled-holy-key-ft-kendrick-lamar-big-sean-betty-wright\n\nThe Garden - "Call This # Now"\nhttp://www.theneedledrop.com/articles/2016/7/the-garden-call-this-now\n\nCommunions - "Don\'t Hold Anything Back"\nhttp://www.theneedledrop.com/articles/2016/7/communions-dont-hold-anything-back\n\nMac Miller - "Dang" ft. Anderson . Paak\nhttps://youtu.be/HbDOdFRLV0U\n\nDefiant III - "Crossfire"\nhttps://soundcloud.com/cjmhiphop/defiant-iii-crossfire\n\nKoreatown Oddity - "Fuck Dinosaurs"\nhttps://youtu.be/-QN6gtU0I9g\n\nSpace Candy - "Elastic Spring"\nhttps://soundcloud.com/deskpopmusic/space-candy-elastic-spring?in=deskpopmusic/sets/space-candy-forest-ep\n\nSun Kil Moon - "God Bless Ohio"\nhttp://www.theneedledrop.com/articles/2016/7/sun-kil-moon-god-bless-ohio\n\n!!!WORST TRACKS THIS WEEK!!!\nSnooki - Young Mommy\nhttps://youtu.be/zp5pW-27tJU\n\nDemocratic National Conventional - Our Fight Song\nhttps://youtu.be/YttscNOoAjA\n\nSpecter vs. Smash Mouth - Love Is A Soldier\nhttps://youtu.be/7LSBrccSbBI\n\nYG - FDT Pt. 2 ft. G-Eazy & Macklemore \nhttps://soundcloud.com/4hunnidrecords/fdt-part-2-feat-g-eazy-macklemore\n\n===================================\nSubscribe: http://bit.ly/1pBqGCN\n\nOfficial site: http://theneedledrop.com\n\nTND Twitter: http://twitter.com/theneedledrop\n\nTND Facebook: http://facebook.com/theneedledrop\n\nSupport TND: http://theneedledrop.com/support\n===================================\n\nY\'all know this is just my opinion, right?',
        },
        status: {
          privacyStatus: 'public',
        },
      } as PlaylistItem

      const result = extractTrackList_v2(item)

      expect(result.length).toBeGreaterThan(0)
      expect(result.length).toBe(14)
    })
  })
})
