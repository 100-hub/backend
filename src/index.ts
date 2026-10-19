import { Hono } from 'hono'
import api from './api'
import { Env } from './types'

const app = new Hono<Env>()

app.get('/', (c) => {
  return c.body(null, 200)
})

app.get('/health', (c) => {
  return c.json({ message: 'Health Check OK'}, 200)
})

app.route('/api', api)

export default app
