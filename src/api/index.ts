import { Hono } from "hono"
import deployments from "./deployments"
import { Env } from "../types"
import apps from "./apps"

const api = new Hono<Env>()

api.route('/deployments', deployments)
api.route('/apps', apps)

export default api