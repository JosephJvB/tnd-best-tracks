const { writeFileSync } = require('fs')
const j = require('./tnd-playlist-items.json')

writeFileSync(
  __dirname + '/data/test.json',
  JSON.stringify(j[0].snippet.description.split('\n'), null, 2)
)
writeFileSync(
  __dirname + '/data/test2.json',
  JSON.stringify(j[0].snippet.description.split('\n\n'), null, 2)
)
writeFileSync(
  __dirname + '/data/test3.json',
  JSON.stringify(j[0].snippet.description.split('\n\n\n'), null, 2)
)
