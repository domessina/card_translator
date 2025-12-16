from flask import Flask, request, send_from_directory, jsonify
import base64
from backend_translate import process_image_to_html

app = Flask(__name__, static_folder="static")

@app.route('/')
def serve_index():
    return send_from_directory('static', 'index.html')


@app.route('/components/<path:filename>')
def serve_js(filename):
    return send_from_directory('static/components', filename)


@app.route('/translate', methods=['POST'])
def translate_image():
    data = request.json
    image_data = data.get("image_base64", "")
    if not image_data.startswith("data:image/png;base64,"):
        return jsonify({"error": "Invalid image format"}), 400

    image_base64 = image_data.split(",")[1]
    image_bytes = base64.b64decode(image_base64)

    # Sauvegarder temporairement l'image
    temp_image_path = "card.png"
    with open(temp_image_path, "wb") as f:
        f.write(image_bytes)

    # Appeler le traitement
    html = process_image_to_html(temp_image_path)
    return jsonify({"html": html})

if __name__ == '__main__':
    app.run(debug=True)