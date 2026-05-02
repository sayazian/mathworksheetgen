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

interface WorksheetGenerationResult {
  focus: string
  worksheet: WorksheetContent
}

interface WorksheetAlignmentReview {
  isAligned: boolean
  reason: string
}

class OffTopicWorksheetError extends Error {
  constructor(reason: string) {
    super(`Worksheet was rejected as off-topic: ${reason}`)
    this.name = 'OffTopicWorksheetError'
  }
}

class WorksheetGenerationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WorksheetGenerationError'
  }
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

const defaultProblemCount = 5
const minProblemCount = 1
const maxProblemCount = 10

function normalizeProblemCount(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return defaultProblemCount
  }

  return Math.min(
    Math.max(Math.trunc(value), minProblemCount),
    maxProblemCount,
  )
}

function buildWorksheetSchema(problemCount: number) {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      focus: { type: 'string' },
      worksheet: buildWorksheetContentSchema(problemCount),
    },
    required: ['focus', 'worksheet'],
  }
}

function buildWorksheetContentSchema(problemCount: number) {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      title: { type: 'string' },
      subtitle: { type: 'string' },
      problems: {
        type: 'array',
        minItems: problemCount,
        maxItems: problemCount,
        items: { type: 'string' },
      },
      answers: {
        type: 'array',
        minItems: problemCount,
        maxItems: problemCount,
        items: { type: 'string' },
      },
      explanations: {
        type: 'array',
        minItems: problemCount,
        maxItems: problemCount,
        items: { type: 'string' },
      },
    },
    required: ['title', 'subtitle', 'problems', 'answers', 'explanations'],
  }
}

function buildWorksheetAlignmentSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      isAligned: { type: 'boolean' },
      reason: { type: 'string' },
    },
    required: ['isAligned', 'reason'],
  }
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function hasExpectedNonEmptyItems(value: unknown, problemCount: number) {
  return (
    isStringArray(value) &&
    value.length === problemCount &&
    value.every((item) => item.trim().length > 0)
  )
}

function isWorksheetContent(
  value: unknown,
  problemCount: number,
): value is WorksheetContent {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.title === 'string' &&
    candidate.title.trim().length > 0 &&
    typeof candidate.subtitle === 'string' &&
    candidate.subtitle.trim().length > 0 &&
    hasExpectedNonEmptyItems(candidate.problems, problemCount) &&
    hasExpectedNonEmptyItems(candidate.answers, problemCount) &&
    hasExpectedNonEmptyItems(candidate.explanations, problemCount)
  )
}

function isWorksheetGenerationResult(
  value: unknown,
  problemCount: number,
): value is WorksheetGenerationResult {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.focus === 'string' &&
    isWorksheetContent(candidate.worksheet, problemCount)
  )
}

function isWorksheetAlignmentReview(value: unknown): value is WorksheetAlignmentReview {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.isAligned === 'boolean' &&
    typeof candidate.reason === 'string'
  )
}

function extractResponseText(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const response = payload as Record<string, unknown>

  if (typeof response.output_text === 'string') {
    return response.output_text
  }

  if (!Array.isArray(response.output)) {
    return null
  }

  for (const outputItem of response.output) {
    if (!outputItem || typeof outputItem !== 'object') {
      continue
    }

    const content = (outputItem as Record<string, unknown>).content

    if (!Array.isArray(content)) {
      continue
    }

    for (const contentItem of content) {
      if (!contentItem || typeof contentItem !== 'object') {
        continue
      }

      const text = (contentItem as Record<string, unknown>).text

      if (typeof text === 'string') {
        return text
      }
    }
  }

  return null
}

