# spreadsheet integration

1. Make forbidden tracks public:
  - save forbidden tracks to spreadsheet. that's all.

2. Use spreadsheet as source for handling manual fixes to missing tracks. Also run it on CRON? I think I'm trying to add too much at once
  1. want it running on cron to update:
    1. current year playlist with latest youtube tracks
    2. any playlists which have had tracks manually mapped in spreadsheet
      - I want to move away from the manual fixing I did originally

It shouldn't ever remove tracks from playlists if
1. youtube video gets removed
2. spotify song gets removed
Code won't care / handle these cases


### Flow

1. pull youtube videos
2. parse descriptions
  - but no more manual fixing / normalizing
3. pull spreadsheet
4. lookup spotify tracks
  - each youtube track can map to more than one spotify track in cases where Tony lists more than one
  1. those with spotify ids, we get those tracks by batch
    - spotify ids can come from youtube track.link
    - or from spreadsheet
  2. those without, we search for 1 by 1
    - still do retry logic
    - but no more manual fixing / normalizing
5. For youtube tracks by year
  1. for each youtube track, try to map to spotify track
  2. lookup existing playlists


### Rewrite

I wanna re-write the project for a couple reasons
1. run it from cloud on CRON
2. no more manual fixes / normalizing
3. pulls from & writes to google sheet
3. x1 youtube track maps to one or more spotify track(s)