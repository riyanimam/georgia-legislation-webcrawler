# TODO: LLM-Powered Bill Explanations in Plain English

## Overview

Implement AI-powered bill summaries that explain Georgia legislation in simple, everyday language
that the general public can understand. This feature will make legislative content more accessible
to citizens who may not be familiar with legal terminology.

## Feature Description

Add a "Plain English Explanation" section to each bill that uses a Large Language Model (LLM) to
translate complex legislative language into clear, understandable explanations for everyday people.

## Technical Requirements

### 1. LLM Integration Options

**Option A: Server-Side Processing (Recommended)**

- Set up a backend API (AWS Lambda, Vercel Serverless, etc.)
- Use OpenAI GPT-4, Anthropic Claude, or similar API
- Process bill summaries on-demand or during data refresh
- Cache explanations to reduce API costs

**Option B: Client-Side Processing**

- Use browser-based LLM (e.g., Web LLM, smaller models)
- Process on user's device (privacy-friendly)
- May have performance limitations

**Option C: Pre-Generated Explanations**

- Generate explanations during scraping/data pipeline
- Store in JSON alongside bill data
- No runtime API calls needed (most cost-effective)

### 2. Data Structure Changes

#### Update Bill Interface (`src/types.ts`)

```typescript
export interface Bill {
  // ... existing fields
  plain_english_summary?: PlainEnglishSummary
}

export interface PlainEnglishSummary {
  explanation: string
  key_points: string[]
  who_it_affects: string[]
  potential_impact: string
  generated_at: string
  model_version: string
}
```

#### Example Explanation Format

```json
{
  "plain_english_summary": {
    "explanation": "This bill proposes to increase funding for public schools by $500 million over the next two years. The money would go towards teacher salaries, classroom resources, and building renovations.",
    "key_points": [
      "Increases education budget by $500M",
      "Funds will be distributed based on school enrollment",
      "Priority for underfunded districts"
    ],
    "who_it_affects": [
      "Public school teachers (salary increases)",
      "Students (better resources and facilities)",
      "School districts (more funding)"
    ],
    "potential_impact": "Positive: Could improve education quality. May require tax adjustments to fund the increase.",
    "generated_at": "2026-01-18T10:30:00Z",
    "model_version": "gpt-4-turbo"
  }
}
```

### 3. LLM Prompt Engineering

#### Recommended Prompt Template

```
You are an expert at explaining legislation to everyday citizens.

Bill Title: {bill.caption}
Bill Number: {bill.doc_number}
Official Summary: {bill.summary}
Status: {latestStatus}

Please provide:
1. A clear explanation of what this bill does in 2-3 sentences using everyday language
2. 3-5 key points in simple bullet format
3. Who this bill affects (specific groups of people)
4. Potential impact (both positive and negative considerations)

Keep language at a 8th grade reading level. Avoid jargon. Be neutral and factual.
```

### 4. UI/UX Implementation

#### BillModal Component Updates (`src/components/BillModal.tsx`)

Add new section after the Summary:

```tsx
{bill.plain_english_summary && (
  <motion.div style={{ marginTop: '24px' }}>
    <h3 style={{ 
      fontSize: '1.3em', 
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <Lightbulb size={20} /> {/* or Sparkles icon */}
      Plain English Explanation
    </h3>
    
    <div style={{ 
      background: 'rgba(255, 215, 0, 0.1)',
      border: '1px solid rgba(255, 215, 0, 0.3)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px'
    }}>
      <p style={{ fontSize: '1.05em', lineHeight: '1.6' }}>
        {bill.plain_english_summary.explanation}
      </p>
    </div>

    <h4>Key Points</h4>
    <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
      {bill.plain_english_summary.key_points.map((point, i) => (
        <li key={i}>{point}</li>
      ))}
    </ul>

    <h4>Who It Affects</h4>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {bill.plain_english_summary.who_it_affects.map((group, i) => (
        <span key={i} style={{
          background: 'var(--accent-primary)',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '16px',
          fontSize: '0.9em'
        }}>
          {group}
        </span>
      ))}
    </div>

    <div style={{ 
      marginTop: '16px',
      fontSize: '0.85em',
      color: 'var(--text-secondary)',
      fontStyle: 'italic'
    }}>
      AI-generated explanation • Reviewed for accuracy
    </div>
  </motion.div>
)}
```

#### Loading State for On-Demand Generation

```tsx
const [generatingExplanation, setGeneratingExplanation] = useState(false)

{!bill.plain_english_summary && (
  <motion.button
    onClick={() => generatePlainEnglish(bill)}
    disabled={generatingExplanation}
    style={{
      background: 'linear-gradient(135deg, #ffd700, #ffa502)',
      border: 'none',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '1em',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}
  >
    <Sparkles size={18} />
    {generatingExplanation ? 'Generating...' : 'Generate Plain English Explanation'}
  </motion.button>
)}
```

### 5. API Implementation (Backend)

#### Example Serverless Function (Vercel/Netlify)

```typescript
// api/generate-explanation.ts
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { bill } = req.body

  const prompt = `You are an expert at explaining legislation to everyday citizens.

Bill Title: ${bill.caption}
Bill Number: ${bill.doc_number}
Official Summary: ${bill.summary || 'No summary available'}

Please provide:
1. A clear explanation of what this bill does in 2-3 sentences using everyday language
2. 3-5 key points in simple bullet format
3. Who this bill affects (specific groups of people)
4. Potential impact (both positive and negative considerations)

