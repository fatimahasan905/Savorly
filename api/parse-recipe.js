// api/parse-recipe.js
// Extracts recipe data from any URL using Claude.
// Your API key stays here on the server — never in the browser.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { url } = req.body

  if (!url) {
    return res.status(400).json({ error: 'Missing URL' })
  }

  // Detect source platform
  const source = url.includes('tiktok.com') ? 'tiktok'
    : url.includes('instagram.com') ? 'instagram'
    : url.includes('youtube.com') || url.includes('youtu.be') ? 'youtube'
    : 'web'

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        system: `You extract recipe information from URLs. Return ONLY a JSON object with these fields:
- title: string
- time: string (e.g. "25 min")
- difficulty: "Easy" or "Medium" or "Hard"
- tag: string (short label)
- calories: integer (estimate if not given)
- protein: integer (estimate if not given)  
- desc: one sentence
- mealType: one of "breakfast", "lunch", "dinner", "snack"
- ingredients: array of strings
- steps: array of strings
If you cannot access the URL or extract a recipe, return: {"error": "Could not extract recipe from this link"}
No markdown. No backticks. Return only the raw JSON object.`,
        messages: [{
          role: 'user',
          content: `Extract the recipe from this URL: ${url}
Source platform: ${source}
If this is a social media URL, infer a recipe based on the URL slug, handle, or any context available.`,
        }],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(500).json({ error: 'AI extraction failed' })
    }

    const text = data.content?.[0]?.text || '{}'
    const clean = text.replace(/```json|```/g, '').trim()
    const recipe = JSON.parse(clean)

    if (recipe.error) {
      return res.status(422).json({ error: recipe.error })
    }

    return res.status(200).json({ recipe: { ...recipe, source, id: Date.now() } })
  } catch (err) {
    console.error('Parse recipe error:', err)
    return res.status(500).json({ error: 'Failed to parse recipe', detail: err.message })
  }
}
