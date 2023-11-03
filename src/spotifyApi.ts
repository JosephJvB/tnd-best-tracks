import axios, { AxiosError, AxiosResponse } from 'axios'
import { YoutubeTrack } from './tasks/extractYoutubeTracks'
import {
  PLAYLIST_DESCRIPTION,
  PLAYLIST_NAME_PREFIX,
  SPOTIFY_CALLBACK_URL,
  SPOTIFY_DOMAIN,
  SPOTIFY_ID_LENGTH,
  SPOTIFY_JVB_USERID,
  SPOTIFY_REQUIRED_SCOPES,
} from './constants'
import {
  ARTIST_NAME_CORRECTIONS,
  FIX_ARTIST_FROM_LINK_CORRECTIONS,
  FIX_TRACK_FROM_LINK_CORRECTIONS,
  TRACK_NAME_CORRECTIONS,
} from './manualCorrections'
import { execSync } from 'child_process'

export const API_BASE_URL = 'https://api.spotify.com/v1'
export const ACCOUNTS_BASE_URL = 'https://accounts.spotify.com/api'
export const AUTH_FLOW_INIT_URL =
  'https://accounts.spotify.com?' +
  new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    client_secret: process.env.SPOTIFY_CLIENT_SECRET,
    scope: SPOTIFY_REQUIRED_SCOPES,
    redirect_uri: SPOTIFY_CALLBACK_URL,
    state: process.env.SPOTIFY_CALLBACK_STATE,
  }).toString()

