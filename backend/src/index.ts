import * as Hapi from '@hapi/hapi'
import pkmPlugin from './plugins/pkm'

const main = async () => {
  const app: Hapi.Server = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
  })

  await app.register([pkmPlugin])
  await app.initialize()
  await app.start()
  console.log(`App started. Serving on ${app.info.uri}`)
}

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})

main().catch((err) => {
  console.log(err)
})
