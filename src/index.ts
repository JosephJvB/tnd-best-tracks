require('dotenv').config({
  path: __dirname + '/../.env',
})
import getSpotifyTracks from './tasks/getSpotifyTracks'
import extractYoutubeTracks from './tasks/extractYoutubeTracks'
import saveWeeklyPlaylistItems from './tasks/saveWeeklyPlaylistItems'
import manageSpotifyPlaylists from './tasks/manageSpotifyPlaylists'

void (async function () {
  // await saveWeeklyPlaylistItems()
  // extractYoutubeTracks()
  // await getSpotifyTracks()
  // await manageSpotifyPlaylists()
})()
