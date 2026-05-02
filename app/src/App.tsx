import { useEffect, useState } from 'react'
import './App.css'
import {
  createWorksheet,
  getApiModeLabel,
  getWorksheet,
  updateWorksheetVisibility,
} from './lib/worksheetApi'
import { clearLatestWorksheetRecord } from './lib/worksheetStore'
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

function clearWorksheetParams() {
  if (typeof window === 'undefined') {
    return
  }

  window.history.replaceState(null, '', window.location.pathname)
}

function App() {
  const [topic, setTopic] = useState('')
  const [problemCount, setProblemCount] = useState(5)
  const [worksheet, setWorksheet] = useState<WorksheetRecord | null>(null)
  const [isLoadingWorksheet, setIsLoadingWorksheet] = useState(() =>
    hasWorksheetInUrl(),
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSavingVisibility, setIsSavingVisibility] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [copyMessage, setCopyMessage] = useState('')
  const [hasHydratedFromUrl, setHasHydratedFromUrl] = useState(() =>
    !hasWorksheetInUrl(),
  )

  useEffect(() => {
    if (!hasHydratedFromUrl) {
      return
    }

    if (worksheet) {
      setWorksheetParams(worksheet)
    }
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
          setWorksheet(null)
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to load the worksheet from the URL.',
          )
          setHasHydratedFromUrl(true)
          clearWorksheetParams()
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
      const nextWorksheet = await createWorksheet(nextTopic, problemCount)
      setWorksheet(nextWorksheet)
      setCopyMessage('')
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
    if (!worksheet) {
      return
    }

    const nextVisibility = worksheet.visibility === 'private' ? 'public' : 'private'
    setIsSavingVisibility(true)
    setErrorMessage('')

    try {
      const nextWorksheet = await updateWorksheetVisibility(
        worksheet,
        nextVisibility,
      )
      setWorksheet(nextWorksheet)
      setCopyMessage('')
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

  function handleClear() {
    setTopic('')
    setProblemCount(5)
    setWorksheet(null)
    setErrorMessage('')
    setIsLoadingWorksheet(false)
    setIsGenerating(false)
    setIsSavingVisibility(false)
    setCopyMessage('')
    setHasHydratedFromUrl(true)
    clearLatestWorksheetRecord()
    clearWorksheetParams()
  }

  const shareUrl = (() => {
    if (typeof window === 'undefined' || !worksheet) {
      return ''
    }

    const publicUrl = new URL(window.location.href)
    publicUrl.searchParams.set('worksheet', worksheet.id)
    publicUrl.searchParams.delete('editToken')

    return publicUrl.toString()
  })()
  const canEditWorksheet = Boolean(worksheet?.editToken)
  const isPublicViewer = Boolean(worksheet && !canEditWorksheet)

  async function handleCopyShareLink() {
    if (!shareUrl || worksheet?.visibility !== 'public') {
      return
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopyMessage('Public link copied.')
    } catch {
      setCopyMessage('Unable to copy. Select and copy the browser URL instead.')
    }
  }

  return (
    <main className="app-shell">
      <header className="page-title">
        <p className="section-kicker">Math worksheet generator</p>
        <h1>Math Worksheet Maker</h1>
      </header>

      <section className={isPublicViewer ? 'workspace viewer-workspace' : 'workspace'}>
        {!isPublicViewer ? (
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

          <label className="field">
            <span>Number of problems</span>
            <input
              name="problemCount"
              type="number"
              min="1"
              max="10"
              value={problemCount}
              onChange={(event) => {
                const nextCount = Number(event.target.value)
                setProblemCount(Math.min(Math.max(nextCount || 1, 1), 10))
              }}
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

          <button
            type="button"
            className="secondary-action"
            onClick={handleClear}
            disabled={isLoadingWorksheet || isGenerating || isSavingVisibility}
          >
            Clear worksheet
          </button>
          </form>
        ) : null}

        <section className="preview-card" aria-labelledby="preview-title">
          {worksheet && canEditWorksheet ? (
            <div className="worksheet-toolbar">
              <div className="preview-meta">
                <span>Visibility: {worksheet.visibility}</span>
                <span>Saved record: {worksheet.id.slice(0, 8)}</span>
              </div>

              <div className="worksheet-actions">
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
                <button
                  type="button"
                  className="secondary-action"
                  onClick={handleCopyShareLink}
                  disabled={
                    worksheet.visibility !== 'public' ||
                    isSavingVisibility ||
                    isLoadingWorksheet
                  }
                >
                  Copy public link
                </button>
              </div>

              {copyMessage ? (
                <p className="share-status" role="status">
                  {copyMessage}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="section-heading">
            <p className="section-kicker">Preview</p>
            <h2 id="preview-title">
              {isLoadingWorksheet
                ? 'Loading worksheet...'
                : worksheet
                  ? worksheet.content.title
                  : 'No worksheet yet'}
            </h2>
            <p className="preview-subtitle">
              {worksheet
                ? worksheet.content.subtitle
                : 'Enter a topic and generate a worksheet to see problems, answers, and explanations.'}
            </p>
          </div>

          {worksheet ? (
            <div
              className={
                canEditWorksheet ? 'preview-grid' : 'preview-grid problem-only'
              }
            >
              <article>
                <h3>Problems</h3>
                <ol>
                  {worksheet.content.problems.map((problem, index) => (
                    <li key={`${index}-${problem}`}>{problem}</li>
                  ))}
                </ol>
              </article>

              {canEditWorksheet ? (
                <>
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
                        <li
                          key={`${problem}-${worksheet.content.explanations[index]}`}
                        >
                          {worksheet.content.explanations[index] ??
                            'Missing explanation'}
                        </li>
                      ))}
                    </ol>
                  </article>
                </>
              ) : null}
            </div>
          ) : (
            <div className="empty-preview">
              <p>Problems, answer key, and explanations will appear here.</p>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

export default App
