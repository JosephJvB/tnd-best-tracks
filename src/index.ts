require('dotenv').config({
  path: __dirname + '/../.env',
})
import getSpotifyTracks from './tasks/getSpotifyTracks'
import extractYoutubeTracks from './tasks/extractYoutubeTracks'
import saveWeeklyPlaylistItems from './tasks/saveWeeklyPlaylistItems'
import manageSpotifyPlaylists from './tasks/manageSpotifyPlaylists'
import updateSpreadsheet from './tasks/updateSpreadsheet'
import createVideoSheet from './tasks/createVideoSheet'

void (async function () {
  // v1
  // await saveWeeklyPlaylistItems()
  // youtube description track line example
  // `${artist} - ${songName}\n${songUrl}`
  const EXAMPLE_YOUTUBE_TRACKS = {
    withoutSpotifyId:
      'Kali Uchis - Te Mata\nhttps://www.youtube.com/watch?v=PVx4TQoIc-o&pp=ygUUS2FsaSBVY2hpcyAtIFRlIE1hdGE%3D',
    withSpotifyId:
      'Morray - Never Fail ft. Benny the Butcher\nhttps://open.spotify.com/track/0myEYpzyBetSo4tgKs7oUx?si=3184cbb6ff1141a4',
  }
  // extractYoutubeTracks()
  // await getSpotifyTracks()
  // await manageSpotifyPlaylists()
  // v1.5
  // await updateSpreadsheet()
  // await createVideoSheet()
})()
