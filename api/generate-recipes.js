// api/generate-recipes.js
// Runs on Vercel's servers — API key never reaches the browser.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    inventory, macros, cuisines, allergens,
    dislikes, goals, recentTitles, sessionSeed
  } = req.body

  if (!inventory || !macros) {
    return res.status(400).json({ error: 'Missing inventory or macros' })
  }

  const invStr      = inventory.map(i => `${i.name} (${i.qty})`).join(', ')
  const allergenStr = allergens?.length  ? `NEVER use these allergens under any circumstances: ${allergens.join(', ')}.` : ''
  const dislikeStr  = dislikes?.length   ? `User strongly dislikes — exclude completely: ${dislikes.join(', ')}.` : ''
  const cuisineStr  = cuisines?.length   ? `Preferred cuisines: ${cuisines.join(', ')}.` : ''
  const goalStr     = goals?.length      ? `Health goals to factor in: ${goals.join(', ')}.` : ''
  const recentStr   = recentTitles?.length
    ? `These recipes were recently generated — do NOT repeat or closely resemble them: ${recentTitles.join(', ')}.`
    : ''
  const today = new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })
  const seed  = sessionSeed || Math.random().toString(36).slice(2, 8)

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 3000,
        system: `You are an experienced home chef and recipe writer. Your recipes are practical, delicious, and written with enough detail that a beginner can follow them confidently.

Return ONLY a valid JSON array of exactly 4 recipe objects. No markdown, no backticks, no explanation — raw JSON array only.

Each recipe object must have ALL of these fields:
- title: string — specific and appetising, never generic (e.g. "Harissa-spiced chickpea shakshuka" not "Egg dish")
- time: string — total time including prep (e.g. "35 min")
- difficulty: "Easy" or "Medium"
- tag: string — one short label (e.g. "High Protein", "Quick", "Meal Prep", "Plant-Based")
- calories: integer — realistic estimate for the full portion
- protein: integer — grams of protein in the full portion
- desc: string — one vivid sentence describing taste, texture, and occasion
- mealType: one of "breakfast", "lunch", "dinner", "snack"
- prepTip: string — one practical make-ahead or storage tip (e.g. "Doubles well — store in the fridge up to 4 days" or "Batch the sauce on Sunday, cook fresh each night in 10 minutes")
- ingredients: array of 6-10 strings — each with EXACT quantity and preparation note (e.g. "2 large eggs, beaten", "400g tin chickpeas, drained and rinsed", "1 tsp smoked paprika", "juice of half a lemon")
- steps: array of 5-8 strings — each step is 2-3 sentences with specific temperatures, timings, visual cues, and technique tips. Enough detail that someone who has never cooked the dish before can follow without confusion.
- chefTip: string — one sentence of professional advice that makes the dish noticeably better (e.g. seasoning timing, a flavour trick, a texture tip, a common mistake to avoid)

Variety is essential — each generation must produce dishes that differ in cuisine origin, cooking technique, flavour profile, and main ingredient.`,

        messages: [{
          role: 'user',
          content: `Today is ${today}. Variety seed: ${seed}.

Create 4 recipes — one breakfast, one lunch, one dinner, one snack — using ingredients from this kitchen: ${invStr}.

Calorie target per day: ${macros.calories} kcal. Protein target: ${macros.protein}g.
${cuisineStr}
${allergenStr}
${dislikeStr}
${goalStr}
${recentStr}

Additional rules:
- Each of the 4 recipes must come from a different cuisine or cooking tradition
- Prioritise any ingredients that are expiring soon (low days remaining)
- Ingredients list must include exact quantities and prep notes — no vague entries like "some garlic" or "olive oil"
- Steps must be detailed enough for a beginner: include heat levels, pan sizes, visual doneness cues, and timing
- The chefTip must be genuinely useful and specific to that dish — not generic advice
- Calorie and protein estimates must be realistic and accurate for the portion size described`,
        }],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Anthropic error:', data)
      return res.status(500).json({ error: 'AI generation failed', detail: data.error?.message })
    }

    const text    = data.content?.[0]?.text || '[]'
    const clean   = text.replace(/```json|```/g, '').trim()
    const recipes = JSON.parse(clean)

    return res.status(200).json({ recipes })
  } catch (err) {
    console.error('Generate recipes error:', err)
    return res.status(500).json({ error: 'Failed to generate recipes', detail: err.message })
  }
}
