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
    original: 'GHOSTEMANE X CLAMS CASINO',
    corrected: 'GHOSTEMANE CLAMS CASINO',
  },
]
// link is most reliably unique
export const FIX_ARTIST_FROM_LINK_CORRECTIONS: ManualCorrection[] = [
  {
    original: 'https://youtu.be/4Mvc7W8Hkp0',
    corrected: 'Dolan Beats',
  },
  {
    original: 'https://youtu.be/s5zfbNiuOyk',
    corrected: 'Ryan Pollie',
  },
]
export const FIX_TRACK_FROM_LINK_CORRECTIONS: ManualCorrection[] = []
