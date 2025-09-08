import OpenAI from "openai";
require("dotenv").config();

const client = new OpenAI({ apiKey: process.env.OPENAI_KEY! });

export async function structureMenu(ocrText: string) {
  const prompt = `You are an expert restaurant menu formatter. 
Take the following OCR text from a restaurant menu and convert it into a valid JSON structure.

Schema:
{
  "categories": [
    {
      "name": "string",
      "items": [
        {
          "name": "string",
          "description": "string",
          "price": number,
          "currency": "string",
          "tags": ["veg | non-veg | spicy | beverage | dessert"],
          "variants": [
            { "name": "string", "price": number }
          ],
          "addons": [
            { "name": "string", "price": number }
          ],
          "allergens": ["gluten | dairy | peanuts | soy | egg | none"],
          "nutrition": {
            "calories": number,
            "protein_g": number,
            "fat_g": number,
            "carbs_g": number,
            "sugar_g": number
          }
        }
      ]
    }
  ]
}

Rules:
1. Detect categories from headings (e.g., Starters, Tandoori, Biryani, Sides & Breads).
2. Map each item with {name, description, price}.
3. If an item has no description, generate a short standard one (e.g., "Traditional Indian bread with butter").
4. If the menu shows sizes (Small/Medium/Large), put them under "variants".
5. If the menu shows toppings/extras, put them under "addons".
6. Add tags: veg/non-veg/spicy/beverage/dessert.
7. Guess allergens if obvious (Paneer → dairy, Bread → gluten, Coke → none).
8. Estimate nutrition (calories, protein, fat, carbs, sugar) using typical serving sizes.
9. Always return only valid JSON. 
10. If uncertain about any field, use null or empty array.

Menu text:
---
${ocrText}
---
`;

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
  });

  const output = res.choices[0].message.content
    ? cleanJsonResponse(res.choices[0].message.content)
    : "{}";
  return JSON.parse(output);
}

function cleanJsonResponse(raw: string): string {
  return raw
    .replace(/```json/g, "") // remove starting ```json
    .replace(/```/g, "") // remove ending ```
    .trim();
}
