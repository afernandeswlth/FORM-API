import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'

const DATA_DIR = process.env.VERCEL ? '/tmp/wlth' : join(process.cwd(), 'data')

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

function storeFile(formType: string): string {
  const dir = join(DATA_DIR, formType)
  ensureDir(dir)
  return join(dir, 'submissions.json')
}

function threadFile(formType: string): string {
  ensureDir(DATA_DIR)
  return join(DATA_DIR, `${formType}_threads.json`)
}

export function createSubmission(formType: string, data: unknown): string {
  const file = storeFile(formType)
  const store: Record<string, unknown> = existsSync(file)
    ? JSON.parse(readFileSync(file, 'utf-8'))
    : {}
  const id = randomUUID()
  store[id] = { id, created_at: new Date().toISOString(), status: 'submitted', data }
  writeFileSync(file, JSON.stringify(store, null, 2))
  return id
}

export function getThreadMessageId(formType: string, loanNo: string): string | null {
  const file = threadFile(formType)
  if (!existsSync(file)) return null
  const threads: Record<string, string> = JSON.parse(readFileSync(file, 'utf-8'))
  return threads[loanNo] ?? null
}

export function saveThreadMessageId(formType: string, loanNo: string, msgId: string): void {
  const file = threadFile(formType)
  const threads: Record<string, string> = existsSync(file)
    ? JSON.parse(readFileSync(file, 'utf-8'))
    : {}
  if (!(loanNo in threads)) {
    threads[loanNo] = msgId
    writeFileSync(file, JSON.stringify(threads, null, 2))
  }
}
