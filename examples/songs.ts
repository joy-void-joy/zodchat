import { prompt } from 'zodchat'
import util from 'util'
import zod from 'zod'

const Song = zod
  .object({
    name: zod.string().describe('Name of the song to play'),
    artist: zod.string().describe('Name of the artist of the song'),
    genre: zod
      .string()
      .array()
      .describe('Genre of the song using whimsical words'),
    vibe: zod
      .string()
      .describe('General vibe of the song using whimsical words'),
  })
  .describe('A song to play')

export const Playlist = zod.object({
  name: zod.string().describe('Whimsical name of the playlist'),
  songs: Song.array().describe('Songs to play'),
})

///////////
/// Zodchat
///////////
console.log(
  util.inspect(
    await prompt({
      output_schema: { Playlist },
      system_prompt: 'Please give some chill instrumental songs',
    }),
    { showHidden: false, depth: null, colors: true }
  )
)

// Note that user_prompt can also be an object
// You can also give examples of input-ouotput pairs
console.log(
  util.inspect(
    await prompt({
      system_prompt:
        'Suggest a name for a playlist. Be creative. The playlist name should be indicative of its genre',
      function_name: 'name_playlist',
      output_schema: {
        name: zod.object({
          name: zod.string().describe('Name of the playlist'),
        }),
      },
      examples: [
        [
          { songs: [{ name: 'Eruption of ignorance', artist: 'Otso' }] },
          { name: 'Calm Gardens' },
        ],
        [
          {
            songs: [
              { name: 'maps', artist: 'Emancipator' },
              { name: 'Oktober', artist: 'Bessarin quartett' },
              {
                name: 'Darkly shining - John Lemke Rework',
                artist: 'Piano Interrupted',
              },
            ],
          },
          { name: 'Intense Reflexions' },
        ],
      ],
      user_prompt: {
        songs: [
          { name: 'Destroy the world', artist: 'Kobaryo' },
          { name: 'Her heart', artist: 'Chipzel' },
        ],
      },
      temperature: 0,
    })
  )
)
