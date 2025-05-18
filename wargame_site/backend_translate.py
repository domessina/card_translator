import base64
from openai import OpenAI

# Nom du fichier à lire
filename = "API_KEY.txt"

with open(filename, "r", encoding="utf-8") as file:
    contenu = file.read()

client = OpenAI(api_key=contenu)

prompt = """
Ceci est une carte de jeu wargame.

Ta tâche :
1. Extrais le texte visible sur l’image. Il se peut que le texte soit accompagné de petites images, ignore les.
2. Traduis-le intégralement en français, y compris les instructions de règles comme "Remove from play" (→ "Retirer du jeu").
3. Utilise impérativement les traductions spécifiques suivantes pour certains mots :
- "intelligence" → "renseignement"
- "step" → "step"
- "hex" → "hex"
- "hexes" → "hexes"
- "draw" → "piochez"
- "stack" → "pile"
4. Garde les acronymes et noms propres inchangés (ex : US, Strategic Agreement, Ledo, Imphal).
5. Formate uniquement en HTML avec les balises <p>, <b> et <i>. Il est possibe que certains textes soient à la fois <b> et <i>
6. Si un mot ou une phrase est coloré(e) (par exemple en bleu ou rouge), applique un style inline HTML (style="color:...") sur la balise concernée.

Ne retourne que le HTML final.
"""

def process_image_to_html(image_path):
    with open(image_path, "rb") as f:
        image_bytes = f.read()
        base64_image = base64.b64encode(image_bytes).decode("utf-8")

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{base64_image}",
                            "detail": "high"
                        }
                    }
                ]
            }
        ],
        max_tokens=2000
    )

    html_output = response.choices[0].message.content
    if html_output.startswith("```html"):
        html_output = html_output.strip()[7:]
    if html_output.endswith("```"):
        html_output = html_output.strip()[:-3]

    return html_output.strip()