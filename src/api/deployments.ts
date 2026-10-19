import { Hono } from "hono";
import { Env } from "../types";

const deployments = new Hono<Env>()

const formatDistribution = (object: R2Object, prefix: string) => ({
  id: object.key.slice(prefix.length).replace(/\.[^.]+$/, ''),
  name: object.customMetadata?.branch,
  last_modified: object.uploaded.toISOString(),
})

deployments.get('/:app', async (c) => {
  const appName = c.req.param('app')
  const prefix = `distributions/${appName}/`

  const objects: R2Object[] = []
  let cursor: string | undefined
  do {
    const listed = await c.env.HUB_BUCKET.list({
      prefix,
      delimiter: '/',
      include: ['customMetadata'],
      cursor,
    })
    objects.push(...listed.objects)
    cursor = listed.truncated ? listed.cursor : undefined
  } while (cursor)

  const distributions = objects.map((object) => formatDistribution(object, prefix))
  return c.json({ distributions }, 200)
})

deployments.get('/:app/:deploymentId', async (c) => {
  const appName = c.req.param('app')
  const deploymentId = c.req.param('deploymentId')
  const prefix = `distributions/${appName}/`

  const { objects } = await c.env.HUB_BUCKET.list({
    prefix: `${prefix}${deploymentId}`,
    delimiter: '/',
    include: ['customMetadata'],
    limit: 1,
  })
  const distribution = objects[0] && formatDistribution(objects[0], prefix)
  if (distribution?.id !== deploymentId) return c.json({ error: 'Deployment not found' }, 404)

  return c.json(distribution, 200)
})

export default deployments
