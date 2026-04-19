// api/generate-recipes.js
// This runs on Vercel's servers — your API key is NEVER sent to the user's browser.
// Vercel calls Anthropic on your behalf and returns the result.

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { inventory, macros, cuisines, allergens, dislikes, goals } = req.body

  if (!inventory || !macros) {
    return res.status(400).json({ error: 'Missing inventory or macros' })
  }

  const invStr = inventory.map(i => `${i.name} (${i.qty})`).join(', ')
  const allergenStr = allergens?.length ? `Never use: ${allergens.join(', ')}.` : ''
  const dislikeStr = dislikes?.length ? `User hates: ${dislikes.join(', ')}.` : ''
  const cuisineStr = cuisines?.length ? `Preferred cuisines: ${cuisines.join(', ')}.` : ''
  const goalStr = goals?.length ? `Health goals: ${goals.join(', ')}.` : ''

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
        max_tokens: 1500,
        system: `You are a personal chef AI. Return ONLY a valid JSON array of exactly 4 recipe objects.
Each object must have these exact fields:
- title: string
- time: string (e.g. "25 min")
- difficulty: "Easy" or "Medium"
- tag: string (short label e.g. "High Protein", "Quick", "Meal Prep")
- calories: integer
- protein: integer
- desc: one sentence description
- mealType: one of "breakfast", "lunch", "dinner", "snack"
- prepTip: string (one sentence meal prep tip, e.g. "Makes 3 portions — stores 4 days")
- ingredients: array of 4-7 strings
- steps: array of 3-5 short strings
No markdown. No backticks. No explanation. Return only the raw JSON array.`,
        messages: [{
          role: 'user',
          content: `Create 4 recipes (1 breakfast, 1 lunch, 1 dinner, 1 snack) using these ingredients: ${invStr}.
Calorie target: ${macros.calories} kcal/day. Protein target: ${macros.protein}g/day.
${cuisineStr} ${allergenStr} ${dislikeStr} ${goalStr}
Prioritise ingredients expiring soon. Make recipes practical and weeknight-friendly.`,
        }],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Anthropic error:', data)
      return res.status(500).json({ error: 'AI generation failed', detail: data.error?.message })
    }

    const text = data.content?.[0]?.text || '[]'
    const clean = text.replace(/```json|```/g, '').trim()
    const recipes = JSON.parse(clean)

    return res.status(200).json({ recipes })
  } catch (err) {
    console.error('Generate recipes error:', err)
    return res.status(500).json({ error: 'Failed to generate recipes', detail: err.message })
  }
}
