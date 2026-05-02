import { useEffect, useState } from 'react'
import './App.css'
import { buildMockWorksheetRecord } from './lib/mockWorksheet'
import {
  createWorksheet,
  getApiModeLabel,
  getWorksheet,
  updateWorksheetVisibility,
} from './lib/worksheetApi'
import { loadLatestWorksheetRecord } from './lib/worksheetStore'
import type { WorksheetRecord } from './types/worksheet'

function getWorksheetParams() {
  const searchParams = new URLSearchParams(window.location.search)

  return {
    worksheetId: searchParams.get('worksheet'),
    editToken: searchParams.get('editToken') ?? undefined,
  }
}

function hasWorksheetInUrl() {
  if (typeof window === 'undefined') {
    return false
  }

  return Boolean(getWorksheetParams().worksheetId)
}

function setWorksheetParams(record: WorksheetRecord) {
  const searchParams = new URLSearchParams(window.location.search)
  searchParams.set('worksheet', record.id)

  if (record.editToken) {
    searchParams.set('editToken', record.editToken)
  } else {
    searchParams.delete('editToken')
  }

  const nextQuery = searchParams.toString()
  const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}`
  window.history.replaceState(null, '', nextUrl)
}

function App() {
  const [topic, setTopic] = useState('fractions')
  const [worksheet, setWorksheet] = useState<WorksheetRecord>(() => {
    if (typeof window === 'undefined') {
      return buildMockWorksheetRecord('fractions')
    }

    return loadLatestWorksheetRecord() ?? buildMockWorksheetRecord('fractions')
  })
  const [isLoadingWorksheet, setIsLoadingWorksheet] = useState(() =>
    hasWorksheetInUrl(),
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSavingVisibility, setIsSavingVisibility] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [hasHydratedFromUrl, setHasHydratedFromUrl] = useState(() =>
    !hasWorksheetInUrl(),
  )

  useEffect(() => {
    if (!hasHydratedFromUrl) {
      return
    }

    setWorksheetParams(worksheet)
  }, [hasHydratedFromUrl, worksheet])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const { worksheetId, editToken } = getWorksheetParams()

    if (!worksheetId) {
      return
    }

    const targetWorksheetId = worksheetId
    let isCancelled = false

    async function loadWorksheetFromUrl() {
      try {
        const loadedWorksheet = await getWorksheet(targetWorksheetId, editToken)

        if (!isCancelled) {
          setWorksheet(loadedWorksheet)
          setTopic(loadedWorksheet.topic)
          setHasHydratedFromUrl(true)
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to load the worksheet from the URL.',
          )
          setHasHydratedFromUrl(true)
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingWorksheet(false)
        }
      }
    }

    loadWorksheetFromUrl()

    return () => {
      isCancelled = true
    }
  }, [])

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextTopic = topic.trim()

    if (!nextTopic) {
      setErrorMessage('Enter a math topic before generating a worksheet.')
      return
    }

    setIsGenerating(true)
    setErrorMessage('')

    try {
      const nextWorksheet = await createWorksheet(nextTopic)
      setWorksheet(nextWorksheet)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong while generating the worksheet.',
      )
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleVisibilityToggle() {
    const nextVisibility = worksheet.visibility === 'private' ? 'public' : 'private'
    setIsSavingVisibility(true)
    setErrorMessage('')

    try {
      const nextWorksheet = await updateWorksheetVisibility(
        worksheet,
        nextVisibility,
      )
      setWorksheet(nextWorksheet)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to update worksheet visibility.',
      )
    } finally {
      setIsSavingVisibility(false)
    }
  }

  const shareUrl = (() => {
    if (typeof window === 'undefined') {
      return ''
    }

    const publicUrl = new URL(window.location.href)
    publicUrl.searchParams.set('worksheet', worksheet.id)

    if (worksheet.visibility === 'public') {
      publicUrl.searchParams.delete('editToken')
    }

    return publicUrl.toString()
  })()

  return (
    <main className="app-shell">
      <header className="page-title">
        <p className="section-kicker">Math worksheet generator</p>
        <h1>Math Worksheet Maker</h1>
      </header>

      <section className="workspace">
        <form className="composer-card" onSubmit={handleGenerate}>
          <div className="section-heading">
            <p className="section-kicker">Worksheet request</p>
            <h2>Describe the math topic</h2>
          </div>

          <label className="field">
            <span>Topic</span>
            <input
              name="topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="fractions, linear equations, multiplication facts"
            />
          </label>

          <div className="meta-note">
            <strong>Data mode:</strong> {getApiModeLabel()}
          </div>

          {errorMessage ? (
            <p className="error-banner" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            className="primary-action"
            disabled={isGenerating || isLoadingWorksheet}
          >
            {isLoadingWorksheet
              ? 'Loading worksheet...'
              : isGenerating
                ? 'Generating worksheet...'
                : `Generate worksheet for ${topic || 'your topic'}`}
          </button>

          <div className="preview-meta">
            <span>Visibility: {worksheet.visibility}</span>
            <span>Saved record: {worksheet.id.slice(0, 8)}</span>
          </div>

          <div className="secondary-actions">
            <button
              type="button"
              className="secondary-action"
              onClick={handleVisibilityToggle}
              disabled={isSavingVisibility || isLoadingWorksheet}
            >
              {isSavingVisibility
                ? 'Saving...'
                : worksheet.visibility === 'private'
                  ? 'Make public'
                  : 'Make private'}
            </button>
            <p className="token-note">
              This browser currently holds the worksheet edit token.
            </p>
          </div>

          <div className="share-card">
            <p className="share-label">Current worksheet URL</p>
            <code>{shareUrl}</code>
          </div>
        </form>

        <section className="preview-card" aria-labelledby="preview-title">
          <div className="section-heading">
            <p className="section-kicker">Preview</p>
            <h2 id="preview-title">
              {isLoadingWorksheet ? 'Loading worksheet...' : worksheet.content.title}
            </h2>
            <p className="preview-subtitle">{worksheet.content.subtitle}</p>
          </div>

          <div className="preview-grid">
            <article>
              <h3>Problems</h3>
              <ol>
                {worksheet.content.problems.map((problem, index) => (
                  <li key={`${index}-${problem}`}>{problem}</li>
                ))}
              </ol>
            </article>

            <article>
              <h3>Answer key</h3>
              <ol>
                {worksheet.content.problems.map((problem, index) => (
                  <li key={`${problem}-${worksheet.content.answers[index]}`}>
                    {worksheet.content.answers[index] ?? 'Missing answer'}
                  </li>
                ))}
              </ol>
            </article>

            <article className="explanations">
              <h3>Brief explanations</h3>
              <ol>
                {worksheet.content.problems.map((problem, index) => (
                  <li key={`${problem}-${worksheet.content.explanations[index]}`}>
                    {worksheet.content.explanations[index] ?? 'Missing explanation'}
                  </li>
                ))}
              </ol>
            </article>
          </div>
        </section>
      </section>
    </main>
  )
}

export default App
