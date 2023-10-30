import axios, { AxiosError, AxiosResponse } from 'axios'
import { YoutubeTrack } from './tasks/extractYoutubeTracks'
import { SPOTIFY_DOMAIN, SPOTIFY_ID_LENGTH } from './constants'
import {
  ARTIST_NAME_CORRECTIONS,
  TRACK_NAME_CORRECTIONS,
} from './manualCorrections'

const API_BASE_URL = 'https://api.spotify.com/v1'
const ACCOUNTS_BASE_URL = 'https://accounts.spotify.com/api'

const FEATURE_PREFIXES = [' ft. ', ' feat. ']

// https://stackoverflow.com/questions/43159887/make-a-single-property-optional-in-typescript#answer-61108377
// type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>
// export type YoutubeTrackSearch = Optional<YoutubeTrack, 'year'>
export type YoutubeTrackSearch = Pick<
  YoutubeTrack,
  'artist' | 'link' | 'name'
> & {
  year?: number
}

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

export const getTracks = async (trackIds: string[]) => {
  try {
    const res: AxiosResponse<{
      tracks: SpotifyTrack[]
    }> = await axios({
      method: 'get',
      url: `${API_BASE_URL}/tracks`,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
      params: {
        ids: trackIds.join(','),
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
    console.error('getTracks failed')
    process.exit()
  }
}

export const findTrack = async (
  track: YoutubeTrackSearch,
  retry = true
): Promise<SearchResults<SpotifyTrack>> => {
  try {
    const { name, artist, link, year } = track

    const params: SpotifySearchParams = {
      q: `track:${name} artist:${artist}`,
      type: 'track',
      limit: 3,
    }

    if (year) {
      params.q += ` year:${year}`
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

    if (res.data.tracks.items.length === 0 && retry) {
      return await findTrack(
        {
          ...track,
          name: normalizeTrackName(name),
          artist: normalizeArtistName(artist),
          year: normalizeYear(track as YoutubeTrack),
        },
        false // do not retry again
      )
    }

    if (!res.data.tracks.items.length) {
      console.log(res.request)
    }

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
  let url: URL | null = null

  try {
    url = new URL(link)
  } catch {}

  if (url === null) {
    return null
  }

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

export const normalizeArtistName = (name: string) => {
  let normalized = name.replace(/ & /, ' ')

  ARTIST_NAME_CORRECTIONS.forEach((c) => {
    if (normalized.includes(c.original)) {
      normalized = normalized.replace(c.original, c.corrected)
    }
  })

  return normalized
}
export const normalizeTrackName = (name: string) => {
  let normalized = name

  FEATURE_PREFIXES.forEach((pref) => {
    const ftIdx = name.toLowerCase().indexOf(pref)
    if (ftIdx !== -1) {
      normalized = normalized.substring(0, ftIdx)
    }
  })

  TRACK_NAME_CORRECTIONS.forEach((c) => {
    if (normalized.includes(c.original)) {
      normalized = normalized.replace(c.original, c.corrected)
    }
  })

  return normalized
}

export const normalizeYear = (track: YoutubeTrack) => {
  // TODO: apply manual year fixes based on track properties
  // eg: clipping.__Wriggle EP__2016 -> re-released in 2023
  // for now, prefer to just widen search by omitting year
  return undefined
}
