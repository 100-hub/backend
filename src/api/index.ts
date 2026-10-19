import { Hono } from "hono"
import deployments from "./deployments"
import { app_list } from "../app_list"

const api = new Hono()

api.get('/apps', (c) => {
  return c.json({ apps: app_list }, 200)
})

api.route('/deployments', deployments)

export default api