require('dotenv').config({
  path: __dirname + '/../.env',
})
import assignSpotifyIds from './tasks/assignSpotifyIds'
import extractBestTracks from './tasks/extractBestTracks'
import saveWeeklyPlaylistItems from './tasks/saveWeeklyPlaylistItems'

void (async function () {
  // await saveWeeklyPlaylistItems()
  extractBestTracks()
  // await assignSpotifyIds()
})()
