describe('unit/replacer', () => {
  it('handles newline space newline', () => {
    const line = `Amazon link:\nhttp://amzn.to/1KZmdWI\n\n!!!FAV TRACKS THIS WEEK!!!\n\nMithras - "Between Scylla and Charybdis"\nhttp://www.theneedledrop.com/articles/2016/8/mithras-between-scylla-and-charybdis\n\nAlcest - "Oiseaux de Proie"\nhttp://www.theneedledrop.com/articles/2016/8/alcest-oiseaux-de-proie\n\nJP Moregun Mixtape\nhttp://www.jpmoregun.com/\n\nE-40 - "Petty" ft. Kamaiyah\nhttps://soundcloud.com/e40/e-40-petty-feat-kamaiyah\n \nNorah Jones - "Carry On"\nhttp://www.theneedledrop.com/articles/2016/8/norah-jones-carry-on\n \nyndi halda - "Golden Threads from the Sun"\nhttp://www.theneedledrop.com/articles/2016/8/yndi-halda-golden-threads-from-the-sun\n \nProtomartyr - "Born to Be Wine"\nhttp://www.theneedledrop.com/articles/2016/8/protomartyr-born-to-be-wine\n \nJPEGMAFIA x Freaky - "I Might Vote 4 Donald Trump"\nhttp://www.theneedledrop.com/articles/2016/8/jpegmafia-x-freaky-i-might-vote-4-donald-trump\n \nStreet Sects - "Featherweight Hate"\nhttp://www.theneedledrop.com/articles/2016/8/street-sects-featherweight-hate\n \nBeach Slang - "Punks in a Disco Bar"\nhttp://www.theneedledrop.com/articles/2016/8/beach-slang-punks-in-a-disco-bar\n\n!!!WORST TRACKS THIS WEEK!!!\n\ngrimes - medieval warfare\n\nchainsmokers - closer ft. halsey\n\ntove lo - cool girl\n\n===================================\nSubscribe: http://bit.ly/1pBqGCN\n\nOfficial site: http://theneedledrop.com\n\nTND Twitter: http://twitter.com/theneedledrop\n\nTND Facebook: http://facebook.com/theneedledrop\n\nSupport TND: http://theneedledrop.com/support\n===================================\n\nY\'all know this is just my opinion, right?`

    const replaced = line.replace(/\n \n/g, '\n\n')

    expect(replaced).not.toEqual(line)
  })

  it('removes parens', () => {
    const name = 'POP/STARS (ft. Madison Beer, (G)I-DLE, Jaira Burns)'

    const openParensIdx = name.indexOf('(')
    const closeParensIdx = name.lastIndexOf(')')

    const first = name.substring(0, openParensIdx).trim()
    const second = name.substring(closeParensIdx + 1).trim()

    expect(first).toBe('POP/STARS')
    expect(second).toBe('')

    const res = first + second

    expect(res).toBe('POP/STARS')
  })
})
