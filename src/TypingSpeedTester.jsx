import React, { useEffect, useRef, useState } from "react";
import "./style.css";

const words = [
  "the",
  "be",
  "of",
  "and",
  "a",
  "to",
  "in",
  "he",
  "have",
  "it",
  "that",
  "for",
  "they",
  "with",
  "as",
  "not",
  "on",
  "she",
  "at",
  "by",
  "this",
  "we",
  "you",
  "do",
  "but",
  "from",
  "or",
  "which",
  "one",
  "would",
  "all",
  "will",
  "there",
  "say",
  "who",
  "make",
  "when",
  "can",
  "more",
  "if",
  "no",
  "man",
  "out",
  "other",
  "so",
  "what",
  "time",
  "up",
  "go",
  "about",
  "than",
  "into",
  "could",
  "state",
  "only",
  "new",
  "year",
  "some",
  "take",
  "come",
  "these",
  "know",
  "see",
  "use",
  "get",
  "like",
  "then",
  "first",
  "any",
  "work",
  "now",
  "may",
  "such",
  "give",
  "over",
  "think",
  "most",
  "even",
  "find",
  "day",
  "also",
  "after",
  "way",
  "many",
  "must",
  "look",
  "before",
  "great",
  "back",
  "through",
  "long",
  "where",
  "much",
  "should",
  "well",
  "people",
  "down",
  "own",
  "just",
  "because",
  "good",
  "each",
  "those",
  "feel",
  "seem",
  "how",
  "high",
  "too",
  "place",
  "little",
  "world",
  "very",
  "still",
  "nation",
  "hand",
  "old",
  "life",
  "tell",
  "write",
  "become",
  "here",
  "show",
  "house",
  "both",
  "between",
  "need",
  "mean",
  "call",
  "develop",
  "under",
  "last",
  "right",
  "move",
  "thing",
  "general",
  "school",
  "never",
  "same",
  "another",
  "begin",
  "while",
  "number",
  "part",
  "turn",
  "real",
  "leave",
  "might",
  "want",
  "point",
  "form",
  "off",
  "child",
  "few",
  "small",
  "since",
  "against",
  "ask",
  "late",
  "home",
  "interest",
  "large",
  "person",
  "end",
  "open",
  "public",
  "follow",
  "during",
  "present",
  "without",
  "again",
  "hold",
  "govern",
  "around",
  "possible",
  "head",
  "consider",
  "word",
  "program",
  "pro",
];

