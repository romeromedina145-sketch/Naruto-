import { config } from '../config.js'
import axios from 'axios'

const youtubeAudio = {
    name: 'play',
    alias: ['audio', 'yta'],
    category: 'descargas',
    desc: 'Busca y descarga audio de YouTube',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {

        if (!text) {
            return m.reply(
                `*${config.visuals.emoji2}* Por favor, ingresa el nombre de una canción o un enlace de YouTube.`
            )
        }

        await conn.sendMessage(m.chat, {
            react: {
                text: '🔍',
                key: m.key
            }
        })

        try {

            let videoUrl = ''
            let firstResult = null

            const isUrl = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(text)

            if (isUrl) {

                videoUrl = text

            } else {

                const { data: searchRes } = await axios.get(
                    `https://api.delirius.store/search/ytsearch?q=${encodeURIComponent(text)}`
                )

                if (
                    !searchRes?.status ||
                    !searchRes?.data ||
                    !searchRes.data.length
                ) {
                    return m.reply('No se encontraron resultados.')
                }

                firstResult = searchRes.data[0]
                videoUrl = firstResult.url

                const infoText =
`*❀ YouTube Audio ❀*

*= Título »*
> ${firstResult.title}
*= Canal »*
> ${firstResult.author?.name || 'Desconocido'}
*= Publicado »*
> ${firstResult.publishedAt || 'Desconocido'}
*= Duración »*
> ${firstResult.duration || 'Desconocida'}
*= Vistas »*
> ${firstResult.views?.toLocaleString() || '0'}
*= Enlace »*
> ${videoUrl}

_Enviando audio, espera un momento..._`

                await conn.sendMessage(
                    m.chat,
                    {
                        image: {
                            url: firstResult.image
                        },
                        caption: infoText
                    },
                    {
                        quoted: m
                    }
                )
            }

            const { data: audioRes } = await axios.get(
                `https://api.delirius.store/download/ytmp3?url=${encodeURIComponent(videoUrl)}`
            )

            if (!audioRes?.status) {
                return m.reply('Error al descargar el audio.')
            }

            const audioData = audioRes.data

            await conn.sendMessage(
                m.chat,
                {
                    audio: {
                        url: audioData.download
                    },
                    mimetype: 'audio/mpeg',
                    fileName: `${audioData.title || 'audio'}.mp3`
                },
                {
                    quoted: m
                }
            )

            await conn.sendMessage(m.chat, {
                react: {
                    text: '✅',
                    key: m.key
                }
            })

        } catch (e) {

            console.log(e)

            await conn.sendMessage(m.chat, {
                react: {
                    text: '✖️',
                    key: m.key
                }
            })

            m.reply(
                `*${config.visuals.emoji2}* Error: ${e.response?.data?.message || e.message}`
            )
        }
    }
}

export default youtubeAudio