Keep language at a 8th grade reading level. Avoid jargon. Be neutral and factual.
Format your response as JSON with this structure:
{
  "explanation": "...",
  "key_points": ["...", "..."],
  "who_it_affects": ["...", "..."],
  "potential_impact": "..."
}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that explains legislation in plain English.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 500
    })

    const response = JSON.parse(completion.choices[0].message.content)
    
    return res.status(200).json({
      ...response,
      generated_at: new Date().toISOString(),
      model_version: 'gpt-4-turbo'
    })
  } catch (error) {
    console.error('Error generating explanation:', error)
    return res.status(500).json({ error: 'Failed to generate explanation' })
  }
}
```

#### Frontend API Call

```typescript
// src/utils/api.ts
export async function generatePlainEnglishExplanation(bill: Bill): Promise<PlainEnglishSummary> {
  const response = await fetch('/api/generate-explanation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bill })
  })

  if (!response.ok) {
    throw new Error('Failed to generate explanation')
  }

  return response.json()
}
```

### 6. Cost Considerations

#### API Cost Estimates (OpenAI GPT-4 Turbo)

- ~500 tokens per request (input + output)
- Cost: ~$0.01 per bill explanation
- 1000 bills = $10
- 10,000 bills = $100

#### Cost Optimization Strategies

1. **Batch Processing**: Generate explanations during nightly data refresh
2. **Caching**: Store explanations in JSON, only regenerate when bill changes
3. **Rate Limiting**: Limit on-demand generations per user
4. **Tiered Access**: Free users see cached, premium users get fresh
5. **Alternative Models**: Use GPT-3.5-turbo ($0.002/bill) or Claude 3 Haiku

### 7. Quality Assurance

#### Validation Checks

- Ensure explanations are neutral (no political bias)
- Verify reading level (use Flesch-Kincaid score)
- Check for factual accuracy against original summary
- Flag explanations that need human review

#### Human Review Process

```typescript
export interface PlainEnglishSummary {
  // ... existing fields
  review_status: 'pending' | 'approved' | 'needs_revision'
  reviewed_by?: string
  review_notes?: string
}
```

### 8. Multi-Language Support

Since the site supports Spanish and French, explanations should also be translated:

```typescript
export interface PlainEnglishSummary {
  en: {
    explanation: string
    key_points: string[]
    // ...
  }
  es?: {
    explanation: string
    key_points: string[]
    // ...
  }
  fr?: {
    explanation: string
    key_points: string[]
    // ...
  }
}
```

### 9. Privacy & Ethics

#### Important Considerations

- **Disclaimer**: Clearly state AI-generated content is for informational purposes
- **Accuracy**: Not a substitute for legal advice or official documentation
- **Bias**: Monitor for political bias or misleading interpretations
- **Transparency**: Show which AI model generated the explanation
- **User Control**: Allow users to report inaccurate explanations

#### Recommended Disclaimer

```
⚠️ AI-Generated Content: This explanation was created by artificial intelligence 
and should not be considered legal advice. Always refer to the official bill 
text and consult with legal professionals for authoritative information.
```

### 10. Implementation Timeline

#### Phase 1: MVP (2-3 weeks)

- [ ] Set up backend API endpoint
- [ ] Integrate LLM (OpenAI or Anthropic)
- [ ] Update data structure
- [ ] Add UI component to BillModal
- [ ] Test with 50-100 bills

#### Phase 2: Optimization (1-2 weeks)

- [ ] Add caching layer
- [ ] Implement batch processing
- [ ] Add loading states and error handling
- [ ] Quality assurance checks

#### Phase 3: Enhancement (1-2 weeks)

- [ ] Multi-language support (Spanish, French)
- [ ] User feedback mechanism
- [ ] Admin review dashboard
- [ ] Analytics tracking

## Alternative Approaches

### 1. Use Existing Summaries with Enhancement

Instead of LLM, use regex/NLP to:

- Simplify sentences (break long ones)
- Replace jargon with plain terms
- Highlight key verbs (increases, decreases, requires)

### 2. Community-Powered Explanations

- Allow users to submit plain English summaries
- Vote on best explanations (Reddit-style)
- Moderator approval process

### 3. Hybrid Approach

- Use LLM for initial draft
- Allow community edits and improvements
- Verified explanations marked with badge

## Success Metrics

- % of bills with explanations
- User engagement (clicks on "Plain English" section)
- Feedback ratings (helpful/not helpful)
- Time spent reading explanations
- Reduction in "view full text" clicks

## Dependencies

- LLM API (OpenAI, Anthropic, etc.)
- Backend infrastructure (serverless functions)
- Updated data pipeline
- UI/UX updates

## Resources Needed

- **Development**: 40-60 hours
- **API Costs**: $100-500/month (depending on volume)
- **Testing**: 10-20 hours
- **Content Review**: Ongoing (if human review implemented)

## Questions to Resolve

1. Which LLM provider to use? (OpenAI, Anthropic, Google, open-source)
2. On-demand generation or pre-generated?
3. Human review required or automated only?
4. Budget for API costs?
5. How to handle bill updates (regenerate explanation)?
6. Should explanations be cached permanently or expire?

## References

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Flesch-Kincaid Readability](https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests)
- [Plain Language Guidelines](https://www.plainlanguage.gov/)

______________________________________________________________________

**Status**: Pending Implementation\
**Priority**: High (accessibility feature)\
**Estimated Effort**: Medium-High\
**Last Updated**: January 18, 2026
