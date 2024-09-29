import * as Hapi from '@hapi/hapi'
import * as hp from 'hapi-pino'
import pkmPlugin from './plugins/pkm'

const main = async () => {
  const server: Hapi.Server = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
  })

  await server.register({
    plugin: hp,
    options: {
      // Redact Authorization headers, see https://getpino.io/#/docs/redaction
      redact: ['req.headers.authorization'],
    },
  })

  await server.register([pkmPlugin])
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
