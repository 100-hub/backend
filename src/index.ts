import { Hono } from 'hono'
import api from './api'

const app = new Hono()

app.get('/', (c) => {
  return c.status(200)
})

app.get('/health', (c) => {
  return c.json({ message: 'Health Check OK'}, 200)
})

app.route('/api', api)

export default app
