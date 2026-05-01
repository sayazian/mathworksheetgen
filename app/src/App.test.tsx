import { render, screen } from '@testing-library/react'

import App from './App'

describe('App', () => {
  it('renders the worksheet request shell', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', {
        name: /generate worksheets without starting from a template demo/i,
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
})
