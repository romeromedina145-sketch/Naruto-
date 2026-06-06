import axios from 'axios'

const movieSearch = {
    name: 'psearch',
    alias: ['peliculasearch', 'moviesearch'],
    category: 'tools',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {

        const query = text || args.join(' ')

        if (!query) {
            return m.reply('🎬 Ingresa el nombre de una película.')
        }

        try {

            const { data } = await axios.get(
                `https://api.delirius.store/search/movie?query=${encodeURIComponent(query)}`
            )

            if (!data?.status || !data?.data?.length) {
                return m.reply('No se encontraron películas.')
            }

            const cards = data.data.slice(0, 7).map(movie => ({
                image: {
                    url: movie.image
                },

                title: movie.title,

                body:
                    `🌎 Idioma: ${movie.original_language?.toUpperCase() || 'N/A'}\n` +
                    `⭐ Rating: ${movie.vote_average || '0'}\n` +
                    `📅 Estreno: ${movie.release_date || 'Desconocido'}\n` +
                    `🗳️ Votos: ${movie.vote_count || '0'}\n\n` +
                    `${movie.overview?.slice(0, 120) || 'Sin descripción'}...`,

                footer: 'Saitama-Sckt-MD',

                buttons: [
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📥 Descargar',
                            id: `.pdl ${movie.id}`
                        })
                    },
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '🎬 Ver Película',
                            id: `.pview ${movie.id}`
                        })
                    }
                ]
            }))

            await conn.sendMessage(
                m.chat,
                {
                    text: `🎬 Resultados para: ${query}`,
                    footer: 'Selecciona una película',
                    cards
                },
                {
                    quoted: m
                }
            )

        } catch (e) {

            console.log(e)

            m.reply(
                `Error: ${e.response?.data?.message || e.message}`
            )
        }
    }
}

export default movieSearch