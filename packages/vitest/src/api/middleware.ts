import type { IncomingMessage, ServerResponse } from 'http'
import type { Connect } from 'vite'
import { stringify } from 'flatted'
import { API_PATH } from '../constants'
import type { Vitest } from '../node'

export function sendFlatted(res: ServerResponse, data: any) {
  res.setHeader('Content-Type', 'text/plain')
  res.write(stringify(data))
  res.statusCode = 200
  res.end()
}

export default function middlewareAPI(ctx: Vitest): Connect.NextHandleFunction {
  return async(req, res, next) => {
    if (!req.url?.startsWith(API_PATH))
      return next()

    const url = req.url.slice(API_PATH.length)

    if (url === '/') {
      return sendFlatted(res, {
        files: ctx.state.filesMap,
      })
    }

    if (url === '/files') {
      return sendFlatted(res, {
        files: Object.keys(ctx.state.filesMap),
      })
    }

    if (url === '/run') {
      const payload = await getBodyJson<{ files?: string[] }>(req)
      if (payload.files?.length)
        await ctx.runFiles(payload.files)
      res.statusCode = 200
      res.end()
      return
    }

    res.statusCode = 404
    res.end()
  }
}

export function getBodyJson<T>(req: IncomingMessage): Promise<T> {
  return new Promise<any>((resolve, reject) => {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('error', reject)
    req.on('end', () => {
      try {
        resolve(JSON.parse(body) || {})
      }
      catch (e) {
        reject(e)
      }
    })
  })
}
