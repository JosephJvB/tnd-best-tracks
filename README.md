# tnd best tracks

https://developers.google.com/youtube/v3/getting-started

just Quadeca SCRAPYARD I to fix i think

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
  - gonna need spotify search api
  - https://developer.spotify.com/documentation/web-api/reference/search

4. Review youtube / spotify pairs
  - case where spotifyTrack is not found
    - 3376 / 3466 spotify tracks found total
  - case where match is bad

4. Do user auth, callback url stuff

5. get my existing playlists
  - https://developer.spotify.com/documentation/web-api/reference/get-list-users-playlists

6. create those playlists that dont exist
  - https://developer.spotify.com/documentation/web-api/reference/create-playlist

7. add songs to playlists
  - https://developer.spotify.com/documentation/web-api/reference/add-tracks-to-playlist