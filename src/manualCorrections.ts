export type ManualCorrection = {
  original: string
  corrected: string
}
export const DESCRIPTION_CORRECTIONS: ManualCorrection[] = [
  {
    original: 'Brain Tentacles -"The Sadist"',
    corrected: 'Brain Tentacles - "The Sadist"',
  },
  {
    original: 'SORRY NOT SORRY\nDogtooth: https',
    corrected: 'SORRY NOT SORRY\nhttps',
  },
  {
    original: 'Model/Actriz- Damocles',
    corrected: 'Model/Actriz - Damocles',
  },
  {
    original: `Bonnie Prince Billy \"I've Made Up My Mind`,
    corrected: `Bonnie Prince Billy - \"I've Made Up My Mind`,
  },
  {
    original: 'ft. Charlie Wilson\nReview: https',
    corrected: 'ft. Charlie Wilson\nhttps',
  },
  {
    original: [
      'Björk / Fever Ray co-remixes:',
      'http://bjork.lnk.to/fctheknife ',
      'http://bjork.lnk.to/fcfeverray ',
      'http://bjork.lnk.to/bjorkremix',
    ].join('\n'),
    corrected: [
      [
        'Björk - Features Creatures (The Knife Remix)',
        'http://bjork.lnk.to/fctheknife',
      ],
      [
        'Björk - Features Creatures (Fever Ray Remix)',
        'http://bjork.lnk.to/fcfeverray',
      ],
      [
        'Fever Ray - This Country Makes It Hard To Fuck (Björk Remix)',
        'https://bjork.lnk.to/bjorkremix',
      ],
    ]
      .map((p) => p.join('\n'))
      .join('\n\n'),
  },
  {
    original: [
      'Nails / Full of Hell split:',
      'http://www.theneedledrop.com/articles/2016/11/nails-full-of-hell-split-7',
    ].join('\n'),
    corrected: [
      [
        'Nails / Full of Hell - No Longer Under Your Control',
        'https://open.spotify.com/track/6KIoYx5Xee7TyxNEOtl29k?si=deced926fa6c48e2',
      ],
      [
        'Nails / Full of Hell - Thy Radiant Garotte Exposed',
        'https://open.spotify.com/track/3XTUzlzeuaLlT7ae17pF70?si=1a0f39504b4c47b3',
      ],
      [
        'Nails / Full of Hell - Bez Bólu',
        'https://open.spotify.com/track/4WS4lLtwZQ6Ezen9Q0oFqD?si=53b1ce902cd94bc7',
      ],
    ]
      .map((p) => p.join('\n'))
      .join('\n\n'),
  },
  {
    original: [
      'Disclosure - Where You Come From (Extended Mix) / Love Can Be So Hard / Where Angels Fear To Tread / Moonlight',
      'https://youtu.be/wslO7YNg3S0',
      'https://youtu.be/4CCfYi1u8Y4',
      'https://youtu.be/stixXyfsJfE',
      'https://youtu.be/yTF7LwR9YEc',
    ].join('\n'),
    corrected: [
      [
        'Disclosure - Where You Come From (Extended Mix)',
        'https://youtu.be/wslO7YNg3S0',
      ],
      ['Disclosure - Love Can Be So Hard', 'https://youtu.be/4CCfYi1u8Y4'],
      [
        'Disclosure - Where Angels Fear To Tread',
        'https://youtu.be/stixXyfsJfE',
      ],
      ['Disclosure - Moonlight', 'https://youtu.be/yTF7LwR9YEc'],
    ]
      .map((p) => p.join('\n'))
      .join('\n\n'),
  },
  {
    original: 'JP Moregun Mixtape\nhttp://www.jpmoregun.com/',
    corrected: [
      'JP Moregun - Street Signs',
      'https://open.spotify.com/track/1sB9RQHc2ZGFwUNC00YirL?si=74f1c85a180d46b4',
    ].join('\n'),
  },
  {
    original: [
      'Aesop Rock / Homeboy Sandman EP',
      'http://www.theneedledrop.com/articles/2016/10/aesop-rock-homeboy-sandman-lice-two-still-buggin',
    ].join('\n'),
    corrected: [
      'Lice, Aesop Rock, Homeboy Sandman - Oatmeal Cookies',
      'https://open.spotify.com/track/17AAfKkchZ7GTBH48ODdoF?si=abe23d9591f94927',
    ].join('\n'),
  },
  {
    original: 'White Suns - Psychic Drift',
    corrected: 'White Suns - Korea',
  },
  {
    original: "WAVVES - Daisy / You're Welcome",
    corrected: [
      'WAVVES - Daisy\nhttps://open.spotify.com/track/6pLvN4ZpGZAIctequZFejE',
      "WAVVES - You're Welcome\nhttps://open.spotify.com/track/6ZFidrzLRVPZkUZuEdWSX5",
    ].join('\n\n'),
  },
  {
    original: [
      'Brockhampton - Gold / Heat / Face',
      'http://www.theneedledrop.com/articles/2017/5/brockhampton-gold',
      'https://youtu.be/Jpu0JZxDz-w',
      'https://youtu.be/_nWYiEq4wd0',
    ].join('\n'),
    corrected: [
      'Brockhampton - Gold\nhttps://open.spotify.com/track/7HRv1sYuwgoea1m0JRvChV',
      'Brockhampton - Heat\nhttps://open.spotify.com/track/2maEFaoAyNjQVv14Hm4esN',
      'Brockhampton - Face\nhttps://open.spotify.com/track/5bknBRjKJZ643DAN2w8Yoy',
    ].join('\n\n'),
  },
  {
    original: [
      'Kirin J Callinan - Down 2 Hang / Living Each Day',
      'https://soundcloud.com/terrible-records/kirin-j-callinan-living-each-day',
      'https://soundcloud.com/terrible-records/kirin-j-callinan-down-2-hang',
    ].join('\n'),
    corrected: [
      'Kirin J Callinan - Down 2 Hang\nhttps://open.spotify.com/track/4QwsYsR1UasL8gP0DBYQAb',
      'Kirin J Callinan - Living Each Day\nhttps://open.spotify.com/track/0kQD7jcpErQ7L7TSWxZpcw',
    ].join('\n\n'),
  },
  {
    original: 'Liars - Coins In My Caged Fist / The Grand Delusional',
    corrected: [
      'Liars - Coins In My Caged Fist\nhttps://open.spotify.com/track/4Tv9F9Q8mgr569pEl21JV9',
      'Liars - The Grand Delusional\nhttps://open.spotify.com/track/2nfrMSGsqtlPrHSjicV2ET',
    ].join('\n\n'),
  },
  {
    original: 'Zomby - ZKITTLES\nhttps://youtu.be/ZFnPbAzNLSk',
    corrected:
      'Zomby - ZKITTLES\nhttps://open.spotify.com/track/6nxuygxyYOeQiqHbGY7Tzh',
  },
  {
    original:
      'Kirin J Callinan - S.A.D\nhttp://www.theneedledrop.com/articles/2017/5/kirin-j-callinan-sad',
    corrected:
      'Kirin J Callinan - S.A.D\nhttps://open.spotify.com/track/6PKyEhTtTgwl3S6fdF54y0',
  },
  {
    original: 'PWR BTTM - Answer My Text\nhttps://youtu.be/TlNHAkXDS10',
    corrected:
      'PWR BTTM - Answer My Text\nhttps://open.spotify.com/track/4d6PqLM7AswcwXZztMou7J',
  },
  {
    original: 'GFOTY - Poison / Tongue\nhttps://youtu.be/qzo2vvUWLoo',
    corrected: [
      'GFOTY - Poison\nhttps://youtu.be/qzo2vvUWLoo',
      'GFOTY - Tongue\nhttps://youtu.be/qzo2vvUWLoo',
    ].join('\n\n'),
  },
  {
    original:
      'Fabiana Palladino - Mystery / Ruthven - Evil\nhttp://www.theneedledrop.com/articles/2017/11/fabiana-palladino-mystery-ruthven-evil',
    corrected: [
      'Fabiana Palladino - Mystery\nhttps://youtu.be/qzo2vvUWLoo',
      'Ruthven - Evil\nhttps://youtu.be/qzo2vvUWLoo',
    ].join('\n\n'),
  },
  {
    original:
      'The Voidz - Leave It In My Dreams & QYURRYUS\nhttp://www.theneedledrop.com/articles/2018/1/the-voidz-leave-it-in-my-dreams',
    corrected: [
      'The Voidz - Leave It In My Dreams\nhttps://youtu.be/qzo2vvUWLoo',
      'The Voidz - QYURRYUS\nhttps://youtu.be/qzo2vvUWLoo',
    ].join('\n\n'),
  },
  {
    original:
      'Janelle Monae - Make Me Feel / Django Jane\nhttps://www.youtube.com/watch?v=tGRzz0oqgUE\nhttps://www.youtube.com/watch?v=mTjQq5rMlEY',
    corrected: [
      'Janelle Monae - Make Me Feel\nhttps://youtu.be/qzo2vvUWLoo',
      'Janelle Monae - Django Jane\nhttps://youtu.be/qzo2vvUWLoo',
    ].join('\n\n'),
  },
  {
    original:
      'Kamasi Washington - Fists of Fury / The Space Travelers Lullaby\nhttps://itunes.apple.com/us/album/fists-of-fury/1363033047?i=1363034076\nhttps://itunes.apple.com/us/album/the-space-travelers-lullaby/1363033047?i=1363034949',
    corrected: [
      'Kamasi Washington - Fists of Fury\nhttps://youtu.be/qzo2vvUWLoo',
      'Kamasi Washington - The Space Travelers Lullaby\nhttps://youtu.be/qzo2vvUWLoo',
    ].join('\n\n'),
  },
  {
    original:
      'Nicki Minaj - Barbie Tingz / Chun-Li\nhttps://itunes.apple.com/us/album/chun-li/1371043173?i=1371043175\nhttps://itunes.apple.com/us/album/barbie-tingz/1370203547?i=1370204600',
    corrected: [
      'Nicki Minaj - Barbie Tingz\nhttps://youtu.be/qzo2vvUWLoo',
      'Nicki Minaj - Chun-Li\nhttps://youtu.be/qzo2vvUWLoo',
    ].join('\n\n'),
  },
  {
    original:
      'André 3000 - Me&My / Look Ma No Hands\nhttp://www.theneedledrop.com/articles/2018/5/andr-3000-memy-to-bury-your-parents-look-ma-no-hands',
    corrected: [
      'André 3000 - Me&My\nhttps://youtu.be/qzo2vvUWLoo',
      'André 3000 - Look Ma No Hands\nhttps://youtu.be/qzo2vvUWLoo',
    ].join('\n\n'),
  },
  {
    original:
      'Code Orange - 3 Knifes / The Hunt ft. Corey Taylor\nhttps://youtu.be/hoE7AISG7Kc\nhttps://youtu.be/qgs5JzUQpy4',
    corrected: [
      'Code Orange - 3 Knives\nhttps://youtu.be/qzo2vvUWLoo',
      'Code Orange - The Hunt ft. Corey Taylor\nhttps://youtu.be/qzo2vvUWLoo',
    ].join('\n\n'),
  },
  {
    original:
      'Big Sean - "Bounce Back" & "No More Interviews"\nhttp://www.theneedledrop.com/articles/2016/11/big-sean-bounce-back-no-more-interviews',
    corrected: [
      'Big Sean - Bounce Back\nhttps://youtu.be/qzo2vvUWLoo',
      'Big Sean - No More Interviews\nhttps://youtu.be/qzo2vvUWLoo',
    ].join('\n\n'),
  },
  {
    original:
      'Bonnie "Prince" Billy - Blueberry Jam\nhttps://youtu.be/eJf2iY2Kbx0',
    corrected:
      'Bonnie "Prince" Billy - Blueberry Jam\nhttps://open.spotify.com/track/0gdye9nvTsXMYOQyIatwGR',
  },
  {
    original:
      'FKi 1st - Good Gas ft. 2Chainz & A$AP Ferg\nhttps://youtu.be/VGceCqZL6JQ',
    corrected:
      'FKi 1st - Good Gas ft. 2Chainz & A$AP Ferg\nhttps://open.spotify.com/track/2o8VvyPvmjhDid7zk7XNHV',
  },
  // i could actually handle this by code..
  // if trackname.includes('/') && check that links.length == length of trackname split('/')
  // then combine [artist + trackname[0], artist + trackname[1], ...]
  {
    original:
      'Clarence Clarity - Anthropic Principles / Telenovela\nhttps://www.youtube.com/watch?v=cn3OMeiYTgk\nhttps://www.youtube.com/watch?v=_fzqIwIdpGk',
    corrected: [
      'Clarence Clarity - Anthropic Principles\nhttps://www.youtube.com/watch?v=cn3OMeiYTgk',
      'Clarence Clarity - Telenovela\nhttps://www.youtube.com/watch?v=_fzqIwIdpGk',
    ].join('\n\n'),
  },
  {
    original:
      'Kitten - Secrets / Mercury\nhttps://youtu.be/ZRJ1WSNYhhM\nhttps://youtu.be/ShlQ2k5YfjU',
    corrected: [
      'Kitten - Secrets\nhttps://youtu.be/ZRJ1WSNYhhM',
      'Kitten - Mercury\nhttps://youtu.be/ShlQ2k5YfjU',
    ].join('\n\n'),
  },
  {
    original:
      'Carly Rae Jepsen - Now That I Found You / No Drug Like Me\nhttps://youtu.be/cyP_JyP1QJg\nhttps://youtu.be/mVocX_uNTIU',
    corrected: [
      'Carly Rae Jepsen - Now That I Found You\nhttps://youtu.be/cyP_JyP1QJg',
      'Carly Rae Jepsen - No Drug Like Me\nhttps://youtu.be/mVocX_uNTIU',
    ].join('\n\n'),
  },
  {
    original:
      'Matmos - Breaking Bread & Thermoplastic Riot Shield\nhttps://youtu.be/ilq8HsRk2BQ\nhttps://youtu.be/zWO2VdDqdXE',
    corrected: [
      'Matmos - Breaking Bread\nhttps://youtu.be/ilq8HsRk2BQ',
      'Matmos - Thermoplastic Riot Shield\nhttps://youtu.be/zWO2VdDqdXE',
    ].join('\n\n'),
  },
  {
    original:
      'Vampire Weekend - This Life / Unbearably White\nhttps://youtu.be/KIGNNOZ0948\nhttps://youtu.be/bkBjoY7eyvU',
    corrected: [
      'Vampire Weekend - This Life\nhttps://youtu.be/KIGNNOZ0948',
      'Vampire Weekend - Unbearably White\nhttps://youtu.be/bkBjoY7eyvU',
    ].join('\n\n'),
  },
  {
    original:
      "Nails - I Don't Want to Know You & Endless Resistance ft. Max Cavalera\nhttps://youtu.be/b8mNK0vAk2s\nhttps://youtu.be/k6E5R6mkh8k",
    corrected: [
      "Nails - I Don't Want to Know You\nhttps://youtu.be/b8mNK0vAk2s",
      'Nails - Endless Resistance ft. Max Cavalera\nhttps://youtu.be/k6E5R6mkh8k',
    ].join('\n\n'),
  },
  {
    original:
      'Bon Iver - Hey Ma / U (Man Like)\nhttps://www.youtube.com/watch?v=HDAKS18Gv1U\nhttps://www.youtube.com/watch?v=Hs5rXRPC0rc\nReview: https://www.youtube.com/watch?v=kNpsREz5PwY',
    corrected: [
      'Bon Iver - Hey Ma\nhttps://www.youtube.com/watch?v=HDAKS18Gv1U',
      'Bon Iver - U (Man Like)\nhttps://www.youtube.com/watch?v=Hs5rXRPC0rc',
    ].join('\n\n'),
  },
  {
    original:
      'Dreamville - Down Bad / Got Me\nhttps://www.youtube.com/watch?v=ibvxfN7G6Gs\nhttps://www.youtube.com/watch?v=kcYsb1-ffuQ',
    corrected: [
      'Dreamville - Down Bad\nhttps://www.youtube.com/watch?v=ibvxfN7G6Gs',
      'Dreamville - Got Me\nhttps://www.youtube.com/watch?v=kcYsb1-ffuQ',
    ].join('\n\n'),
  },
  {
    original:
      'A$AP Ferg - Floor Seats / WAM ft. MadeinTYO\nhttps://youtu.be/2U-vrd6JhBY\nhttps://www.youtube.com/watch?v=3nhH-t15jEc',
    corrected: [
      'A$AP Ferg - Floor Seats\nhttps://youtu.be/2U-vrd6JhBY',
      'A$AP Ferg - WAM ft. MadeinTYO\nhttps://www.youtube.com/watch?v=3nhH-t15jEc',
    ].join('\n\n'),
  },
  {
    original:
      'Lana Del Rey - F*** It I Love You & The Greatest\nhttps://youtu.be/LrSX_OcpeJg',
    corrected: [
      'Lana Del Rey - Fuck It I Love You\nhttps://youtu.be/LrSX_OcpeJg',
      'Lana Del Rey - The Greatest\nhttps://youtu.be/LrSX_OcpeJg',
    ].join('\n\n'),
  },
  {
    original:
      "Bonnie 'Prince' Billy - At the Back of the Pit\nhttps://youtu.be/LhMz9pvRNCQ",
    corrected: [
      "Bonnie 'Prince' Billy - At the Back of the Pit\nhttps://open.spotify.com/track/5O1apNU3Emu6BkFzIEPiJM?si=4667a6cbddcd4620",
    ].join('\n\n'),
  },
]

