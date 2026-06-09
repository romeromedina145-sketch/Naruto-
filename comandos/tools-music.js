import axios from 'axios'
import fs from 'fs'
import { uploadToCatbox } from '../lib/catbox.js'

const AUDD_TOKEN = 'bb07d4dcfde5de3140a9bc484816690e'

const musicFinder = {
name: 'music',
alias: ['shazam', 'msc'],
category: 'tools',
noPrefix: true,

run: async (conn, m) => {
    try {

        const quoted = m.quoted || m

        const isAudio = quoted?.message?.audioMessage
        const isVideo = quoted?.message?.videoMessage

        if (!isAudio && !isVideo) {
            return m.reply('🎵 Responde a un audio o video.')
        }

        await conn.sendMessage(
            m.chat,
            {
                react: {
                    text: '🔎',
                    key: m.key
                }
            }
        )

        const media = await quoted.download()

        const filePath = `./tmp/${Date.now()}.mp3`

        fs.writeFileSync(filePath, media)

        const audioUrl = await uploadToCatbox(filePath)

        const { data } = await axios.get(
            `https://api.audd.io/?url=${encodeURIComponent(audioUrl)}&return=apple_music,spotify&api_token=${AUDD_TOKEN}`
        )

        if (!data?.result) {

            fs.unlinkSync(filePath)

            return m.reply(
                '❌ No pude reconocer la canción.'
            )
        }

        const song = data.result

        let txt =
            `🎵 *Canción encontrada*\n\n` +
            `🎶 *Título:* ${song.title || 'Desconocido'}\n` +
            `🎤 *Artista:* ${song.artist || 'Desconocido'}\n` +
            `💿 *Álbum:* ${song.album || 'Desconocido'}\n` +
            `📅 *Fecha:* ${song.release_date || 'Desconocida'}\n`

        if (song.song_link) {
            txt += `\n🔗 ${song.song_link}`
        }

        await conn.sendMessage(
            m.chat,
            {
                text: txt
            },
            {
                quoted: m
            }
        )

        fs.unlinkSync(filePath)

        await conn.sendMessage(
            m.chat,
            {
                react: {
                    text: '✅',
                    key: m.key
                }
            }
        )

    } catch (error) {

        console.log(error)

        await conn.sendMessage(
            m.chat,
            {
                react: {
                    text: '❌',
                    key: m.key
                }
            }
        )

        m.reply(
            `❌ Error: ${error.message}`
        )
    }
}

}

export default musicFinder
