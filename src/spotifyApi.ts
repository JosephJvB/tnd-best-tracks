import axios, { AxiosError, AxiosResponse } from 'axios'
import { BestTrack } from './tasks/extractBestTracks'

const API_BASE_URL = 'https://api.spotify.com/v1'
const ACCOUNTS_BASE_URL = 'https://accounts.spotify.com/api'

export type SpotifySearchParams = {
  // album, artist, track, year, upc, tag:hipster, tag:new, isrc, genre
  q: string
  type: 'track' | 'album'
  limit: number
}
export type SearchResults<T> = {
  tracks: {
    href: string
    items: SpotifyTrack[]
  }
}
export type SpotifyTrack = {
  id: string
  uri: string
  href: string
  name: string
  artists: SpotifyArtist[]
}
export type SpotifyArtist = {
  id: string
  uri: string
  href: string
  name: string
}

let TOKEN = ''

export const getToken = async () => {
  if (!TOKEN) {
    await setToken()
  }
  return TOKEN
}

export const findTrack = async (bestTrack: BestTrack, year: number) => {
  try {
    const { name, artist } = bestTrack
    const params: SpotifySearchParams = {
      q: [`track:${name}`, `artist:${artist}`, `year:${year}`].join(' '),
      type: 'track',
      limit: 3,
    }

    const res: AxiosResponse<SearchResults<SpotifyTrack>> = await axios({
      method: 'get',
      url: `${API_BASE_URL}/search`,
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
    console.error('findTrack failed')
    process.exit()
  }
}

export const setToken = async () => {
  try {
    const res: AxiosResponse<{
      access_token: string
    }> = await axios({
      method: 'post',
      url: `${ACCOUNTS_BASE_URL}/token`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      }),
    })

    TOKEN = res.data.access_token
  } catch (e) {
    const axError = e as AxiosError
    if (axError.isAxiosError) {
      console.error(axError.response?.data)
      console.error(axError.response?.status)
      console.error('axios error')
    } else {
      console.error(e)
    }
    console.error('setToken failed')
    process.exit()
  }
}