export const BASIC_AUTH = Buffer.from(
  `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
).toString('base64')

const FEATURE_PREFIXES = [
  ' ft. ',
  ' ft ',
  ' feat. ',
  ' feat ',
  ' prod. ',
  ' prod ',
]

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
export type PlaylistItem = {
  added_at: string
  track: SpotifyTrack
}
export type SpotifyPlaylist = {
  id: string
  name: string
  description: string
  public: boolean
  collaborative: boolean
  tracks: {
    total: number
    items: PlaylistItem[]
  }
}
export type PaginatedQuery = {
  limit: number
  offset: number
}
export type GetPlaylistsQuery = PaginatedQuery & {
  user_id: string
}
export type PaginatedResponse<T> = {
  items: T[]
  next?: string
}
export type SubmitCodeResponse = {
  access_token: string
}

let TOKEN = ''
let OAUTH_TOKEN = ''

export const getToken = async () => {
  if (!TOKEN) {
    await setToken()
  }
  return TOKEN
}
export const setOAuthToken = (token: string) => {
  OAUTH_TOKEN = token
}
export const getOAuthToken = () => {
  return OAUTH_TOKEN
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

    // TODO:
    // Big painful discovery
    // exluding "track:" broadens the search, ie: less strict matching
    // probably could just remove "track:" and "artist:" in retries...
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
      return findTrack(
        {
          name: normalizeTrackName(track as YoutubeTrack),
          artist: normalizeArtistName(track as YoutubeTrack),
          year: normalizeYear(track as YoutubeTrack),
          link: normalizeLink(track as YoutubeTrack),
        },
        false // do not retry again
      )
    }

    if (process.env.JEST_WORKER_ID && !res.data.tracks.items.length) {
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

export const beginSpotifyCallback = () => {
  execSync(`open ${AUTH_FLOW_INIT_URL} -a Firefox`)
}
export const submitCode = async (code: string) => {
  try {
    const res: AxiosResponse<SubmitCodeResponse> = await axios({
      method: 'post',
      url: `${ACCOUNTS_BASE_URL}/token`,
      headers: {
        Authorization: `Basic ${BASIC_AUTH}`,
        // axios should set this by default I think!
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      params: {
        code,
        grant_type: 'authorization_code',
        redirect_url: SPOTIFY_CALLBACK_URL,
      },
    })

    return res.data.access_token
  } catch (e) {
    const axError = e as AxiosError
    if (axError.isAxiosError) {
      console.error(axError.response?.data)
      console.error(axError.response?.status)
      console.error('axios error')
    } else {
      console.error(e)
    }
    console.error('submitCode failed')
    process.exit()
  }
}

export const getMyPlaylists = async () => {
  try {
    const myPlaylists: SpotifyPlaylist[] = []

    let hasMore = false
    do {
      const res: AxiosResponse<PaginatedResponse<SpotifyPlaylist>> =
        await axios({
          method: 'get',
          url: `${API_BASE_URL}/me/playlists`,
          headers: {
            Authorization: `Bearer ${OAUTH_TOKEN}`,
          },
          params: {
            limit: 50,
            offset: myPlaylists.length,
          },
        })

      myPlaylists.push(...res.data.items)
      hasMore = !!res.data.next
    } while (hasMore)

    return myPlaylists
  } catch (e) {
    const axError = e as AxiosError
    if (axError.isAxiosError) {
      console.error(axError.response?.data)
      console.error(axError.response?.status)
      console.error('axios error')
    } else {
      console.error(e)
    }
    console.error('getMyPlaylists failed')
    process.exit()
  }
}
export const createPlaylist = async (year: number) => {
  try {
    const newPlaylist: Omit<SpotifyPlaylist, 'id' | 'tracks'> = {
      name: `${PLAYLIST_NAME_PREFIX}${year}`,
      description: PLAYLIST_DESCRIPTION,
      public: true,
      collaborative: false,
    }

    const res: AxiosResponse<SpotifyPlaylist> = await axios({
      method: 'post',
      url: `${API_BASE_URL}/users/${SPOTIFY_JVB_USERID}/playlists`,
      headers: {
        Authorization: `Bearer ${OAUTH_TOKEN}`,
      },
      data: newPlaylist,
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
    console.error('createPlaylist failed')
    process.exit()
  }
}
export const getPlaylistItems = async (playlistId: string) => {
  try {
    const playlistItems: PlaylistItem[] = []
    let hasMore = false
    do {
      const res: AxiosResponse<PaginatedResponse<PlaylistItem>> = await axios({
        method: 'get',
        url: `${API_BASE_URL}/playlists/${playlistId}/tracks`,
        headers: {
          Authorization: `Bearer ${OAUTH_TOKEN}`,
        },
        params: {
          limit: 50,
          offset: playlistItems.length,
        },
      })

      playlistItems.push(...res.data.items)
      hasMore = !!res.data.next
    } while (hasMore)

    return playlistItems
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
  return [] as PlaylistItem[]
}
export const addPlaylistItems = async (
  playlistId: string,
  trackUris: string[]
) => {
  try {
    for (let i = 0; i < trackUris.length; i += 100) {
      const uris = trackUris.slice(i, i + 100)

      await axios({
        method: 'post',
        url: `${API_BASE_URL}/playlists/${playlistId}/tracks`,
        headers: {
          Authorization: `Bearer ${OAUTH_TOKEN}`,
        },
        data: { uris },
      })
    }
  } catch (e) {
    const axError = e as AxiosError
    if (axError.isAxiosError) {
      console.error(axError.response?.data)
      console.error(axError.response?.status)
      console.error('axios error')
    } else {
      console.error(e)
    }
    console.error('addPlaylistItems failed')
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

export const getYearFromPlaylist = (p: SpotifyPlaylist) => {
  if (!p.name.startsWith(PLAYLIST_NAME_PREFIX)) {
    return null
  }

  return parseInt(p.name.replace(PLAYLIST_NAME_PREFIX, ''))
}

// TODO: move this logic to extract step
// will cause many less retries, save a lot of time.
export const normalizeArtistName = (track: YoutubeTrack) => {
  let normalized = track.artist
    .replace(/ & /g, ' ')
    .replace(/ and /g, ' ')
    .replace(/, /g, ' ')
    .replace(/ \/ /gi, ' ')
    .replace(/ \+ /gi, ' ')
    .replace(/ x /gi, ' ')
    .replace(/"/g, '')
    .replace(/'/g, '')

  ARTIST_NAME_CORRECTIONS.forEach((c) => {
    if (normalized.includes(c.original)) {
      normalized = normalized.replace(c.original, c.corrected)
    }
  })

  FIX_ARTIST_FROM_LINK_CORRECTIONS.forEach((c) => {
    if (track.link === c.original) {
      normalized = c.corrected
    }
  })

  return normalized
}
export const normalizeTrackName = (track: YoutubeTrack) => {
  let normalized = track.name
    .replace(/"/g, '')
    .replace(/'/g, '')
    // probably need to review these replacements
    // likely ["/", ",", "&"] in trackname means tony's linked multiple tracks
    .replace(/\//g, '')
    .replace(/\\/g, '')
  // // https://stackoverflow.com/questions/4292468/javascript-regex-remove-text-between-parentheses#answer-4292483
  // .replace(/ *\([^)]*\)*/g, '')

  // prefer this:
  const openParensIdx = normalized.indexOf('(')
  const closeParensIdx = normalized.lastIndexOf(')')
  if (openParensIdx !== 1 && closeParensIdx !== 1) {
    const first = normalized.substring(0, openParensIdx).trim()
    const second = normalized.substring(closeParensIdx + 1)
    normalized = first + second
  }

  FEATURE_PREFIXES.forEach((pref) => {
    const ftIdx = normalized.toLowerCase().indexOf(pref)
    if (ftIdx !== -1) {
      normalized = normalized.substring(0, ftIdx)
    }
  })

  TRACK_NAME_CORRECTIONS.forEach((c) => {
    if (normalized.includes(c.original)) {
      normalized = normalized.replace(c.original, c.corrected)
    }
  })

  FIX_TRACK_FROM_LINK_CORRECTIONS.forEach((c) => {
    if (track.link === c.original) {
      normalized = c.corrected
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

export const normalizeLink = (track: YoutubeTrack) => {
  // TODO: apply manual year fixes based on track properties
  // eg: WAVVES__No Shade__2017 album id in link causes search to fail
  // for now, prefer to just widen search by omitting link
  return ''
}
