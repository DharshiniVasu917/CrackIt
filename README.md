# CrackIT - Interview Prep Chatbot (Simple Version)

No database, no login. Just Flask + React + Claude API.
Data stays in memory while the server runs — that's fine for a demo.

## STEP 1 — Run Backend

Open VS Code, open the `backend` folder in a terminal:

```bash
cd backend
pip install -r requirements.txt
```

Set your Claude API key (get one at console.anthropic.com):

Windows PowerShell:
```
$env:ANTHROPIC_API_KEY="your-key-here"
```

Mac/Linux:
```
export ANTHROPIC_API_KEY="your-key-here"
```

Run it:
```
python app.py
```

You should see: `Running on http://localhost:5000`
Keep this terminal open.

## STEP 2 — Run Frontend

Open a NEW terminal (keep backend terminal running):

```bash
cd frontend
npm install
npm start
```

Browser opens automatically at `http://localhost:3000`

## How to use

1. Type a job role (e.g. "Software Engineer") → click Start Interview
2. AI asks a question → type your answer → Submit Answer
3. Get feedback + next question automatically
4. Have a doubt? Type it in the "Have a doubt?" box anytime — get a clear answer
5. Click "End Interview" when done

## API Endpoints (for reference)

| Endpoint | Method | Purpose |
|---|---|---|
| `/start-interview` | POST | Start session, get first question |
| `/submit-answer` | POST | Submit answer, get feedback + next question |
| `/ask-question` | POST | Ask any related doubt/question |
| `/end-interview/<id>` | DELETE | Clear session |

## Troubleshooting

- `ModuleNotFoundError` → run `pip install -r requirements.txt` again
- Backend not responding → make sure `python app.py` terminal is still running
- CORS error → confirm backend is running on port 5000
