// api/parse-grocery-receipt.js
// Accepts a base64-encoded image of a grocery receipt.
// Returns extracted grocery items with name, quantity, and category.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { imageBase64, mediaType } = req.body
  if (!imageBase64) return res.status(400).json({ error: 'Missing image data' })

  const type = mediaType || 'image/jpeg'

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
        max_tokens: 1000,
        system: `You extract grocery items from receipt images. Return ONLY a valid JSON array of objects. No markdown, no backticks.
Each object must have:
- name: string (clean product name, no brand unless essential)
- qty: string (quantity and unit if visible, e.g. "1kg", "2 units", "500ml", or "1 unit" if not clear)
- cat: string — one of: Vegetables, Fruit, Protein, Dairy, Grains, Legumes, Pantry, Snacks, Drinks, Frozen, Other
- d: integer — estimated days until expiry (e.g. fresh veg=5, dairy=7, pantry=60, frozen=90)
Ignore non-food items, cleaning products, and totals/prices.`,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: type, data: imageBase64 },
            },
            {
              type: 'text',
              text: 'Extract all grocery food items from this receipt. Return a JSON array.',
            },
          ],
        }],
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('Anthropic error:', data)
      return res.status(500).json({ error: 'Receipt parsing failed' })
    }

    const text  = data.content?.[0]?.text || '[]'
    const clean = text.replace(/```json|```/g, '').trim()
    const items = JSON.parse(clean)

    return res.status(200).json({ items })
  } catch (err) {
    console.error('parse-grocery-receipt error:', err)
    return res.status(500).json({ error: 'Failed to parse receipt', detail: err.message })
  }
}
