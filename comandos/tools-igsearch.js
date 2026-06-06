import axios from 'axios'

const instagramSearch = {
    name: 'instagramsearch',
    alias: ['igsearch', 'igreels', 'igsrch'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        const query = text || args.join(' ')

        if (!query) {
            return m.reply('📸 Ingresa un texto para buscar en Instagram.')
        }

        try {
            const { data } = await axios.get(
                `https://api.delirius.store/search/instagramreels?query=${encodeURIComponent(query)}&language=en`
            )

            const results = data?.datos || data?.data || []

            if (!results.length) {
                return m.reply('❌ No se encontraron resultados.')
            }

            const cards = results.slice(0, 8).map(res => ({
                image: {
                    url: res.imagen
                },

                title: (res.titulo || 'Instagram').slice(0, 80),

                body:
                    (res.descripcion || 'Sin descripción')
                    .replace(/\n/g, ' ')
                    .slice(0, 180),

                footer: 'SaitamaBot-Sckt-MD',

                buttons: [
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📥 Descargar',
                            id: `.igdl ${res.url}`
                        })
                    },
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📸 Ver Reel',
                            url: res.url
                        })
                    }
                ]
            }))

            await conn.sendMessage(
                m.chat,
                {
                    text: `📸 Resultados para: ${query}`,
                    footer: 'Instagram Reels Search',
                    cards
                },
                {
                    quoted: m
                }
            )

        } catch (error) {
            console.log(error.response?.data || error)

            m.reply(
                '❌ Error al obtener resultados de Instagram.'
            )
        }
    }
}

export default instagramSearch
