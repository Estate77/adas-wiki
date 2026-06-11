import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  content: string;
  /** 是否正在流式接收（用于显示光标） */
  streaming?: boolean;
}

/**
 * Markdown 渲染：支持 GFM 表格、任务列表、行内代码、代码块、引用
 * 代码块附带复制按钮
 */
export default function MarkdownView({ content, streaming }: Props) {
  return (
    <div className="markdown-body relative">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
          h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
          h3: ({ children }) => <h3 className="md-h3">{children}</h3>,
          p:  ({ children }) => <p className="md-p">{children}</p>,
          ul: ({ children }) => <ul className="md-ul">{children}</ul>,
          ol: ({ children }) => <ol className="md-ol">{children}</ol>,
          li: ({ children }) => <li className="md-li">{children}</li>,
          blockquote: ({ children }) => <blockquote className="md-quote">{children}</blockquote>,
          table: ({ children }) => <div className="md-table-wrap"><table className="md-table">{children}</table></div>,
          thead: ({ children }) => <thead className="md-thead">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className="md-tr">{children}</tr>,
          th: ({ children }) => <th className="md-th">{children}</th>,
          td: ({ children }) => <td className="md-td">{children}</td>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer" className="md-a">{children}</a>
          ),
          code: (props) => <CodeBlock {...props} />,
          strong: ({ children }) => <strong className="md-strong">{children}</strong>,
          em:     ({ children }) => <em className="md-em">{children}</em>,
          hr: () => <hr className="md-hr" />,
        }}
      >
        {content || ''}
      </ReactMarkdown>

      {streaming && (
        <span
          aria-hidden
          className="inline-block w-1.5 h-4 align-middle bg-neon-400 ml-0.5 animate-caret translate-y-0.5"
        />
      )}
    </div>
  );
}

/** 代码块：内联 vs 块级 */
function CodeBlock(props: {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const { inline, className, children } = props;
  const code = String(children ?? '').replace(/\n$/, '');
  const lang = /language-(\w+)/.exec(className || '')?.[1];

  if (inline) {
    return <code className="md-code-inline">{children}</code>;
  }

  return <CodeBlockShell lang={lang} code={code} />;
}

function CodeBlockShell({ lang, code }: { lang?: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const display = useMemo(() => code, [code]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(display);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* 忽略 */
    }
  };

  return (
    <div className="md-codeblock">
      <div className="md-codeblock-head">
        <span className="font-mono text-[11px] text-ink-400 uppercase tracking-widest">
          {lang || 'text'}
        </span>
        <button
          onClick={onCopy}
          className="text-[11px] text-ink-400 hover:text-neon-300 transition-colors flex items-center gap-1"
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              已复制
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="11" height="11" rx="2" />
                <path d="M5 15V5a2 2 0 0 1 2-2h10" />
              </svg>
              复制
            </>
          )}
        </button>
      </div>
      <pre className="md-pre">
        <code>{display}</code>
      </pre>
    </div>
  );
}
