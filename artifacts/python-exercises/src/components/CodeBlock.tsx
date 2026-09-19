import React from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

SyntaxHighlighter.registerLanguage("python", python);

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "python" }: CodeBlockProps) {
  return (
    <div className="code-block-wrapper relative group overflow-hidden rounded-xl">
      <div className="absolute top-0 left-0 w-full h-8 bg-black/40 flex items-center px-4 space-x-2 z-10 backdrop-blur-sm">
        <div className="w-3 h-3 rounded-full bg-red-400"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div className="w-3 h-3 rounded-full bg-green-400"></div>
        <span className="ml-2 text-xs font-mono text-white/50">{language}</span>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          padding: "2.5rem 1.5rem 1.5rem 1.5rem",
          fontSize: "0.95rem",
          lineHeight: "1.5",
          fontFamily: "var(--app-font-mono)",
        }}
        wrapLongLines={true}
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  );
}
