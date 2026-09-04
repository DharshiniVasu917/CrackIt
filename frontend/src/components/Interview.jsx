import React, { useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000";

function Interview() {
  const [jobRole, setJobRole] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [answer, setAnswer] = useState("");
  const [chatLog, setChatLog] = useState([]); // { type: 'question'|'answer'|'feedback', text }
  const [doubt, setDoubt] = useState("");
  const [doubtAnswer, setDoubtAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const startInterview = async () => {
    if (!jobRole.trim()) return alert("Enter a job role first");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/start-interview`, {
        job_role: jobRole
      });
      setSessionId(res.data.session_id);
      setChatLog([{ type: "question", text: res.data.question }]);
    } catch (err) {
      console.error(err);
      alert("Failed to start interview. Check backend is running.");
    }
    setLoading(false);
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/submit-answer`, {
        session_id: sessionId,
        answer
      });
      setChatLog((prev) => [
        ...prev,
        { type: "answer", text: answer },
        { type: "feedback", text: res.data.feedback },
        { type: "question", text: res.data.next_question }
      ]);
      setAnswer("");
    } catch (err) {
      console.error(err);
      alert("Failed to submit answer");
    }
    setLoading(false);
  };

  const askDoubt = async () => {
    if (!doubt.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/ask-question`, {
        session_id: sessionId,
        question: doubt
      });
      setDoubtAnswer(res.data.answer);
      setDoubt("");
    } catch (err) {
      console.error(err);
      alert("Failed to get answer");
    }
    setLoading(false);
  };

  const endInterview = async () => {
    if (sessionId) {
      await axios.delete(`${API_BASE}/end-interview/${sessionId}`);
    }
    setSessionId(null);
    setChatLog([]);
    setDoubtAnswer("");
  };

  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: "center" }}>CrackIT - Interview Prep Chatbot</h2>

      {!sessionId ? (
        <div style={styles.setup}>
          <h3>Start a Mock Interview</h3>
          <input
            style={styles.input}
            placeholder="Enter job role (e.g. Software Engineer)"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
          />
          <button style={styles.btn} onClick={startInterview} disabled={loading}>
            {loading ? "Starting..." : "Start Interview"}
          </button>
        </div>
      ) : (
        <div style={styles.chatArea}>
          <div style={styles.chatLog}>
            {chatLog.map((msg, i) => (
              <div
                key={i}
                style={{
                  ...styles.bubble,
                  ...(msg.type === "question" ? styles.questionBubble : {}),
                  ...(msg.type === "answer" ? styles.answerBubble : {}),
                  ...(msg.type === "feedback" ? styles.feedbackBubble : {})
                }}
              >
                <strong>
                  {msg.type === "question" ? "Interviewer" :
                   msg.type === "answer" ? "You" : "Feedback"}:
                </strong>{" "}
                {msg.text}
              </div>
            ))}
          </div>

          <textarea
            style={styles.textarea}
            placeholder="Type your answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <button style={styles.btn} onClick={submitAnswer} disabled={loading}>
            {loading ? "Submitting..." : "Submit Answer"}
          </button>

          <hr style={{ margin: "20px 0" }} />

          <div style={styles.doubtBox}>
            <h4>Have a doubt? Ask here</h4>
            <input
              style={styles.input}
              placeholder="e.g. What do they mean by system design?"
              value={doubt}
              onChange={(e) => setDoubt(e.target.value)}
            />
            <button style={styles.btn} onClick={askDoubt} disabled={loading}>
              Ask
            </button>
            {doubtAnswer && (
              <div style={styles.doubtAnswer}>{doubtAnswer}</div>
            )}
          </div>

          <button style={styles.endBtn} onClick={endInterview}>
            End Interview
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: "700px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" },
  setup: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "10px", fontSize: "14px", borderRadius: "6px", border: "1px solid #ccc" },
  btn: { padding: "10px", backgroundColor: "#4285F4", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" },
  endBtn: { padding: "10px", backgroundColor: "#e53935", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", marginTop: "10px" },
  chatArea: { display: "flex", flexDirection: "column", gap: "10px" },
  chatLog: { display: "flex", flexDirection: "column", gap: "8px", maxHeight: "400px", overflowY: "auto", padding: "10px", border: "1px solid #eee", borderRadius: "8px" },
  bubble: { padding: "10px", borderRadius: "8px", backgroundColor: "#f5f5f5" },
  questionBubble: { backgroundColor: "#e3f2fd" },
  answerBubble: { backgroundColor: "#e8f5e9" },
  feedbackBubble: { backgroundColor: "#fff3e0", fontStyle: "italic" },
  textarea: { padding: "10px", minHeight: "80px", borderRadius: "6px", border: "1px solid #ccc" },
  doubtBox: { display: "flex", flexDirection: "column", gap: "8px", backgroundColor: "#fafafa", padding: "10px", borderRadius: "8px" },
  doubtAnswer: { padding: "10px", backgroundColor: "#eeeeee", borderRadius: "6px" }
};

export default Interview;