export const TRACK_NAME_CORRECTIONS: ManualCorrection[] = [
  {
    original: 'Wriggle EP',
    corrected: 'Wriggle',
  },
  {
    original: 'Youre The Problem Here',
    corrected: 'You are The Problem Here',
  },
  {
    original: 'Touble Adjusting',
    corrected: 'Trouble Adjusting',
  },
  {
    original: 'The Lord of Lightning Vs. Balrog',
    corrected: 'The Lord of Lightning',
  },
  {
    original: 'SeanPaulWasNeverThereToGiveMeTheLight',
    corrected: 'SeanPaul',
  },
  {
    original: 'Stangers Kiss',
    corrected: 'Strangers Kiss Duet with Angel Olsen',
  },
  {
    original: 'Rudolph the Rednose Reindeer',
    corrected: 'Rudolph The Red Nosed Reindeer',
  },
  {
    original: 'Yume wo miyou',
    corrected: 'Yumewomiyou',
  },
  {
    original: 'Dhorimviskha Digest',
    corrected: 'Vleztemtraiv',
  },
  {
    original: 'Machine, Man & Moster',
    corrected: 'Machine, Man & Monster',
  },
  {
    original: '2STINGS',
    corrected: '2 Stings',
  },
  {
    original: 'Old N*ggas',
    corrected: 'Old n',
  },
  {
    original: 'Double Negative Triptych',
    corrected: 'Double Negative',
  },
  {
    original: 'Riding/CUT HER HAIR',
    corrected: 'Riding',
  },
  {
    original: 'Alnair In August',
    corrected: 'Dawn and Gaze',
  },
  {
    original: 'Blood on the Fang',
    corrected: 'Blood of the Fang',
  },
]
export const ARTIST_NAME_CORRECTIONS: ManualCorrection[] = [
  {
    original: 'Drug Dealer',
    corrected: 'Drugdealer',
  },
  {
    original: 'D.R.A.M.',
    corrected: 'DRAM',
  },
  {
    original: 'Slaves',
    corrected: 'SOFT PLAY',
  },
  {
    original: 'Dangermouse',
    corrected: 'Danger Mouse',
  },
  {
    original: 'WESTSIDEDOOM',
    corrected: 'Westside Gunn MF DOOM',
  },
  {
    original: 'DADHELO',
    corrected: 'Chepang',
  },
  {
    original: 'A.A.L. (Against All Logic)',
    corrected: 'Against All Logic',
  },
  {
    original: 'Koenji Hyakkei',
    corrected: 'Koenjihyakkei',
  },
  {
    original: 'YBN Cordae',
    corrected: 'Cordae',
  },
  {
    original: 'Adrienne Lenker',
    corrected: 'Adrianne Lenker',
  },
  {
    original: 'Sinstarr',
    corrected: 'Sinistarr',
  },
  {
    original: 'J.I.D, J. Cole',
    corrected: 'J.I.D J. Cole',
  },
  {
    original: 'Karen O and Danger Mouse',
    corrected: 'Karen O Danger Mouse',
  },
  {
    original: 'Chrsitian Scott aTunde Adjuah',
    corrected: 'Christian Scott aTunde Adjuah',
  },
  {
    original: 'Gessafelstein',
    corrected: 'Gesaffelstein',
  },
  {
    original: '(Sandy) Alex G',
    corrected: 'Alex G',
  },
  {
    original: 'Caroline Polacheck',
    corrected: 'Caroline Polachek',
  },
  {
    original: "Jeff Lynne's ELO",
    corrected: 'Electric Light Orchestra',
  },
  {
    original: 'The Black Lips',
    corrected: 'Black Lips',
  },
]
// link is most reliably unique. less risk of affecting other songs
export const FIX_ARTIST_FROM_LINK_CORRECTIONS: ManualCorrection[] = [
  {
    original: 'https://youtu.be/4Mvc7W8Hkp0',
    corrected: 'Dolan Beats',
  },
  {
    original: 'https://youtu.be/s5zfbNiuOyk',
    corrected: 'Ryan Pollie',
  },
  {
    original: 'https://krallice.bandcamp.com/track/rank-mankind',
    corrected: 'Krallice',
  },
  {
    original: 'https://youtu.be/lYATz3STgew',
    corrected: 'Juelz Santana',
  },
  {
    original: 'https://youtu.be/L4WiZ8pdIvM',
    corrected: 'City Morgue',
  },
  {
    original: 'https://youtu.be/h_GwO10HroY',
    corrected: 'Sia',
  },
  {
    original: 'https://youtu.be/S-epdHG-ZS0',
    corrected: 'Sia',
  },
  {
    original: 'https://youtu.be/2dgOVuYp9SU',
    corrected: 'Laura Marling',
  },
  {
    original: 'https://www.youtube.com/watch?v=__Wt9Rg-M8E',
    corrected: 'Young Thug',
  },
  {
    original: 'https://www.youtube.com/watch?v=Epka2clixz4',
    corrected: '88rising',
  },
  {
    original:
      'https://laurajanegracethedevouringmothers.bandcamp.com/album/bought-to-rot',
    corrected: 'Laura Jane Grace',
  },
  {
    original: 'https://fanlink.to/StepsMickJenkins',
    corrected: 'Isaac Zale Mick Jenkins',
  },
  {
    original: 'https://open.spotify.com/album/4dVxavcdnxTHyrM4U5U0kD',
    corrected: 'KH Four Tet',
  },
  {
    original: 'https://youtu.be/HvgG-kifQnI',
    corrected: 'Kai Whiston',
  },
  {
    original: 'https://youtu.be/oaTkJ9GNYJ4',
    corrected: 'Isaac Zale',
  },
  {
    original: 'https://www.adultswim.com/music/singles-2018/52',
    corrected: 'The Professionals',
  },
]
export const FIX_TRACK_FROM_LINK_CORRECTIONS: ManualCorrection[] = [
  {
    original: 'https://youtu.be/c-0mSEZDm18',
    corrected: 'Pure Comedy',
  },
  {
    original: 'https://youtu.be/qP8GJj8lAI8',
    corrected: 'Pain Killer',
  },
  {
    original: 'https://youtu.be/NEoVjmfYlJ8',
    corrected: '4 Gold Chains',
  },
  {
    original:
      'http://www.theneedledrop.com/articles/2016/7/gucci-mane-first-day-out-tha-feds',
    corrected: '1st Day out Tha Feds',
  },
  {
    original:
      'http://www.theneedledrop.com/articles/2016/7/hot-dad-pokmon-go-pok-dont-stop',
    corrected: "Poké Don't Stop",
  },
  {
    original: 'https://soundcloud.com/fatherdaughter/rose-droll-hush',
    corrected: 'Rose Droll',
  },
  {
    original: 'https://youtu.be/LrVWkW7d1Vs',
    corrected: 'Multi Millionaire',
  },
  {
    original: 'https://www.youtube.com/watch?v=-5GxIUtt-N0',
    corrected: 'Painkiller Paradise',
  },
  {
    original: 'https://youtu.be/ET0y32ziV_c',
    corrected: 'Easter Sunday',
  },
]
