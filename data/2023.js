const fs = require('fs')

const all = require('./tnd-playlist-items.json')

const recent = all
  .filter((v) => new Date(v.snippet.publishedAt).getFullYear() === 2023)
  .map(({ id, snippet: { description, publishedAt, title } }) => ({
    id,
    snippet: {
      title,
      publishedAt,
      description,
    },
  }))

fs.writeFileSync(
  __dirname + '/../../tony-2/test/data/2023-videos.json',
  JSON.stringify(recent, null, 2)
)
