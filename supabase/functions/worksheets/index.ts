import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js/cors'

type WorksheetVisibility = 'private' | 'public'

interface WorksheetContent {
  title: string
  subtitle: string
  problems: string[]
  answers: string[]
  explanations: string[]
}

interface WorksheetRow {
  id: string
  topic: string
  visibility: WorksheetVisibility
  content_json: WorksheetContent
  edit_token_hash: string
  created_at: string
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const openAiApiKey = Deno.env.get('OPENAI_API_KEY')
const openAiModel = Deno.env.get('OPENAI_MODEL') ?? 'gpt-5.4-mini'

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing Supabase service role environment variables.')
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

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
    subtitle: 'Server-generated worksheet draft',
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
    subtitle: 'Server-generated worksheet draft',
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
    subtitle: 'Server-generated worksheet draft',
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
    subtitle: 'Server-generated worksheet draft',
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

  return {
    title: `${toTitleCase(normalizedTopic)} Practice`,
    subtitle: 'Server-generated worksheet draft',
    problems: [
      'Compute 18 + 27.',
      'Compute 56 - 19.',
      'Compute 7 x 9.',
      'Compute 84 / 12.',
      `Write one sentence describing what "${normalizedTopic}" means.`,
    ],
    answers: [
      '45',
      '37',
      '63',
      '7',
      `${toTitleCase(normalizedTopic)} is a math topic to define in your own words.`,
    ],
    explanations: [
      'Add the tens and ones carefully.',
      'Borrow from the tens place when subtracting 19 from 56.',
      'Seven groups of nine make 63.',
      '84 split into 12 equal groups gives 7.',
      'This last prompt checks basic conceptual understanding alongside computation.',
    ],
  }
}

function buildWorksheetPreview(topic: string): WorksheetContent {
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

function buildWorksheetSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      title: { type: 'string' },
      subtitle: { type: 'string' },
      problems: {
        type: 'array',
        minItems: 5,
        maxItems: 5,
        items: { type: 'string' },
      },
      answers: {
        type: 'array',
        minItems: 5,
        maxItems: 5,
        items: { type: 'string' },
      },
      explanations: {
        type: 'array',
        minItems: 5,
        maxItems: 5,
        items: { type: 'string' },
      },
    },
    required: ['title', 'subtitle', 'problems', 'answers', 'explanations'],
  }
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isWorksheetContent(value: unknown): value is WorksheetContent {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.title === 'string' &&
    typeof candidate.subtitle === 'string' &&
    isStringArray(candidate.problems) &&
    isStringArray(candidate.answers) &&
    isStringArray(candidate.explanations) &&
    candidate.problems.length === 5 &&
    candidate.answers.length === 5 &&
    candidate.explanations.length === 5
  )
}

