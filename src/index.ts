require('dotenv').config({
  path: __dirname + '/../.env',
})
import getSpotifyTracks from './tasks/getSpotifyTracks'
import extractYoutubeTracks from './tasks/extractYoutubeTracks'
import saveWeeklyPlaylistItems from './tasks/saveWeeklyPlaylistItems'

void (async function () {
  // await saveWeeklyPlaylistItems()
  // extractYoutubeTracks()
  // await getSpotifyTracks()
})()
