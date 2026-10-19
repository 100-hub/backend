import { Hono } from "hono";
import { Env } from "../types";

const apps = new Hono<Env>()

apps.get('/', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM apps').all()

  const origin = new URL(c.req.url).origin

  const formattedApps = results.map((app) => ({
    name: app.app_id,
    display_name: app.display_name,
    icon: `${origin}/api/apps/${app.app_id}/icon`,
  }))
  
  return c.json({ apps: formattedApps }, 200)
})

apps.get('/:appId/icon', async (c) => {
  const appId = c.req.param('appId')
  const appRecord = await c.env.DB.prepare('SELECT icon_key FROM apps WHERE app_id = ?')
    .bind(appId)
    .first<{ icon_key: string }>()

  if (!appRecord) return c.json({ error: 'App not found' }, 404)

  const object = await c.env.HUB_BUCKET.get(appRecord.icon_key)
  if (!object) return c.json({ error: 'Icon file missing from storage' }, 404)

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)

  return c.body(object.body, { status: 200, headers })
})

export default apps