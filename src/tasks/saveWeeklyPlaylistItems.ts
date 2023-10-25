import { writeFileSync } from 'fs'
import {
  PLAYLIST_ITEMS_JSON_PATH,
  WEEKLY_TRACK_REVIEW_PLAYLIST_ID,
} from '../constants'
import { PlaylistItem, getPlaylistItems } from '../youtubeApi'

export const getAllPlaylistItems = async (playlistId: string) => {
  const items: PlaylistItem[] = []
  let pageToken: string | undefined = undefined
  let i = 1

  do {
    console.log('  > getPlaylistItems', i++, 'pageToken:' + pageToken)
    const res = await getPlaylistItems({
      playlistId,
      pageToken,
    })
    items.push(...res.items)
    pageToken = res.nextPageToken
    await new Promise((r) => setTimeout(r, 300))
  } while (!!pageToken)

  return items
}

export default async function () {
  const allPlaylistItems = await getAllPlaylistItems(
    WEEKLY_TRACK_REVIEW_PLAYLIST_ID
  )

  console.log('  > got', allPlaylistItems.length, 'playlist items')

  writeFileSync(
    PLAYLIST_ITEMS_JSON_PATH,
    JSON.stringify(allPlaylistItems, null, 2)
  )
}
