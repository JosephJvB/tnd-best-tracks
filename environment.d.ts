declare global {
  namespace NodeJS {
    interface ProcessEnv {
      YOUTUBE_API_KEY: string
      SPOTIFY_CLIENT_ID: string
      SPOTIFY_CLIENT_SECRET: string
    }
  }
}

export {}
