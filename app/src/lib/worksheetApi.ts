import { buildMockWorksheetRecord } from './mockWorksheet'
import { loadWorksheetRecord, saveWorksheetRecord } from './worksheetStore'
import type { WorksheetRecord, WorksheetVisibility } from '../types/worksheet'

interface ApiWorksheet {
  id: string
  topic: string
  visibility: WorksheetVisibility
  content: WorksheetRecord['content']
  createdAt: string
  editToken?: string
}

type ConfigKey = keyof ImportMetaEnv

function getConfigValue(key: ConfigKey) {
  const runtimeValue =
    typeof window === 'undefined'
      ? undefined
      : window.__MATH_WORKSHEET_CONFIG__?.[key]

  return runtimeValue || import.meta.env[key]
}

function isMockMode() {
  return getConfigValue('VITE_USE_MOCK_API') === 'true'
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/$/, '')
}

function getFunctionsBaseUrl() {
  const explicitFunctionsUrl = getConfigValue('VITE_SUPABASE_FUNCTIONS_URL')

  if (explicitFunctionsUrl) {
    return normalizeBaseUrl(explicitFunctionsUrl)
  }

  const projectUrl = getConfigValue('VITE_SUPABASE_URL')

  if (!projectUrl) {
    return null
  }

  return `${normalizeBaseUrl(projectUrl)}/functions/v1`
}

function getFunctionHeaders() {
  const publishableKey = getConfigValue('VITE_SUPABASE_PUBLISHABLE_KEY')

  if (!publishableKey) {
    throw new Error('Supabase publishable key is not configured.')
  }

  return {
    'Content-Type': 'application/json',
    apikey: publishableKey,
    Authorization: `Bearer ${publishableKey}`,
  }
}

async function parseResponse<T>(response: Response) {
  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null

    throw new Error(errorPayload?.error ?? 'Request failed.')
  }

  return (await response.json()) as T
}

function toRecord(data: ApiWorksheet): WorksheetRecord {
  return {
    id: data.id,
    topic: data.topic,
    visibility: data.visibility,
    createdAt: data.createdAt,
    editToken: data.editToken,
    content: data.content,
  }
}

export function getApiModeLabel() {
  return isMockMode() ? 'Mock worksheet mode' : 'Supabase function mode'
}

export async function createWorksheet(topic: string) {
  if (isMockMode()) {
    const record = buildMockWorksheetRecord(topic)
    saveWorksheetRecord(record)
    return record
  }

  const baseUrl = getFunctionsBaseUrl()

  if (!baseUrl) {
    throw new Error('Supabase URL is not configured.')
  }

  const data = await parseResponse<ApiWorksheet>(
    await fetch(`${baseUrl}/worksheets`, {
      method: 'POST',
      headers: getFunctionHeaders(),
      body: JSON.stringify({ topic }),
    }),
  )

  const record = toRecord(data)
  saveWorksheetRecord(record)
  return record
}

export async function getWorksheet(id: string, editToken?: string) {
  if (isMockMode()) {
    const storedRecord = loadWorksheetRecord(id)

    if (!storedRecord) {
      throw new Error('Worksheet not found in mock storage.')
    }

    if (
      storedRecord.visibility === 'private' &&
      storedRecord.editToken &&
      storedRecord.editToken !== editToken
    ) {
      throw new Error('This private worksheet requires the correct edit token.')
    }

    return storedRecord
  }

  const baseUrl = getFunctionsBaseUrl()

  if (!baseUrl) {
    throw new Error('Supabase URL is not configured.')
  }

  const searchParams = new URLSearchParams({ id })

  if (editToken) {
    searchParams.set('editToken', editToken)
  }

  const data = await parseResponse<ApiWorksheet>(
    await fetch(`${baseUrl}/worksheets?${searchParams.toString()}`, {
      headers: getFunctionHeaders(),
    }),
  )

  const record = toRecord({
    ...data,
    editToken: data.editToken ?? editToken,
  })
  saveWorksheetRecord(record)
  return record
}

export async function updateWorksheetVisibility(
  worksheet: WorksheetRecord,
  visibility: WorksheetVisibility,
) {
  if (isMockMode()) {
    const record = {
      ...worksheet,
      visibility,
    }
    saveWorksheetRecord(record)
    return record
  }

  if (!worksheet.editToken) {
    throw new Error('Missing edit token for this worksheet.')
  }

  const baseUrl = getFunctionsBaseUrl()

  if (!baseUrl) {
    throw new Error('Supabase URL is not configured.')
  }

  const data = await parseResponse<ApiWorksheet>(
    await fetch(`${baseUrl}/worksheets`, {
      method: 'PATCH',
      headers: getFunctionHeaders(),
      body: JSON.stringify({
        id: worksheet.id,
        visibility,
        editToken: worksheet.editToken,
      }),
    }),
  )

  const record = toRecord({
    ...data,
    editToken: worksheet.editToken,
  })
  saveWorksheetRecord(record)
  return record
}
