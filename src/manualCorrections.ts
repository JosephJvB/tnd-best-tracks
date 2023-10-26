export type ManualCorrection = {
  original: string
  corrected: string
}
export const MANUAL_CORRECTIONS: ManualCorrection[] = [
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
]
