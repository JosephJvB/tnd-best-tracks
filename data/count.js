const { readdirSync, readFileSync } = require('fs')

const totalTracks = readdirSync(__dirname + '/tracklists').reduce(
  (acc, fileName) => {
    const trackList = JSON.parse(
      readFileSync(__dirname + '/tracklists/' + fileName, 'utf8')
    )
    acc += trackList.length
    return acc
  },
  0
)

console.log({ totalTracks })
