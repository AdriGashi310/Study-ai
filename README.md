# StudyAI

StudyAI is a school project by **Tech Innovators**. Students can ask about any school topic, add study photos, choose Explain, Summarize, or Quiz, and ask contextual follow-up questions. All study content comes from Gemini at request time.

## Study tools

- **English / Shqip:** the language selector changes the interface and the language of new Gemini answers, quizzes, and follow-ups.
- **Photos:** upload, paste, or drag a JPG, PNG, or WebP photo (up to 12 MB). A photo can be used alone or with a question, in any mode. On supported mobile browsers, use Take a photo. Large photos are resized in the browser before sending to Gemini. The backend checks the decoded size and image signature and does not write photos to disk.
- **History:** drafts, photos, generated answers, follow-ups, and quiz progress are saved locally using the browser's IndexedDB. Reloading restores the current workspace. Open Study history to revisit or delete a session; New study starts a fresh draft without deleting previous sessions.
- **Study notes:** choose a brief, standard, or detailed answer; ask for a simpler explanation or an example; copy notes or download them as Markdown.
- **Quizzes:** answer five dynamic questions, review answers at the end, and generate a fresh quiz from the original material.
- **Shortcut:** Ctrl+Enter (Windows) or Command+Enter (Mac) generates from the question field.

History belongs to the browser and local address you use. It does not sync between Edge, other browsers, or devices. Clearing browser site data removes it. A storage error is shown if the browser cannot save more history.

## Requirements

- Node.js 20.19+ or 22.12+
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Run in VS Code

1. Open this `studyai` folder in VS Code.
2. The Gemini key is already configured in `server/.env` on this computer. Keep that file private and do not share it with the project.
3. In the VS Code terminal, run:

   ```bash
   node scripts/dev.js
   ```

4. Open the local URL printed by Vite, usually `http://127.0.0.1:5173`.

Dependencies are already installed in this delivered folder. If installing on another computer, use `npm install` first, then `npm run dev`; that computer will also need its own key in `server/.env`.

`npm run dev` starts both the Vite frontend and the Express backend. The frontend sends `/api` requests to Express through Vite's development proxy. Press Ctrl+C to stop them.

## Production build

```bash
npm run build
npm start
```

The Express server serves the built frontend at `http://127.0.0.1:3001`. Set `PORT` if another port is needed.

## Project structure

- `src/`: React interface and styles
- `server/server.js`: Express endpoints and Gemini requests
- `server/.env`: private API key (ignored by Git)
- `scripts/dev.js`: starts both development servers

The server uses `gemini-3.5-flash-lite` by default. The originally requested `gemini-2.5-flash-lite` is unavailable to newly created Google projects. You can change the model with `GEMINI_MODEL` if your project supports another model. Quiz responses are requested as structured JSON and validated; an invalid quiz gets one fresh Gemini attempt. StudyAI has no accounts or server database; only the study history is stored locally on the browser.

## Team

Gjina Prapashtica · Jara Tahiri · Juna Buleshkaj · Harisa Bilalli · Lisa Ponosheci · Adri Gashi