function generateWords(count = 25) {
  const shuffled = [...words].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export default function TypingSpeedTester() {
  const [wordCount, setWordCount] = useState(25);
  const [wordList, setWordList] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [finished, setFinished] = useState(false);

  const [wpm, setWpm] = useState(0);
  const [rawWpm, setRawWpm] = useState(0);
  const [cpm, setCpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [elapsed, setElapsed] = useState(0);

  const totalChars = useRef(0);
  const wrongChars = useRef(0);
  const correctChars = useRef(0);
  const correctWords = useRef(0);
  const totalWords = useRef(0);

  const captureRef = useRef(null);
  const activeWordRef = useRef(null);
  const timerRef = useRef(null);

  const resetGame = (count = wordCount) => {
    setWordList(generateWords(count));
    setCurrentWordIndex(0);
    setInput("");
    setStarted(false);
    setStartTime(null);
    setFinished(false);
    setWpm(0);
    setRawWpm(0);
    setCpm(0);
    setAccuracy(100);
    setElapsed(0);

    totalChars.current = 0;
    wrongChars.current = 0;
    correctChars.current = 0;
    correctWords.current = 0;
    totalWords.current = 0;

    clearInterval(timerRef.current);
    requestAnimationFrame(() => captureRef.current?.focus());
  };

  useEffect(() => {
    resetGame(wordCount);
  }, []);

  useEffect(() => {
    if (activeWordRef.current) {
      activeWordRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }, [currentWordIndex]);

  useEffect(() => {
    if (started && !finished) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [started, startTime, finished]);

  const handleRootClick = (e) => {
    if (e.target && e.target.closest && e.target.closest(".no-focus")) return;
    captureRef.current?.focus();
  };

  const handleWordCountChange = (e) => {
    const newCount = Number(e.target.value);
    setWordCount(newCount);
    resetGame(newCount);
  };

  const handleKeyDown = (e) => {
    if (finished) return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    if (!started) {
      setStarted(true);
      setStartTime(Date.now());
    }

    if (e.key === " ") {
      e.preventDefault();
      const trimmed = input.trim();
      const target = wordList[currentWordIndex] || "";

      const maxLen = Math.max(trimmed.length, target.length);
      for (let i = 0; i < maxLen; i++) {
        if (trimmed[i] === target[i]) correctChars.current++;
        else wrongChars.current++;
      }

      totalWords.current++;
      if (trimmed === target) correctWords.current++;

      totalChars.current += trimmed.length;

      const next = currentWordIndex + 1;
      setCurrentWordIndex(next);
      setInput("");
      if (next === wordList.length) finishTest();
    } else if (e.key === "Backspace") {
      setInput((prev) => prev.slice(0, -1));
    } else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
      setInput((prev) => prev + e.key);
    }

    updateLiveStats();
  };

  const updateLiveStats = () => {
    if (!started || !startTime) return;
    const now = Date.now();
    const minutes = Math.max((now - startTime) / 1000 / 60, 1 / 600);

    setWpm(Math.round(correctWords.current / minutes));
    setRawWpm(Math.round(wordCount / minutes));
    setCpm(Math.round(correctChars.current / minutes));

    const denom = correctChars.current + wrongChars.current;
    setAccuracy(
      denom > 0 ? Math.round((correctChars.current / denom) * 100) : 100
    );
  };

  const finishTest = () => {
    const endTime = Date.now();
    const minutes = Math.max((endTime - startTime) / 1000 / 60, 1 / 600);

    setWpm(Math.round(correctWords.current / minutes));
    setRawWpm(Math.round(wordCount / minutes));
    setCpm(Math.round(correctChars.current / minutes));

    const denom = correctChars.current + wrongChars.current;
    setAccuracy(
      denom > 0 ? Math.round((correctChars.current / denom) * 100) : 100
    );

    setFinished(true);
    clearInterval(timerRef.current);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="mt-root" onClick={handleRootClick}>
      <div
        ref={captureRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="hidden-capture"
        aria-label="typing-capture"
        role="textbox"
      />

      <div className="mt-logo no-focus">CheeType</div>

      <div className="mt-container">
        <div className="mt-topbar no-focus">
          <div className="mt-controls no-focus">
            <label className="label">Words</label>
            <div className="select-wrapper no-focus">
              <select
                className="styled-select no-focus"
                value={wordCount}
                onChange={handleWordCountChange}
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
          <div
            className="mt-timer no-focus"
            style={{ color: "#ffd54f", fontWeight: 700 }}
          >
            {formatTime(elapsed)}
          </div>
        </div>

        {!finished && (
          <div className="word-flow" role="list">
            {wordList.map((word, index) => {
              const isActive = index === currentWordIndex;
              return (
                <span
                  key={index}
                  ref={isActive ? activeWordRef : null}
                  className={`word ${isActive ? "active" : ""}`}
                  role="listitem"
                >
                  {isActive
                    ? word.split("").map((char, i) => {
                        let style = "";
                        if (i < input.length)
                          style = input[i] === char ? "correct" : "incorrect";
                        return (
                          <span key={i} className={`char ${style}`}>
                            {char}
                          </span>
                        );
                      })
                    : word}
                  {isActive && input.length > word.length && (
                    <span className="extra">{input.slice(word.length)}</span>
                  )}
                </span>
              );
            })}
          </div>
        )}

        {finished && (
          <div className="mt-results">
            <h2>Results</h2>
            <div className="results-cards">
              <div className="result-card">
                <div className="stat-label">WPM</div>
                <div className="stat-value">{wpm}</div>
              </div>
              <div className="result-card">
                <div className="stat-label">Raw WPM</div>
                <div className="stat-value">{rawWpm}</div>
              </div>
              <div className="result-card">
                <div className="stat-label">CPM</div>
                <div className="stat-value">{cpm}</div>
              </div>
              <div className="result-card">
                <div className="stat-label">Accuracy</div>
                <div className="stat-value">{accuracy}%</div>
              </div>
              <div className="result-card">
                <div className="stat-label">Mistakes</div>
                <div className="stat-value">{wrongChars.current}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-restart no-focus">
        <button className="btn" onClick={() => resetGame(wordCount)}>
          Restart
        </button>
      </div>
    </div>
  );
}
