import type { WebSocket } from 'ws'
import { WebSocketServer } from 'ws'
import { API_PATH } from '../constants'
import type { Vitest } from '../node'
import middlewareAPI from './middleware'

export function setup(ctx: Vitest) {
  const wss = new WebSocketServer({ noServer: true })

  const clients = new Set<WebSocket>()

  ctx.server.httpServer?.on('upgrade', (request, socket, head) => {
    if (!request.url)
      return

    const { pathname } = new URL(request.url, 'http://localhost')
    if (pathname !== API_PATH)
      return

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request)
      setupClient(ws)
    })
  })

  ctx.server.middlewares.use(middlewareAPI(ctx))

  function setupClient(ws: WebSocket) {
    clients.add(ws)

    ws.on('close', () => {
      clients.delete(ws)
    })

    ws.on('message', (data) => {
      ctx.console.log('msg form ', ws.url, String(data))
    })
  }
}
