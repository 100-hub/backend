import { Hono } from "hono";
import { Env } from "../types";

const deployments = new Hono<Env>()

deployments.get('/:app', (c) => {
  const appName = c.req.param('app')
  return c.json({ message: `App Deployments: ${appName}` }, 200)
})

deployments.get('/:app/:deploymentId', (c) => {
  const appName = c.req.param('app')
  const deploymentId = c.req.param('deploymentId')
  return c.json({ message: `Deployment Details: ${appName} - ${deploymentId}` }, 200)
})

export default deployments