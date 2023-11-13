declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GOOGLE_SA_PRIVATE_KEY: string
      GOOGLE_SA_CLIENT_EMAIL: string
      YOUTUBE_API_KEY: string
      SPOTIFY_CLIENT_ID: string
      SPOTIFY_CLIENT_SECRET: string
      SPOTIFY_CALLBACK_STATE: string
      JEST_WORKER_ID?: string
    }
  }
}

export {}
