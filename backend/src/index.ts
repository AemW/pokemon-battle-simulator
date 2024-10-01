import Hapi from '@hapi/hapi'
import Inert from '@hapi/inert'
import Vision from '@hapi/vision'
import HapiPino from 'hapi-pino'
import HapiSwagger from 'hapi-swagger'
import pokemonPlugin from './plugins/pokemon'

const main = async () => {
  const server: Hapi.Server = Hapi.server({
    port: process.env.PORT || 4000,
    host: process.env.HOST || '0.0.0.0',
  })

  // Register plugins
  await server.register([
    // Logging
    {
      plugin: HapiPino,
      options: {
        // Redact Authorization headers, see https://getpino.io/#/docs/redaction
        redact: ['req.headers.authorization'],
      },
    },

    // Documentation
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: {
        info: {
          title: 'API Documentation',
        },
      },
    },

    // Own plugins
    { plugin: pokemonPlugin },
  ])
  await server.initialize()
  await server.start()
}

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})

// Initialize and start the server
main().catch((err) => {
  console.log(err)
})
