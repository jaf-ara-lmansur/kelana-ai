"use client";

import { Bot, LoaderCircle, MessageCircle, Send, X } from "lucide-react";
import { FormEvent, KeyboardEvent, useState } from "react";

type KnowledgeSource = {
  source: string;
  relevance_score: number | null;
};

type ChatResponse = {
  answer: string;
  sources?: KnowledgeSource[];
  average_relevance_score?: number | null;
  accuracy_message?: string | null;
};

type RawChatResponse = {
  answer: string | ChatResponse;
  sources?: KnowledgeSource[];
  average_relevance_score?: number | null;
  accuracy_message?: string | null;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"
).replace(/\/$/, "");

function removeInlineSources(answer: string) {
  return answer.split("\n---\n**Sources & Relevance:**")[0].trim();
}

function getDocumentName(source: string) {
  try {
    const pathname = new URL(source).pathname;
    return decodeURIComponent(
      pathname.split("/").filter(Boolean).pop() ?? source,
    );
  } catch {
    return source.split("/").filter(Boolean).pop() ?? source;
  }
}

function normalizeSources(sources: KnowledgeSource[] = []) {
  const grouped = new Map<string, KnowledgeSource>();
  for (const source of sources) {
    const documentName = getDocumentName(source.source);
    const key = documentName.toLowerCase();
    const existing = grouped.get(key);
    if (
      !existing ||
      (source.relevance_score ?? -1) > (existing.relevance_score ?? -1)
    ) {
      grouped.set(key, { ...source, source: documentName });
    }
  }
  return [...grouped.values()];
}

function getAverageScore(sources: KnowledgeSource[] = []) {
  const scores = sources
    .map((source) => source.relevance_score)
    .filter((score): score is number => typeof score === "number");
  return scores.length > 0
    ? scores.reduce((total, score) => total + score, 0) / scores.length
    : null;
}

function getAccuracyMessage(averageScore: number | null | undefined) {
  return typeof averageScore === "number" && averageScore < 0.6
    ? `Akurasi hasil rendah (rata-rata score: ${averageScore.toFixed(4)})`
    : null;
}

function normalizeChatResponse(response: RawChatResponse): ChatResponse {
  if (typeof response.answer === "string") {
    return {
      answer: response.answer,
      sources: normalizeSources(response.sources),
      average_relevance_score:
        response.average_relevance_score ?? getAverageScore(response.sources),
      accuracy_message:
        response.accuracy_message ??
        getAccuracyMessage(
          response.average_relevance_score ?? getAverageScore(response.sources),
        ),
    };
  }

  return {
    answer: response.answer.answer,
    sources: normalizeSources(response.answer.sources ?? response.sources),
    average_relevance_score:
      response.answer.average_relevance_score ??
      response.average_relevance_score ??
      getAverageScore(response.answer.sources ?? response.sources),
    accuracy_message:
      response.answer.accuracy_message ??
      response.accuracy_message ??
      getAccuracyMessage(
        response.answer.average_relevance_score ??
          response.average_relevance_score ??
          getAverageScore(response.answer.sources ?? response.sources),
      ),
  };
}

export default function ChatbotFloat() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<ChatResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function submitQuestion(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isLoading) return;

    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/ask`, {
        body: JSON.stringify({ question: trimmedQuestion }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Jawaban belum dapat dimuat. Coba lagi.");
      }

      const responseData = (await response.json()) as RawChatResponse;
      setAnswer(normalizeChatResponse(responseData));
      setQuestion("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Terjadi kesalahan saat menghubungi chatbot.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleQuestionKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitQuestion();
    }
  }

  return (
    <>
      {isOpen && (
        <section className="chatbot-panel" aria-label="Kelana AI chatbot">
          <header className="chatbot-header">
            <div className="chatbot-heading">
              <span className="chatbot-avatar" aria-hidden="true">
                <Bot size={20} />
              </span>
              <div>
                <strong>Kelana AI</strong>
                <span>Knowledge Base assistant</span>
              </div>
            </div>
            <button
              aria-label="Close chatbot"
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X size={18} />
            </button>
          </header>

          <div className="chatbot-messages" aria-live="polite">
            <div className="chatbot-message chatbot-message-bot">
              Hi! Saya Kelana AI. Tanyakan apa saja tentang destinasi dan
              perjalananmu.
            </div>
            {answer && (
              <div className="chatbot-answer">
                <div className="chatbot-message chatbot-message-bot chatbot-answer-text">
                  {removeInlineSources(answer.answer)}
                </div>
                {((answer.sources && answer.sources.length > 0) ||
                  typeof answer.average_relevance_score === "number") && (
                  <div className="chatbot-sources">
                    <strong>Sources &amp; Relevance</strong>
                    {typeof answer.average_relevance_score === "number" && (
                      <div className="chatbot-average-score">
                        Rata-rata score: {answer.average_relevance_score.toFixed(4)}
                      </div>
                    )}
                    {answer.accuracy_message && (
                      <div className="chatbot-low-accuracy">
                        {answer.accuracy_message}
                      </div>
                    )}
                    {answer.sources?.map((source, index) => (
                      <div className="chatbot-source" key={`${source.source}-${index}`}>
                        <span title={source.source}>{source.source}</span>
                        <b>
                          {typeof source.relevance_score === "number"
                            ? source.relevance_score.toFixed(4)
                            : "N/A"}
                        </b>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {isLoading && (
              <div className="chatbot-message chatbot-message-bot chatbot-loading">
                <LoaderCircle aria-hidden="true" size={16} /> Mencari jawaban...
              </div>
            )}
            {error && <p className="chatbot-error" role="alert">{error}</p>}
          </div>

          <form className="chatbot-form" onSubmit={submitQuestion}>
            <textarea
              aria-label="Your question"
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={handleQuestionKeyDown}
              placeholder="Tulis pertanyaanmu..."
              rows={2}
              value={question}
            />
            <button
              aria-label="Send question"
              className="chatbot-send"
              disabled={!question.trim() || isLoading}
              title="Send question"
              type="submit"
            >
              <Send size={17} />
            </button>
          </form>
        </section>
      )}

      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
        className="chatbot-float"
        onClick={() => setIsOpen((open) => !open)}
        title={isOpen ? "Close chatbot" : "Open chatbot"}
        type="button"
      >
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
        <span>{isOpen ? "Close chat" : "Ask Kelana"}</span>
      </button>
    </>
  );
}