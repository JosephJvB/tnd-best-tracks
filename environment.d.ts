declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SPREADSHEET_ID: string
      GOOGLE_PRIVATE_KEY: string
      YOUTUBE_API_KEY: string
      SPOTIFY_CLIENT_ID: string
      SPOTIFY_CLIENT_SECRET: string
      SPOTIFY_CALLBACK_STATE: string
      JEST_WORKER_ID?: string
    }
  }
}

export {}