async function generateWorksheetWithOpenAi(topic: string) {
  if (!openAiApiKey) {
    return null
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openAiApiKey}`,
    },
    body: JSON.stringify({
      model: openAiModel,
      reasoning: { effort: 'low' },
      input: [
        {
          role: 'developer',
          content: [
            {
              type: 'input_text',
              text:
                'You generate printable grade-school or early algebra math worksheets. ' +
                'Return exactly five concrete math problems, five matching answers, and five brief explanations. ' +
                'Do not return teaching guidelines, meta commentary, markdown, or placeholders. ' +
                'Keep explanations short and student-friendly. Make sure the math is correct.',
            },
          ],
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text:
                `Create a math worksheet for the topic: "${topic}". ` +
                'Choose concrete problems appropriate for a general learner. ' +
                'If the topic is broad, choose a reasonable sub-scope and reflect it in the title.',
            },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'worksheet_content',
          strict: true,
          schema: buildWorksheetSchema(),
        },
      },
      max_output_tokens: 1200,
    }),
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null

    throw new Error(payload?.error?.message ?? 'OpenAI worksheet generation failed.')
  }

  const payload = (await response.json()) as { output_text?: string | null }
  const outputText = payload.output_text

  if (!outputText) {
    throw new Error('OpenAI returned no structured worksheet payload.')
  }

  const parsed = JSON.parse(outputText) as unknown

  if (!isWorksheetContent(parsed)) {
    throw new Error('OpenAI returned an invalid worksheet shape.')
  }

  return parsed
}

async function generateWorksheetContent(topic: string) {
  try {
    const aiWorksheet = await generateWorksheetWithOpenAi(topic)

    if (aiWorksheet) {
      return aiWorksheet
    }
  } catch (error) {
    console.error('Falling back to deterministic worksheet generator:', error)
  }

  return buildWorksheetPreview(topic)
}

async function hashToken(token: string) {
  const encoded = new TextEncoder().encode(token)
  const digest = await crypto.subtle.digest('SHA-256', encoded)

  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
}

async function assertEditable(row: WorksheetRow | null, editToken: string | undefined) {
  if (!row) {
    throw new Response(JSON.stringify({ error: 'Worksheet not found.' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!editToken) {
    throw new Response(JSON.stringify({ error: 'Missing edit token.' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const editTokenHash = await hashToken(editToken)

  if (editTokenHash !== row.edit_token_hash) {
    throw new Response(JSON.stringify({ error: 'Invalid edit token.' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (request.method === 'GET') {
      const url = new URL(request.url)
      const id = url.searchParams.get('id')
      const editToken = url.searchParams.get('editToken') ?? undefined

      if (!id) {
        return json({ error: 'Worksheet id is required.' }, 400)
      }

      const { data: row, error } = await supabase
        .from('worksheets')
        .select('id, topic, visibility, content_json, edit_token_hash, created_at')
        .eq('id', id)
        .maybeSingle<WorksheetRow>()

      if (error) {
        return json({ error: error.message }, 500)
      }

      if (!row) {
        return json({ error: 'Worksheet not found.' }, 404)
      }

      if (row.visibility === 'private') {
        await assertEditable(row, editToken)
      }

      return json({
        id: row.id,
        topic: row.topic,
        visibility: row.visibility,
        content: row.content_json,
        createdAt: row.created_at,
        editToken,
      })
    }

    if (request.method === 'POST') {
      const { topic } = (await request.json()) as { topic?: string }

      if (!topic?.trim()) {
        return json({ error: 'Topic is required.' }, 400)
      }

      const editToken = crypto.randomUUID()
      const editTokenHash = await hashToken(editToken)
      const content = await generateWorksheetContent(topic)

      const { data, error } = await supabase
        .from('worksheets')
        .insert({
          topic: topic.trim(),
          content_json: content,
          edit_token_hash: editTokenHash,
        })
        .select('id, topic, visibility, content_json, created_at')
        .single()

      if (error) {
        return json({ error: error.message }, 500)
      }

      return json({
        id: data.id,
        topic: data.topic,
        visibility: data.visibility,
        content: data.content_json,
        createdAt: data.created_at,
        editToken,
      })
    }

    if (request.method === 'PATCH') {
      const { id, visibility, editToken } = (await request.json()) as {
        id?: string
        visibility?: WorksheetVisibility
        editToken?: string
      }

      if (!id || !visibility) {
        return json({ error: 'Worksheet id and visibility are required.' }, 400)
      }

      const { data: row, error: fetchError } = await supabase
        .from('worksheets')
        .select('id, topic, visibility, content_json, edit_token_hash, created_at')
        .eq('id', id)
        .maybeSingle<WorksheetRow>()

      if (fetchError) {
        return json({ error: fetchError.message }, 500)
      }

      await assertEditable(row, editToken)

      const { data, error } = await supabase
        .from('worksheets')
        .update({ visibility })
        .eq('id', id)
        .select('id, topic, visibility, content_json, created_at')
        .single()

      if (error) {
        return json({ error: error.message }, 500)
      }

      return json({
        id: data.id,
        topic: data.topic,
        visibility: data.visibility,
        content: data.content_json,
        createdAt: data.created_at,
      })
    }

    return json({ error: 'Method not allowed.' }, 405)
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return json(
      {
        error: error instanceof Error ? error.message : 'Unexpected server error.',
      },
      500,
    )
  }
})
