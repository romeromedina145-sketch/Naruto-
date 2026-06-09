import axios from 'axios'

const musicFinder = {
    name: 'music',
    alias: ['shazam', 'msc'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m) => {

        const quoted = m.quoted || m

        const mime =
            quoted?.message?.audioMessage
                ? 'audio'
                : quoted?.message?.videoMessage
                ? 'video'
                : null

        if (!mime) {
            return m.reply(
                '🎵 Responde a un audio o video.'
            )
        }

        try {

            await conn.sendMessage(
                m.chat,
                {
                    react: {
                        text: '🔎',
                        key: m.key
                    }
                }
            )

            // Descargar archivo
            const media = await quoted.download()

            // Aquí debes subir el archivo a Catbox
            // y obtener una URL pública

            const audioUrl = 'URL_DEL_ARCHIVO_SUBIDO'

            const { data } = await axios.get(
                `https://api.audd.io/?url=${encodeURIComponent(audioUrl)}&return=apple_music,spotify&api_token=TU_TOKEN`
            )

            if (!data?.result) {
                return m.reply(
                    '❌ No pude reconocer la canción.'
                )
            }

            const song = data.result

            const query =
                `${song.artist} ${song.title}`

            const { data: spotify } =
                await axios.get(
                    `https://api.delirius.store/search/spotify?q=${encodeURIComponent(query)}`
                )

            const results =
                spotify?.data || []

            if (!results.length) {

                return m.reply(
                    `🎵 ${song.title}\n🎤 ${song.artist}\n💿 ${song.album || 'Desconocido'}`
                )
            }

            const cards =
                results.slice(0, 1).map(res => ({
                    image: {
                        url: res.image
                    },

                    title: res.title,

                    body:
                        `🎤 Artista: ${res.artist}\n` +
                        `💿 Álbum: ${res.album}\n` +
                        `⏱️ Duración: ${res.duration}`,

                    footer: 'SaitamaBot',

                    buttons: [
                        {
                            name: 'quick_reply',
                            buttonParamsJson:
                                JSON.stringify({
                                    display_text:
                                        '🎵 Descargar',
                                    id:
                                        `.spotify ${res.url}`
                                })
                        },
                        {
                            name: 'cta_url',
                            buttonParamsJson:
                                JSON.stringify({
                                    display_text:
                                        '🟢 Spotify',
                                    url:
                                        res.url
                                })
                        }
                    ]
                }))

            await conn.sendMessage(
                m.chat,
                {
                    text:
                        `🎵 Canción encontrada\n\n` +
                        `🎤 ${song.artist}\n` +
                        `🎶 ${song.title}`,
                    footer:
                        'Music Recognition',
                    cards
                },
                {
                    quoted: m
                }
            )

        } catch (error) {

            console.log(error)

            m.reply(
                '❌ Error al reconocer la canción.'
            )
        }
    }
}

export default musicFinder
