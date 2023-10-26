import axios, { AxiosError, AxiosResponse } from 'axios'
import { BestTrack } from './tasks/extractBestTracks'
import { SPOTIFY_DOMAIN, SPOTIFY_ID_LENGTH } from './constants'

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

export const getTrack = async (trackId: string) => {
  try {
    const res: AxiosResponse<SpotifyTrack> = await axios({
      method: 'get',
      url: `${API_BASE_URL}/tracks/${trackId}`,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    })
    await new Promise((r) => setTimeout(r, 300))

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
    console.error('getTrack failed')
    process.exit()
  }
}

export const findTrack = async (track: BestTrack, year: number) => {
  try {
    const { name, artist, link } = track
    const params: SpotifySearchParams = {
      q: [`track:${name}`, `artist:${artist}`, `year:${year}`].join(' '),
      type: 'track',
      limit: 3,
    }

    const albumId = extractSpotifyId(link, 'album')
    if (albumId) {
      params.q += ` album:${albumId}`
    }
    const res: AxiosResponse<SearchResults<SpotifyTrack>> = await axios({
      method: 'get',
      url: `${API_BASE_URL}/search`,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
      params,
    })
    await new Promise((r) => setTimeout(r, 300))

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

// https://open.spotify.com/track/1nxudYVyc5RLm8LrSMzeTa?si=-G3WGzRgTDq8OuRa688FMg
// https://open.spotify.com/album/3BFHembK3fNseQR5kAEE2I
export const extractSpotifyId = (link: string, type: 'album' | 'track') => {
  const url = new URL(link)
  if (url.host !== SPOTIFY_DOMAIN) {
    return null
  }

  const [urlType, id] = url.pathname.split('/').slice(1)

  if (urlType !== type) {
    return null
  }

  if (id.length !== SPOTIFY_ID_LENGTH) {
    throw new Error(`failed to parse trackId ${JSON.stringify({ link, id })}`)
  }

  return id
}