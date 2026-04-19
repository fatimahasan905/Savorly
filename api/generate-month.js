// api/generate-month.js
// Called once during onboarding to pre-populate the meal bank with a full month of recipes.
// Two modes:
//   type = "user_recipes"   → generates full recipes for dishes the user told us they make
//   type = "ai_suggestions" → generates varied AI-recommended recipes based on preferences

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { mealNames, type, cuisines, allergens, dislikes, goals, macros, inventory, batchSeed, existingTitles } = req.body

  const allergenStr    = allergens?.length     ? `NEVER use these allergens: ${allergens.join(', ')}.` : ''
  const dislikeStr     = dislikes?.length      ? `Exclude completely — user hates: ${dislikes.join(', ')}.` : ''
  const cuisineStr     = cuisines?.length      ? `Preferred cuisines: ${cuisines.join(', ')}.` : ''
  const goalStr        = goals?.length         ? `Health goals: ${goals.join(', ')}.` : ''
  const invStr         = inventory?.length     ? `Pantry available: ${inventory.map(i => i.name).join(', ')}.` : ''
  const existingStr    = existingTitles?.length ? `Do NOT repeat or closely resemble these already-generated recipes: ${existingTitles.join(', ')}.` : ''

  const systemPrompt = `You are an experienced home chef and recipe writer. Return ONLY a valid JSON array of recipe objects. No markdown, no backticks, no explanation — raw JSON only.

Each recipe object must have ALL of these fields:
- title: string — specific and appetising (e.g. "Harissa-spiced chickpea shakshuka" not "Egg dish")
- time: string — total time including prep (e.g. "35 min")
- difficulty: "Easy" or "Medium"
- tag: string — one short label (e.g. "High Protein", "Quick", "Meal Prep", "Plant-Based")
- calories: integer — realistic estimate for the full portion
- protein: integer — grams of protein in full portion
- desc: string — one vivid sentence describing taste, texture, and occasion
- mealType: one of "breakfast", "lunch", "dinner", "snack"
- prepTip: string — practical make-ahead or storage tip
- ingredients: array of 6-10 strings — each with EXACT quantity and prep note (e.g. "2 large eggs, beaten", "400g tin chickpeas, drained and rinsed")
- steps: array of 5-8 strings — each 2-3 sentences with temperatures, timings, visual cues, and technique
- chefTip: string — one specific professional technique that makes this dish noticeably better`

  let userPrompt = ''

  if (type === 'user_recipes') {
    const names = (mealNames || []).slice(0, 10)
    userPrompt = `The user told us these are dishes they make or eat regularly: ${names.join(', ')}.

Generate a full, detailed recipe for each dish listed above. Adapt each recipe to these preferences:
${cuisineStr} ${allergenStr} ${dislikeStr} ${goalStr}
Daily calorie target: ${macros?.calories || 2000} kcal. Protein target: ${macros?.protein || 120}g.
${invStr}

Return exactly ${names.length} recipes — one for each dish listed, in the same order.
Make each recipe feel personal and authentic to that dish — these are the user's own favourites.`
  } else {
    const seed = batchSeed || Math.random().toString(36).slice(2, 8)
    userPrompt = `Generate 6 varied recipe suggestions for a home cook with these preferences:
${cuisineStr} ${allergenStr} ${dislikeStr} ${goalStr}
Daily calorie target: ${macros?.calories || 2000} kcal. Protein target: ${macros?.protein || 120}g.
${invStr}
${existingStr}

Variety seed: ${seed}
Rules:
- Each recipe must come from a different cuisine or cooking tradition
- Include a mix of meal types: aim for 1-2 breakfasts, 2-3 lunches or dinners, 1 snack
- Every dish must differ in main protein or hero ingredient
- Be creative and specific with names — never generic`
  }

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
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('Anthropic error:', data)
      return res.status(500).json({ error: 'Generation failed', detail: data.error?.message })
    }

    const text    = data.content?.[0]?.text || '[]'
    const clean   = text.replace(/```json|```/g, '').trim()
    const recipes = JSON.parse(clean)

    return res.status(200).json({ recipes })
  } catch (err) {
    console.error('generate-month error:', err)
    return res.status(500).json({ error: 'Failed', detail: err.message })
  }
}
