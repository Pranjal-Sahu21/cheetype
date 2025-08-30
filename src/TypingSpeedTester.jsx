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
  const prevInputRef = useRef("");
  const composingRef = useRef(false);

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
    prevInputRef.current = "";
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

  const processTokens = (tokens) => {
    let next = currentWordIndex;
    for (let i = 0; i < tokens.length; i++) {
      if (next >= wordList.length) break;
      const typed = tokens[i];
      const target = wordList[next] || "";
      const maxLen = Math.max(typed.length, target.length);
      for (let j = 0; j < maxLen; j++) {
        if (typed[j] === target[j]) correctChars.current++;
        else wrongChars.current++;
      }
      totalWords.current++;
      if (typed === target) correctWords.current++;
      totalChars.current += typed.length;
      next++;
    }
    setCurrentWordIndex(next);
    updateLiveStats();
    if (next >= wordList.length) finishTest();
  };

  const handleInput = (e) => {
    const value = e.target.value;
    if (composingRef.current) {
      setInput(value);
      prevInputRef.current = value;
      return;
    }
    if (!started) {
      setStarted(true);
      setStartTime(Date.now());
    }
    if (value.length < prevInputRef.current.length) {
      setInput(value);
      prevInputRef.current = value;
      updateLiveStats();
      return;
    }
    const endsWithSpace = /\s$/.test(value);
    const parts = value.split(/\s+/);
    let fragment = "";
    let complete = [];
    if (endsWithSpace) {
      complete = parts.filter(Boolean);
      fragment = "";
    } else {
      if (parts.length > 1) {
        fragment = parts.pop();
        complete = parts.filter(Boolean);
      } else {
        fragment = parts[0] || "";
        complete = [];
      }
    }
    if (complete.length > 0) {
      processTokens(complete);
    }
    setInput(fragment);
    prevInputRef.current = fragment;
    requestAnimationFrame(() => {
      const el = captureRef.current;
      if (el) {
        try {
          el.setSelectionRange(el.value.length, el.value.length);
        } catch (err) {}
      }
    });
  };

  const handleKeyDown = (e) => {
    if (finished) return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (!started) {
      setStarted(true);
      setStartTime(Date.now());
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = input.trim();
      if (trimmed) {
        processTokens([trimmed]);
        setInput("");
        prevInputRef.current = "";
      }
    }
  };

  const handleCompositionStart = () => {
    composingRef.current = true;
  };

  const handleCompositionEnd = () => {
    composingRef.current = false;
    const el = captureRef.current;
    if (el) {
      const eventLike = { target: el };
      handleInput(eventLike);
    }
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
      <input
        ref={captureRef}
        type="text"
        value={input}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        className="hidden-input"
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck="false"
        inputMode="text"
        enterKeyHint="done"
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
