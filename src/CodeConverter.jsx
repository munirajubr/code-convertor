import React, { useState, useRef } from "react";
import "./convertor.css";
import { getLineNumbers, languages } from "./utils";

const CodeConverter = () => {
  const [sourceLang, setSourceLang] = useState("Python");
  const [targetLang, setTargetLang] = useState("Java");
  const [inputCode, setInputCode] = useState("");
  const [convertedCode, setConvertedCode] = useState("");
  const [explanation, setExplanation] = useState("");
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

  const formatExplanation = (text) => {
    if (!text) return null;

    const codeBlocks = [];
    let cleanText = text.replace(/```[\s\S]*?```/g, (match) => {
      codeBlocks.push(match);
      return `%%CODEBLOCK${codeBlocks.length - 1}%%`;
    });

    const paragraphs = cleanText.split("\n\n");

    return paragraphs.map((paragraph, i) => {
      let processedPara = paragraph.replace(
        /%%CODEBLOCK(\d+)%%/g,
        (_, index) => {
          return `<div class="code-block">${codeBlocks[Number(index)]}</div>`;
        }
      );

      processedPara = processedPara
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/`(.*?)`/g, "<code>$1</code>")
        .replace(/^### (.*$)/gm, "<h4>$1</h4>")
        .replace(/^## (.*$)/gm, "<h3>$1</h3>");

      return (
        <div
          key={i}
          dangerouslySetInnerHTML={{ __html: processedPara }}
          className="explanation-paragraph"
        />
      );
    });
  };

  const handleConvert = async () => {
    if (!inputCode.trim()) {
      setConvertedCode("// Please enter source code to convert.");
      return;
    }

    setLoading(true);
    setError(null);
    setConvertedCode("");
    setExplanation("");

    try {
      const prompt = `Convert the following code from ${sourceLang} to ${targetLang} and provide a brief explanation of the code in paragraph :\n${inputCode}`;

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

      let extractedExplanation = fullOutput;
      if (fullOutput.includes("Explanation:")) {
        extractedExplanation = fullOutput.split("Explanation:")[1].trim();
      } else if (fullOutput.includes("explanation:")) {
        extractedExplanation = fullOutput.split("explanation:")[1].trim();
      } else if (codeMatch) {
        extractedExplanation = fullOutput.split("```")[0].trim();
      }

      setConvertedCode(extractedCode || "// No code generated");
      setExplanation(extractedExplanation);
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
        setError("Failed to copy text to clipboard");
      });
  };

  return (
    <div className="container">
      <h1 className="header">
        <img
          src={`${process.env.PUBLIC_URL}/favicon.ico`}
          alt="icon"
          className="icon"
        />
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
          <div className="code-editor code-view">
            <div className="code-header">{sourceLang}</div>
            <div className="code-content">
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
        </div>

        <div className="code-block">
          <label className="code-label">Converted Code:</label>
          <div className="code-editor code-view">
            <div className="code-header">{targetLang}</div>
            <div className="code-content">
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
          </div>
          <div className="copy-button-container">
            <button
              className={`copy-btn ${copied ? "copied" : ""}`}
              onClick={handleCopy}
              disabled={!convertedCode || copied}
            >
              {copied ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-copy-check-icon lucide-copy-check"
                  className="copyicon"
                >
                  <path d="m12 15 2 2 4-4" />
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-copy-icon lucide-copy"
                  className="copyicon"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              )}
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
          {loading ? (
            <>
              <span className="spinner"></span>
              Converting...
            </>
          ) : (
            "Convert Code"
          )}
        </button>
        <p className="msg">
          {loading ? "Please wait, it may take a moment to convert" : ""}
        </p>
      </div>

      {explanation && (
        <div className="explanation-section">
          <h3>Code Explanation</h3>
          <div className="explanation-content">
            {formatExplanation(explanation)}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeConverter;