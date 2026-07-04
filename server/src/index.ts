import { env } from './lib/env.js'
import { createApp } from './app.js'

const app = createApp()

app.listen(env.PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${env.PORT}`)
})
