import { Hono } from "hono";
import { Env } from "../types";

const deployments = new Hono<Env>()

// Permanent builds, then temporary (manual) builds that the bucket's lifecycle rule deletes after 7 days
const distributionPrefixes = (appName: string) => [
  `distributions/${appName}/`,
  `temp/distributions/${appName}/`,
]

const formatDistribution = (object: R2Object, prefix: string) => ({
  id: object.key.slice(prefix.length).replace(/\.[^.]+$/, ''),
  name: object.customMetadata?.branch,
  last_modified: object.uploaded.toISOString(),
})

deployments.get('/:app', async (c) => {
  const appName = c.req.param('app')

  const distributions = []
  for (const prefix of distributionPrefixes(appName)) {
    let cursor: string | undefined
    do {
      const listed = await c.env.HUB_BUCKET.list({
        prefix,
        delimiter: '/',
        include: ['customMetadata'],
        cursor,
      })
      distributions.push(...listed.objects.map((object) => formatDistribution(object, prefix)))
      cursor = listed.truncated ? listed.cursor : undefined
    } while (cursor)
  }

  return c.json({ distributions }, 200)
})

deployments.get('/:app/:deploymentId', async (c) => {
  const appName = c.req.param('app')
  const deploymentId = c.req.param('deploymentId')

  for (const prefix of distributionPrefixes(appName)) {
    const { objects } = await c.env.HUB_BUCKET.list({
      prefix: `${prefix}${deploymentId}`,
      delimiter: '/',
      include: ['customMetadata'],
      limit: 1,
    })
    const distribution = objects[0] && formatDistribution(objects[0], prefix)
    if (distribution?.id === deploymentId) return c.json(distribution, 200)
  }

  return c.json({ error: 'Deployment not found' }, 404)
})

export default deployments
