import React, { useState, useRef } from "react";
import "./convertor.css";
import { getLineNumbers, languages } from "./utils";

const CodeConverter = () => {
  const [sourceLang, setSourceLang] = useState("Python");
  const [targetLang, setTargetLang] = useState("Java");
  const [inputCode, setInputCode] = useState("");
  const [convertedCode, setConvertedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const inputCodeRef = useRef(null);
  const inputLinesRef = useRef(null);
  const outputCodeRef = useRef(null);
  const outputLinesRef = useRef(null);

  const syncInputScroll = () => {
    if (inputLinesRef.current && inputCodeRef.current) {
      inputLinesRef.current.scrollTop = inputCodeRef.current.scrollTop;
    }
  };

  const syncOutputScroll = () => {
    if (outputLinesRef.current && outputCodeRef.current) {
      outputLinesRef.current.scrollTop = outputCodeRef.current.scrollTop;
    }
  };

  // Update the handleConvert function to properly handle the API response
  const handleConvert = async () => {
    if (!inputCode.trim()) {
      setConvertedCode("// Please enter source code to convert.");
      return;
    }

    setLoading(true);
    setError(null);
    setConvertedCode("");

    try {
      const prompt = `Convert the following code from ${sourceLang} to ${targetLang}:\n\n${inputCode}`;

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            // // Authorization: "Bearer <rplace your API>",
            // Authorization: "Bearer api..............",
            "HTTP-Referer": "https://www.sitename.com",
            "X-Title": "Code-convertor",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-r1:free",
            messages: [{ role: "user", content: prompt }],
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to convert code");
      }

      const fullOutput =
        data.choices?.[0]?.message?.content || "// No response received.";
      const codeMatch = fullOutput.match(/```(?:\w+)?\n([\s\S]*?)```/);
      const extractedCode = codeMatch ? codeMatch[1].trim() : fullOutput;

      setConvertedCode(extractedCode || "// No code generated");
    } catch (err) {
      console.error("Conversion error:", err);
      setError(err.message || "Error converting code. Please try again.");
      setConvertedCode("// Error converting code");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!convertedCode) return;

    navigator.clipboard
      .writeText(convertedCode)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Copy failed:", err);
      });
  };

  return (
    <div className="container">
      <h1 className="header">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="28"
          height="28"
          color="#fff"
          fill="none"
          className="icon"
        >
          <defs />
          <path
            fill="currentColor"
            d="M15.216,4.224 L10.216,20.224 C10.092,20.619 9.672,20.84 9.276,20.716 C8.881,20.593 8.661,20.172 8.784,19.777 L13.784,3.776 C13.908,3.381 14.328,3.161 14.724,3.284 C15.119,3.408 15.34,3.829 15.216,4.224 Z M16.471,7.468 C16.765,7.176 17.24,7.177 17.532,7.471 L19.372,9.321 L19.404,9.354 C19.763,9.715 20.083,10.037 20.307,10.332 C20.552,10.654 20.75,11.03 20.75,11.5 C20.75,11.97 20.552,12.346 20.307,12.668 C20.083,12.963 19.763,13.285 19.404,13.646 L19.372,13.679 L17.532,15.529 C17.24,15.823 16.765,15.824 16.471,15.532 C16.177,15.24 16.176,14.765 16.468,14.471 L18.308,12.621 C18.71,12.217 18.957,11.967 19.112,11.761 C19.251,11.579 19.25,11.517 19.25,11.501 L19.25,11.499 C19.25,11.483 19.251,11.421 19.112,11.239 C18.957,11.033 18.71,10.783 18.308,10.379 L16.468,8.529 C16.176,8.235 16.177,7.76 16.471,7.468 Z M7.529,7.468 C7.823,7.76 7.824,8.235 7.532,8.529 L5.692,10.379 C5.29,10.783 5.043,11.033 4.888,11.239 C4.749,11.421 4.75,11.483 4.75,11.499 L4.75,11.5 L4.75,11.501 C4.75,11.517 4.749,11.579 4.888,11.761 C5.043,11.967 5.29,12.217 5.692,12.621 L7.532,14.471 C7.824,14.765 7.823,15.24 7.529,15.532 C7.235,15.824 6.76,15.823 6.468,15.529 L4.628,13.679 L4.596,13.646 C4.237,13.285 3.917,12.963 3.693,12.668 C3.448,12.346 3.25,11.97 3.25,11.5 C3.25,11.03 3.448,10.654 3.693,10.332 C3.917,10.037 4.237,9.715 4.596,9.354 L4.628,9.321 L6.468,7.471 C6.76,7.177 7.235,7.176 7.529,7.468 Z"
          />
        </svg>
        Code Converter
      </h1>
      {error && <div className="error-message">{error}</div>}

      <div className="select-section">
        <div>
          <label className="code-label">From:</label>
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            disabled={loading}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="code-label">To:</label>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            disabled={loading}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="editor-section">
        <div className="code-block">
          <label className="code-label">Source Code:</label>
          <div className="code-editor">
            <textarea
              ref={inputLinesRef}
              className="line-numbers"
              readOnly
              value={getLineNumbers(inputCode)}
              onScroll={syncInputScroll}
            />
            <textarea
              ref={inputCodeRef}
              className="code-textarea"
              placeholder={`Enter your ${sourceLang} code here...`}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              onScroll={syncInputScroll}
            />
          </div>
        </div>

        <div className="code-block">
          <label className="code-label">Converted Code:</label>
          <div className="code-editor">
            <textarea
              ref={outputLinesRef}
              className="line-numbers"
              readOnly
              value={getLineNumbers(convertedCode)}
              onScroll={syncOutputScroll}
            />
            <textarea
              ref={outputCodeRef}
              className="code-textarea"
              placeholder={`${targetLang} code will appear here...`}
              value={convertedCode}
              readOnly
              onScroll={syncOutputScroll}
            />
          </div>
          <div className="copy-button-container">
            <button
              className="copy-btn"
              onClick={handleCopy}
              disabled={!convertedCode}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      <div className="button-container">
        <button
          className="convertcode"
          onClick={handleConvert}
          disabled={loading}
        >
          {loading ? "Converting..." : "Convert Code"}
        </button>
      </div>
    </div>
  );
};

export default CodeConverter;
