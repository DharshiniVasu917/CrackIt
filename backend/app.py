"""
AI Interview Prep Chatbot - Simple Backend
Flask + Claude API only
No database, no login - everything stored in memory (Python dictionary)
Data is lost when server restarts - that's fine for a demo/prototype
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import anthropic
import os
import uuid

app = Flask(__name__)
CORS(app)  # Allows React frontend to call this backend

# ---------------------------------------------------------
# CLAUDE API SETUP
# ---------------------------------------------------------
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
MODEL_NAME = "claude-sonnet-4-5"


def ask_claude(system_prompt, user_message):
    response = client.messages.create(
        model=MODEL_NAME,
        max_tokens=500,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}]
    )
    return response.content[0].text


# ---------------------------------------------------------
# IN-MEMORY STORAGE (no database)
# sessions = { session_id: { job_role, system_prompt, history: [...] } }
# ---------------------------------------------------------
sessions = {}


# ---------------------------------------------------------
# ROUTE 1: Start Interview
# Body: { "job_role": "Software Engineer" }
# ---------------------------------------------------------
@app.route("/start-interview", methods=["POST"])
def start_interview():
    data = request.get_json()
    job_role = data.get("job_role", "").strip()

    if not job_role:
        return jsonify({"error": "job_role is required"}), 400

    session_id = str(uuid.uuid4())

    system_prompt = (
        f"You are a professional interviewer conducting a mock interview "
        f"for the role of {job_role}. Ask one relevant interview question "
        f"at a time. Keep questions clear and concise. Do not answer the "
        f"question yourself, only ask it."
    )

    first_question = ask_claude(
        system_prompt,
        f"Ask the first interview question for a {job_role} candidate."
    )

    sessions[session_id] = {
        "job_role": job_role,
        "system_prompt": system_prompt,
        "current_question": first_question
    }

    return jsonify({
        "session_id": session_id,
        "question": first_question
    })


# ---------------------------------------------------------
# ROUTE 2: Submit Answer -> Get Feedback + Next Question
# Body: { "session_id": "...", "answer": "..." }
# ---------------------------------------------------------
@app.route("/submit-answer", methods=["POST"])
def submit_answer():
    data = request.get_json()
    session_id = data.get("session_id")
    answer = data.get("answer", "").strip()

    if not session_id or session_id not in sessions:
        return jsonify({"error": "Invalid or expired session_id"}), 400

    if not answer:
        return jsonify({"error": "answer is required"}), 400

    session = sessions[session_id]
    job_role = session["job_role"]
    system_prompt = session["system_prompt"]
    current_question = session["current_question"]

    # Step 1: Get feedback on the answer
    feedback_prompt = (
        f"You are an interview coach for a {job_role} role. "
        f"The candidate was asked: \"{current_question}\"\n"
        f"Their answer: \"{answer}\"\n"
        f"Give short, constructive feedback (2-3 sentences): "
        f"what was good, and one specific improvement."
    )
    feedback = ask_claude(system_prompt, feedback_prompt)

    # Step 2: Generate next question
    next_question_prompt = (
        f"Ask the next interview question for the {job_role} role. "
        f"Do not repeat previous questions. Keep it relevant and concise."
    )
    next_question = ask_claude(system_prompt, next_question_prompt)

    session["current_question"] = next_question

    return jsonify({
        "feedback": feedback,
        "next_question": next_question
    })


# ---------------------------------------------------------
# ROUTE 3: Ask a Related/Follow-up Question (doubt/clarification)
# Body: { "session_id": "...", "question": "..." }
# ---------------------------------------------------------
@app.route("/ask-question", methods=["POST"])
def ask_question():
    data = request.get_json()
    session_id = data.get("session_id")
    user_question = data.get("question", "").strip()

    if not user_question:
        return jsonify({"error": "question is required"}), 400

    job_role = "general"
    system_prompt = (
        "You are a helpful, friendly interview coach. Answer the "
        "candidate's question clearly and concisely, with practical advice."
    )

    if session_id and session_id in sessions:
        job_role = sessions[session_id]["job_role"]
        system_prompt = (
            f"You are a helpful interview coach for a {job_role} role. "
            f"The candidate has a doubt/question during their mock interview "
            f"practice. Answer it clearly and concisely, with practical advice "
            f"relevant to a {job_role} interview."
        )

    answer = ask_claude(system_prompt, user_question)

    return jsonify({"answer": answer})


# ---------------------------------------------------------
# ROUTE 4: End Interview (clear session from memory)
# ---------------------------------------------------------
@app.route("/end-interview/<session_id>", methods=["DELETE"])
def end_interview(session_id):
    if session_id in sessions:
        del sessions[session_id]
        return jsonify({"message": "Session ended"})
    return jsonify({"error": "Session not found"}), 404


if __name__ == "__main__":
    app.run(debug=True, port=5000)
