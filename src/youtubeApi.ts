import axios, { AxiosError, AxiosResponse } from 'axios'

const BASE_URL = 'https://www.googleapis.com/youtube/v3'

export type PlaylistItem = {
  id: string
  snippet: {
    publishedAt: string
    title: string
    description: string
    channelId: string
    videoOwnerChannelId: string
  }
  status: {
    privacyStatus: 'public' | 'private'
  }
}
export type ApiResponse<T> = {
  nextPageToken?: string
  prevPageToken?: string
  items: T[]
}
export type ApiQuery = {
  key: string
}
export type PlaylistItemQuery = ApiQuery & {
  playlistId: string
  part: string
  maxResults: number
  pageToken?: string
}

export const getPlaylistItems = async ({
  playlistId,
  pageToken,
}: {
  playlistId: string
  pageToken?: string
}) => {
  try {
    const params: PlaylistItemQuery = {
      key: process.env.API_KEY,
      playlistId,
      part: 'snippet,status',
      maxResults: 50,
      ...(!!pageToken && { pageToken }),
    }

    const res: AxiosResponse<ApiResponse<PlaylistItem>> = await axios({
      method: 'get',
      url: `${BASE_URL}/playlistItems`,
      params,
    })
    return res.data
  } catch (e) {
    const axError = e as AxiosError
    if (axError.isAxiosError) {
      console.error(axError.response?.data)
      console.error(axError.response?.status)
      console.error('axios error')
    } else {
      console.error(e)
    }
    console.error('getPlaylistItems failed')
    process.exit()
  }
}
