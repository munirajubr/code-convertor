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
      const prompt = `Convert the following code from ${sourceLang} to ${targetLang} and provide a brief explanation of the changes:\n\n${inputCode}`;

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

      const fullOutput = data.choices?.[0]?.message?.content || "// No response received.";
      
      // Extract converted code
      const codeMatch = fullOutput.match(/```(?:\w+)?\n([\s\S]*?)```/);
      const extractedCode = codeMatch ? codeMatch[1].trim() : fullOutput;
      
      // Extract explanation
      let extractedExplanation = "No explanation provided.";
      if (fullOutput.includes("Explanation:")) {
        extractedExplanation = fullOutput.split("Explanation:")[1].trim();
      } else if (fullOutput.includes("explanation:")) {
        extractedExplanation = fullOutput.split("explanation:")[1].trim();
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
        <p className="msg">
          {loading
            ? `Please wait, it may take a moment to convert`
            : ""}
        </p>
      </div>

      {explanation && (
        <div className="explanation-section">
          <h3>Code Explanation</h3>
          <div className="explanation-content">
            {explanation}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeConverter;