import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'

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
      screen.getByRole('button', { name: /generate worksheet for your topic/i }),
    ).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /clear worksheet/i })).toBeInTheDocument()
    expect(screen.getByText(/no worksheet yet/i)).toBeInTheDocument()
    expect(screen.queryByText(/copy public link/i)).not.toBeInTheDocument()
  })

  it('shows concrete math problems in the preview after generation', async () => {
    render(<App />)

    fireEvent.change(screen.getByRole('textbox', { name: /topic/i }), {
      target: { value: 'fractions' },
    })

    fireEvent.click(
      screen.getByRole('button', { name: /generate worksheet for fractions/i }),
    )

    expect(await screen.findByText('Simplify 12/18.')).toBeInTheDocument()
    expect(screen.getByText('Add 3/4 + 2/5.')).toBeInTheDocument()
    expect(screen.getByText('23/20 or 1 3/20')).toBeInTheDocument()
  })

  it('clears the topic and generated worksheet', async () => {
    render(<App />)

    fireEvent.change(screen.getByRole('textbox', { name: /topic/i }), {
      target: { value: 'division' },
    })

    fireEvent.click(
      screen.getByRole('button', { name: /generate worksheet for division/i }),
    )

    expect(await screen.findByText('72 / 8')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /clear worksheet/i }))

    expect(screen.getByRole('textbox', { name: /topic/i })).toHaveValue('')
    expect(screen.getByRole('spinbutton', { name: /number of problems/i })).toHaveValue(5)
    expect(screen.getByText(/no worksheet yet/i)).toBeInTheDocument()
    expect(screen.queryByText('72 / 8')).not.toBeInTheDocument()
    expect(screen.queryByText(/copy public link/i)).not.toBeInTheDocument()
  })

  it('generates the requested number of problems', async () => {
    render(<App />)

    fireEvent.change(screen.getByRole('textbox', { name: /topic/i }), {
      target: { value: 'fractions' },
    })
    fireEvent.change(screen.getByRole('spinbutton', { name: /number of problems/i }), {
      target: { value: '3' },
    })

    fireEvent.click(
      screen.getByRole('button', { name: /generate worksheet for fractions/i }),
    )

    expect(await screen.findByText('Simplify 12/18.')).toBeInTheDocument()
    expect(screen.getByText('Subtract 7/8 - 1/4.')).toBeInTheDocument()
    expect(screen.queryByText('Multiply 2/3 x 9/10.')).not.toBeInTheDocument()
  })

  it('shows copy link only after the worksheet is public', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })

    render(<App />)

    fireEvent.change(screen.getByRole('textbox', { name: /topic/i }), {
      target: { value: 'fractions' },
    })

    fireEvent.click(
      screen.getByRole('button', { name: /generate worksheet for fractions/i }),
    )

    expect(
      await screen.findByText(/make this worksheet public before sharing a link/i),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /copy public link/i })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /make public/i }))

    const copyButton = await screen.findByRole('button', {
      name: /copy public link/i,
    })
    fireEvent.click(copyButton)

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringMatching(/\?worksheet=/),
    )
    expect(await screen.findByText(/public link copied/i)).toBeInTheDocument()
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

  it('renders one answer per problem even if stored data has extra answers', async () => {
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
    window.history.replaceState(
      null,
      '',
      `/?worksheet=${worksheet.id}&editToken=${worksheet.editToken}`,
    )

    render(<App />)

    expect(await screen.findByText('A5')).toBeInTheDocument()
    expect(screen.queryByText('A6')).not.toBeInTheDocument()
    expect(screen.queryByText('E6')).not.toBeInTheDocument()
  })

  it('shows only problems for public worksheet links without edit tokens', async () => {
    const worksheet: WorksheetRecord = {
      id: 'public-problem-only-test',
      topic: 'counting',
      visibility: 'public',
      createdAt: new Date().toISOString(),
      content: {
        title: 'Counting Practice',
        subtitle: 'Preview',
        problems: ['Problem 1', 'Problem 2', 'Problem 3', 'Problem 4', 'Problem 5'],
        answers: ['A1', 'A2', 'A3', 'A4', 'A5'],
        explanations: ['E1', 'E2', 'E3', 'E4', 'E5'],
      },
    }

    window.localStorage.setItem(
      'mathworksheetgen.records',
      JSON.stringify({ [worksheet.id]: worksheet }),
    )
    window.history.replaceState(null, '', `/?worksheet=${worksheet.id}`)

    render(<App />)

    expect(await screen.findByText('Problem 5')).toBeInTheDocument()
    expect(screen.queryByText('Answer key')).not.toBeInTheDocument()
    expect(screen.queryByText('Brief explanations')).not.toBeInTheDocument()
    expect(screen.queryByText('A1')).not.toBeInTheDocument()
    expect(screen.queryByText('E1')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /make private/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /copy public link/i })).not.toBeInTheDocument()
  })
})
