import type { WorksheetContent, WorksheetRecord } from '../types/worksheet'

function toTitleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function buildFractionsWorksheet(): WorksheetContent {
  return {
    title: 'Fractions Practice',
    subtitle: 'Generated worksheet preview',
    problems: [
      'Simplify 12/18.',
      'Add 3/4 + 2/5.',
      'Subtract 7/8 - 1/4.',
      'Multiply 2/3 x 9/10.',
      'Divide 3/5 by 9/20.',
    ],
    answers: ['2/3', '23/20 or 1 3/20', '5/8', '3/5', '4/3 or 1 1/3'],
    explanations: [
      'Divide the numerator and denominator by 6.',
      'Use a common denominator of 20 before adding.',
      'Rewrite 1/4 as 2/8, then subtract.',
      'Multiply numerators and denominators, then simplify.',
      'Invert 9/20 and multiply by 3/5.',
    ],
  }
}

function buildLinearEquationsWorksheet(): WorksheetContent {
  return {
    title: 'Linear Equations Practice',
    subtitle: 'Generated worksheet preview',
    problems: [
      'Solve: x + 7 = 19',
      'Solve: 3x = 27',
      'Solve: 2x - 5 = 13',
      'Solve: 4(x + 2) = 28',
      'Solve: 5x + 9 = 2x + 24',
    ],
    answers: ['12', '9', '9', '5', '5'],
    explanations: [
      'Subtract 7 from both sides.',
      'Divide both sides by 3.',
      'Add 5, then divide by 2.',
      'Divide by 4, then subtract 2.',
      'Move x-terms to one side and constants to the other.',
    ],
  }
}

function buildMultiplicationWorksheet(): WorksheetContent {
  return {
    title: 'Multiplication Practice',
    subtitle: 'Generated worksheet preview',
    problems: ['7 x 8', '9 x 6', '12 x 4', '15 x 3', '14 x 7'],
    answers: ['56', '54', '48', '45', '98'],
    explanations: [
      'Seven groups of eight make 56.',
      'Nine groups of six make 54.',
      'Twelve groups of four make 48.',
      'Fifteen groups of three make 45.',
      'Fourteen groups of seven make 98.',
    ],
  }
}

function buildDecimalsWorksheet(): WorksheetContent {
  return {
    title: 'Decimals Practice',
    subtitle: 'Generated worksheet preview',
    problems: [
      'Add 3.45 + 2.7.',
      'Subtract 9.2 - 4.68.',
      'Multiply 1.2 x 0.5.',
      'Divide 4.8 by 0.6.',
      'Round 7.386 to the nearest tenth.',
    ],
    answers: ['6.15', '4.52', '0.6', '8', '7.4'],
    explanations: [
      'Line up the decimal points before adding.',
      'Write 9.2 as 9.20, then subtract.',
      'Multiply 12 x 5 = 60, then place two decimal digits.',
      'Shift both decimals one place right to get 48 / 6.',
      'The hundredths digit is 8, so the tenths digit rounds up.',
    ],
  }
}

function buildGenericWorksheet(topic: string): WorksheetContent {
  const normalizedTopic = topic.trim() || 'arithmetic'
  const title = `${toTitleCase(normalizedTopic)} Practice`

  return {
    title,
    subtitle: 'Generated worksheet preview',
    problems: [
      `Compute 18 + 27.`,
      `Compute 56 - 19.`,
      `Compute 7 x 9.`,
      `Compute 84 / 12.`,
      `Write one sentence describing what "${normalizedTopic}" means.`,
    ],
    answers: ['45', '37', '63', '7', `${toTitleCase(normalizedTopic)} is a math topic to define in your own words.`],
    explanations: [
      'Add the tens and ones carefully.',
      'Borrow from the tens place when subtracting 19 from 56.',
      'Seven groups of nine make 63.',
      '84 split into 12 equal groups gives 7.',
      'This last prompt checks basic conceptual understanding alongside computation.',
    ],
  }
}

export function buildWorksheetPreview(topic: string): WorksheetContent {
  const normalizedTopic = topic.trim() || 'fractions'
  const key = normalizedTopic.toLowerCase()

  if (key.includes('fraction')) {
    return buildFractionsWorksheet()
  }

  if (key.includes('linear') || key.includes('equation') || key.includes('algebra')) {
    return buildLinearEquationsWorksheet()
  }

  if (key.includes('multiplication') || key.includes('times table')) {
    return buildMultiplicationWorksheet()
  }

  if (key.includes('decimal')) {
    return buildDecimalsWorksheet()
  }

  return buildGenericWorksheet(normalizedTopic)
}

export function buildMockWorksheetRecord(topic: string): WorksheetRecord {
  return {
    id: crypto.randomUUID(),
    topic,
    visibility: 'private',
    createdAt: new Date().toISOString(),
    editToken: crypto.randomUUID(),
    content: buildWorksheetPreview(topic),
  }
}
