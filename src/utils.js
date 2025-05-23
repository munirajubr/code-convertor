export const getLineNumbers = (text) => {
  if (!text || typeof text !== 'string') return "1";
  const lines = text.split("\n");
  return Array.from({ length: lines.length }, (_, i) => i + 1).join("\n");
};

export const languages = [
  "Python",
  "JavaScript",
  "Java",
  "C++",
  "C#",
  "TypeScript",
  "Go",
  "Ruby",
  "PHP",
  "Rust",
];

export const validateInput = (code) => {
  // Basic validation - could be expanded
  if (typeof code !== 'string') return false;
  if (code.length > 5000) return false; // Limit code size
  return true;
};

