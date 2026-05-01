import { fireEvent, render, screen } from '@testing-library/react'

import App from './App'
import type { WorksheetRecord } from './types/worksheet'

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.history.replaceState(null, '', '/')
  })

  it('renders the worksheet request shell', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', {
        name: /describe the math topic/i,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: /generate worksheet for fractions/i }),
    ).toBeInTheDocument()

    expect(screen.getByText(/current worksheet url/i)).toBeInTheDocument()
  })

  it('shows concrete math problems in the preview', () => {
    render(<App />)

    expect(screen.getByText('Simplify 12/18.')).toBeInTheDocument()
    expect(screen.getByText('Add 3/4 + 2/5.')).toBeInTheDocument()
    expect(screen.getByText('23/20 or 1 3/20')).toBeInTheDocument()
  })

  it('generates subtraction problems for the subtraction topic', async () => {
    render(<App />)

    fireEvent.change(screen.getByRole('textbox', { name: /topic/i }), {
      target: { value: 'subtraction' },
    })

    fireEvent.click(
      screen.getByRole('button', { name: /generate worksheet for subtraction/i }),
    )

    expect(await screen.findByText('52 - 19')).toBeInTheDocument()
    expect(await screen.findByText('84 - 27')).toBeInTheDocument()
    expect(await screen.findByText('532')).toBeInTheDocument()
  })

  it('generates division problems for the division topic', async () => {
    render(<App />)

    fireEvent.change(screen.getByRole('textbox', { name: /topic/i }), {
      target: { value: 'division' },
    })

    fireEvent.click(
      screen.getByRole('button', { name: /generate worksheet for division/i }),
    )

    expect(await screen.findByText('72 / 8')).toBeInTheDocument()
    expect(await screen.findByText('96 / 12')).toBeInTheDocument()
    expect(await screen.findByText('25')).toBeInTheDocument()
  })

  it('renders one answer per problem even if stored data has extra answers', () => {
    const worksheet: WorksheetRecord = {
      id: 'extra-answer-test',
      topic: 'counting',
      visibility: 'private',
      createdAt: new Date().toISOString(),
      editToken: 'token',
      content: {
        title: 'Counting Practice',
        subtitle: 'Preview',
        problems: ['Problem 1', 'Problem 2', 'Problem 3', 'Problem 4', 'Problem 5'],
        answers: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'],
        explanations: ['E1', 'E2', 'E3', 'E4', 'E5', 'E6'],
      },
    }

    window.localStorage.setItem(
      'mathworksheetgen.records',
      JSON.stringify({ [worksheet.id]: worksheet }),
    )
    window.localStorage.setItem('mathworksheetgen.latestWorksheetId', worksheet.id)

    render(<App />)

    expect(screen.getByText('A5')).toBeInTheDocument()
    expect(screen.queryByText('A6')).not.toBeInTheDocument()
    expect(screen.queryByText('E6')).not.toBeInTheDocument()
  })
})