async function requestStructuredOutput<T>(
  input: unknown[],
  schemaName: string,
  schema: Record<string, unknown>,
) {
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
      input,
      text: {
        format: {
          type: 'json_schema',
          name: schemaName,
          strict: true,
          schema,
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

  const payload = await response.json()
  const outputText = extractResponseText(payload)

  if (!outputText) {
    throw new Error('OpenAI returned no structured payload.')
  }

  return JSON.parse(outputText) as T
}

async function generateWorksheetWithOpenAi(
  topic: string,
  problemCount: number,
  feedback?: string,
) {
  const parsed = await requestStructuredOutput<unknown>(
    [
      {
        role: 'developer',
        content: [
          {
            type: 'input_text',
              text:
                'You generate printable grade-school or early algebra math worksheets. ' +
                'Pick the most relevant mathematical interpretation of the requested topic. ' +
                `Return exactly ${problemCount} concrete math problems, exactly ${problemCount} matching answers, and exactly ${problemCount} brief explanations. ` +
                'Each answer must match the problem at the same position in the problems array. ' +
                'Do not include answer numbering inside answer strings because the UI numbers them. ' +
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
              `The worksheet must contain exactly ${problemCount} problems. ` +
              'Choose concrete problems appropriate for a general learner. ' +
              'If the topic is broad, choose a reasonable sub-scope and reflect it in the title. ' +
              'The problems should clearly belong to that topic, not just to math in general.',
          },
        ],
      },
      ...(feedback
        ? [
            {
              role: 'user',
              content: [
                {
                  type: 'input_text',
                  text:
                    `The previous worksheet draft did not align well enough with the requested topic. ` +
                    `Fix it using this feedback: ${feedback}`,
                },
              ],
            },
          ]
        : []),
    ],
    'worksheet_generation',
    buildWorksheetSchema(problemCount),
  )

  if (!isWorksheetGenerationResult(parsed, problemCount)) {
    throw new Error('OpenAI returned an invalid worksheet generation shape.')
  }

  return parsed
}

async function reviewWorksheetAlignment(topic: string, worksheet: WorksheetContent) {
  const parsed = await requestStructuredOutput<unknown>(
    [
      {
        role: 'developer',
        content: [
          {
            type: 'input_text',
            text:
              'You review whether a generated math worksheet truly matches the requested topic. ' +
              'Be strict about topical alignment. A worksheet about general arithmetic is not aligned ' +
              'if the user asked for a narrower topic like subtraction, fractions, or linear equations.',
          },
        ],
      },
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text:
              `Requested topic: "${topic}". ` +
              `Worksheet title: "${worksheet.title}". ` +
              `Problems: ${worksheet.problems.join(' | ')}. ` +
              `Answers: ${worksheet.answers.join(' | ')}. ` +
              `Explanations: ${worksheet.explanations.join(' | ')}.`,
          },
        ],
      },
    ],
    'worksheet_alignment_review',
    buildWorksheetAlignmentSchema(),
  )

  if (!isWorksheetAlignmentReview(parsed)) {
    throw new Error('OpenAI returned an invalid worksheet alignment review.')
  }

  return parsed
}

async function generateWorksheetContent(topic: string, problemCount: number) {
  if (!openAiApiKey) {
    throw new WorksheetGenerationError(
      'OpenAI API key is required to generate worksheets.',
    )
  }

  try {
    let alignmentFeedback: string | undefined

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const generated = await generateWorksheetWithOpenAi(
        topic,
        problemCount,
        alignmentFeedback,
      )

      if (!generated) {
        throw new WorksheetGenerationError('OpenAI returned no worksheet draft.')
      }

      const review = await reviewWorksheetAlignment(topic, generated.worksheet)

      if (review.isAligned) {
        return generated.worksheet
      }

      alignmentFeedback = review.reason

      if (attempt === 1) {
        throw new OffTopicWorksheetError(review.reason)
      }
    }
  } catch (error) {
    if (error instanceof OffTopicWorksheetError) {
      throw error
    }

    throw new WorksheetGenerationError(
      error instanceof Error
        ? error.message
        : 'Worksheet generation failed before a valid worksheet could be produced.',
    )
  }

  throw new WorksheetGenerationError(
    'Worksheet generation did not produce an aligned worksheet.',
  )
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
      const { topic, problemCount: requestedProblemCount } =
        (await request.json()) as {
          topic?: string
          problemCount?: number
        }

      if (!topic?.trim()) {
        return json({ error: 'Topic is required.' }, 400)
      }

      const problemCount = normalizeProblemCount(requestedProblemCount)
      const editToken = crypto.randomUUID()
      const editTokenHash = await hashToken(editToken)
      const content = await generateWorksheetContent(topic, problemCount)

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

    if (error instanceof OffTopicWorksheetError) {
      return json({ error: error.message }, 422)
    }

    if (error instanceof WorksheetGenerationError) {
      return json({ error: error.message }, 503)
    }

    return json(
      {
        error: error instanceof Error ? error.message : 'Unexpected server error.',
      },
      500,
    )
  }
})
