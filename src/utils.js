export const getLineNumbers = (text) => {
  if (!text || typeof text !== "string") return "1";
  const lines = text.split("\n");
  return Array.from({ length: lines.length }, (_, i) => i + 1).join("\n");
};

export const languages = [
  "Python",
  "JavaScript",
  "Java",
  "C++",
  "C#",
  "C",
  "TypeScript",
  "Go",
  "Ruby",
  "PHP",
  "Rust",
  "Swift",
  "Kotlin",
  "R",
  "Dart",
  "React",
];

export const validateInput = (code) => {
  if (typeof code !== "string") return false;
  if (code.length > 50000) return false;
  return true;
};
