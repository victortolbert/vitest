import type { WebSocketServer, WebSocket } from 'ws'
import type { Vitest } from '../node'
import type { Reporter, TaskResultPack } from '../types'

const QUEUE_DEBOUNCE = 500

export class WebSocketReporter implements Reporter {
  constructor(
    public ctx: Vitest,
    public wss: WebSocketServer,
    public clients: Set<WebSocket>,
  ) {}

  onStart(files?: string[]) {
    this.boardcastQueue({ event: 'onStart', files })
  }

  onTaskUpdate(pack: TaskResultPack) {
    this.boardcastQueue({ event: 'onTaskUpdate', pack })
  }

  private _queue: any[] = []
  private _queueTimer: any

  private boardcastQueue(data: any) {
    this._queue.push(data)
    clearTimeout(this._queueTimer)
    this._queueTimer = setTimeout(() => {
      this.boardcast(this._queue)
      this._queue.length = 0
    }, QUEUE_DEBOUNCE)
  }

  private boardcast(data: any) {
    // TODO: use flatten?
    const string = JSON.stringify(data)
    this.clients.forEach((ws) => {
      ws.send(string)
    })
  }
}
