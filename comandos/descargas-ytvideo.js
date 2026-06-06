import { config } from '../config.js'
import axios from 'axios'

const youtubeVideo = {
    name: 'play2',
    alias: ['ytv', 'playvid'],
    category: 'descargas',
    desc: 'Busca y descarga videos de YouTube',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {

        if (!text) {
            return m.reply(
                `*${config.visuals.emoji2}* Ingresa el nombre de un video o un enlace de YouTube.`
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

                await m.reply(
                    `*${config.visuals.emoji3}* Enlace detectado. Procesando video...`
                )

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
`*❀ YouTube Video ❀*

*= Título »*
> ${firstResult.title || 'Desconocido'}
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

_Enviando video, espera un momento..._`

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

            const { data: videoRes } = await axios.get(
                `https://api.delirius.store/download/ytmp4?url=${encodeURIComponent(videoUrl)}`
            )

            if (!videoRes?.status) {
                return m.reply('Error al descargar el video.')
            }

            const downloadUrl = videoRes?.data?.download

            if (!downloadUrl) {
                return m.reply('No se encontró enlace de descarga.')
            }

            await conn.sendMessage(
                m.chat,
                {
                    video: {
                        url: downloadUrl
                    },
                    caption: `*${videoRes?.data?.title || firstResult?.title || 'Video descargado'}*`
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

export default youtubeVideo