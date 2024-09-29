import Hapi from '@hapi/hapi'
import Inert from '@hapi/inert'
import Vision from '@hapi/vision'
import hp from 'hapi-pino'
import hapiswagger from 'hapi-swagger'
import pkmPlugin from './plugins/pkm'

const main = async () => {
  const server: Hapi.Server = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
  })

  // Register plugins
  await server.register([
    // Logging
    {
      plugin: hp,
      options: {
        // Redact Authorization headers, see https://getpino.io/#/docs/redaction
        redact: ['req.headers.authorization'],
      },
    },

    // Documentation
    Inert,
    Vision,
    {
      plugin: hapiswagger,
      options: {
        info: {
          title: 'API Documentation',
        },
      },
    },

    // Own plugins
    { plugin: pkmPlugin },
  ])
  await server.initialize()
  await server.start()
}

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})

main().catch((err) => {
  console.log(err)
})
