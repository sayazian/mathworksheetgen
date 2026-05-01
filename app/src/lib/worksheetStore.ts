import type { WorksheetRecord } from '../types/worksheet'

const recordsKey = 'mathworksheetgen.records'
const latestWorksheetKey = 'mathworksheetgen.latestWorksheetId'

function isBrowser() {
  return typeof window !== 'undefined'
}

function parseStoredRecords() {
  if (!isBrowser()) {
    return {} as Record<string, WorksheetRecord>
  }

  const stored = window.localStorage.getItem(recordsKey)

  if (!stored) {
    return {} as Record<string, WorksheetRecord>
  }

  try {
    return JSON.parse(stored) as Record<string, WorksheetRecord>
  } catch {
    window.localStorage.removeItem(recordsKey)
    return {} as Record<string, WorksheetRecord>
  }
}

function writeStoredRecords(records: Record<string, WorksheetRecord>) {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(recordsKey, JSON.stringify(records))
}

export function saveWorksheetRecord(record: WorksheetRecord) {
  const records = parseStoredRecords()
  records[record.id] = record
  writeStoredRecords(records)
  window.localStorage.setItem(latestWorksheetKey, record.id)
}

export function loadWorksheetRecord(id: string) {
  return parseStoredRecords()[id] ?? null
}

export function loadLatestWorksheetRecord() {
  if (!isBrowser()) {
    return null
  }

  const latestId = window.localStorage.getItem(latestWorksheetKey)

  if (!latestId) {
    return null
  }

  return loadWorksheetRecord(latestId)
}
