# tnd best tracks

### todo
- have this run on (webhook ?? cron) and update this years playlist
  - could have a small playlist just for the current weeks tracks that too

### improvement opps
1. findTrack retry to handle multiple songs per line:
  - check trackName for "/" or "&"
  - tricky refactor where findTrack could return more than 1 track
  - and then main list `youtubeTracks` each item could have more than one spotifyTrack associated to it
  - I think that's OK!
2. findTrack, add retry which removes `track:`, `artist:`
  - reluctant to do this cos accuracy will suffer
3. keep a list of the youtube tracks without spotifyTracks for posterity
  - the forbidden playlist
  - ~~or add them to the playlists description~~
  - upload a text file of forbidden to s3 bucket with the links tony provided
  - description links to that text file
  - or do it as a google sheet!
    1. store the missing songs there
    2. would be cool be able to map missing songs in the spreadsheet so the next run could pick up any manually mapped tracks

https://developers.google.com/youtube/v3/getting-started

1. PlaylistItems API: https://developers.google.com/youtube/v3/docs/playlistItems/list
  - PLP4CSgl7K7or84AAhr7zlLNpghEnKWu2c

contentDetails,id,snippet,status

2. parse description.
  - boy howdy that was not easy
  - parse results:
```
2016.json x 199 tracks
2017.json x 342 tracks
2018.json x 385 tracks
2019.json x 486 tracks
2020.json x 598 tracks
2021.json x 511 tracks
2022.json x 441 tracks
2023.json x 462 tracks
= 3424 total
```

3. lookup each song on spotify and save ids to json
  - if tony included a trackId, get song by trackId
    - considered batching the getById requests, but of 3.4k tracks, >300 of them have a spotify trackId
    - is it really worth it? Probably not but I am doing it
  - if not - search song by name/artist/(album if albumId)
  - gonna need spotify search ap
  - https://developer.spotify.com/documentation/web-api/reference/search

4. Review youtube / spotify pairs
  - case where spotifyTrack is not found
    - 3376 / 3466 spotify tracks found total
  - case where match is bad

4. Do user auth, callback url stuff

5. get my existing playlists
  - https://developer.spotify.com/documentation/web-api/reference/get-list-users-playlists
  - scopes: [playlist-read-private, playlist-read-collaborative]

6. create those playlists that dont exist
  - https://developer.spotify.com/documentation/web-api/reference/create-playlist
  - scopes: [playlist-modify-private, playlist-modify-public]

7. add songs to playlists
  - https://developer.spotify.com/documentation/web-api/reference/add-tracks-to-playlist
  - scopes: [playlist-modify-private, playlist-modify-public]