import { useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';

const languageMap = {
  javascript: javascript(),
  python: python(),
  html: html(),
};

function CodeEditor({ code, onChange, language, readOnly = false }) {
  const extensions = [languageMap[language]];

  return (
    <div className="h-full rounded-lg overflow-hidden">
      <CodeMirror
        value={code}
        height="100%"
        theme={vscodeDark}
        extensions={extensions}
        onChange={onChange}
        readOnly={readOnly}
        className="text-base"
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          history: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: true,
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
      />
    </div>
  );
}

export default CodeEditor;