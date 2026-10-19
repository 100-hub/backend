import { D1Database } from '@cloudflare/workers-types'
import { R2Bucket } from '@cloudflare/workers-types'
import { Env as HonoEnv } from 'hono'

export interface Env extends HonoEnv {
  Bindings: {
    DB: D1Database
    HUB_BUCKET: R2Bucket
  }
}