import { Hono } from "hono"
import { bearerAuth } from "hono/bearer-auth"
import deployments from "./deployments"
import { Env } from "../types"
import apps from "./apps"

const api = new Hono<Env>()

api.use('*', (c, next) => bearerAuth<Env>({ token: c.env.API_KEY })(c, next))

api.route('/deployments', deployments)
api.route('/apps', apps)

export default api