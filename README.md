# Card Translator

Card Translator is a small Flask web application that uses the OpenAI API to translate the text from wargame card images into any language (French default). The site lets you crop a part of a card, send it to the API for OCR and translation, tweak the styling and download the result as an image.
Find de original cards images of your game here https://vassalengine.org/library/projects

## Portable installation

These instructions assume you want to keep the project on a USB drive and run it on different machines without installing anything globally.

1. **Copy the repository** onto your USB key.
2. **Install Python 3.10+** on each target computer (or carry a portable Python distribution on the USB drive).
3. Open a terminal and create a virtual environment inside the project folder:
   ```bash
   python -m venv venv
   ```
4. Activate the environment:
    * On Windows:
      ```bash
      venv\\Scripts\\activate
      ```
    * On macOS/Linux:
      ```bash
      source venv/bin/activate
      ```
5. Install the Python dependencies:
   ```bash
   pip install flask openai
   ```
6. Create a file `wargame_site/API_KEY.txt` containing your OpenAI API key (the key must be on a single line with no quotes).
7. The temporary image `card.png` and your API key are ignored by Git and remain local to your USB drive.

## Running the application

From the project root:

```bash
cd wargame_site
python app.py
```

The Flask development server starts on `http://localhost:5000`.

## Configuring the OpenAI key

The backend reads the API key from `wargame_site/API_KEY.txt` when it launches. Make sure the file exists before starting the server. Each machine that runs the app must have network access to the OpenAI API.

## Customizing the translation

The actual OCR + translation happens in `wargame_site/backend_translate.py` through a prompt sent to OpenAI. To translate cards into another language, open that file and replace the French instructions in the `prompt` string with your desired target language.

The prompt also contains a bullet list of vocabulary rules. You can add or modify entries to force specific translations or to forbid translation of certain words so key game terms stay in their original language. This keeps terminology consistent from card to card.

Example additions:

```text
- "Victory Points" → "Victory Points"      # keep term untranslated
- "stack" → "pila"                         # custom translation
```

## Using the web interface

1. Open `http://localhost:5000` in a browser.
2. Use the **file picker** to import one or more card images; thumbnails appear in the left column.
3. Click a thumbnail to preview it. Drag to define a **highlight box** around the area to translate.
4. Press **Enter** to send the selection to the OpenAI API. The translated HTML appears on the right and is shown on top of the selected area.
5. Adjust font size, background colour, margins or paste your own HTML using the controls on the right.
6. Use **Validate** to save the translation, **Download** to export the current preview, or **Download all** to export every saved image.
7. **Reset** clears the selection and lets you choose another area of the card.

## License

This project does not currently include a license file; treat it as all rights reserved by the author.
