import { Link } from 'react-router-dom';

interface Props {
  title: string;
  desc: string;
}

/**
 * 占位页面：在后续步骤中会逐个替换为完整实现
 */
export default function Placeholder({ title, desc }: Props) {
  return (
    <section className="relative max-w-3xl mx-auto px-5 py-32 text-center">
      <span className="inline-block px-3 py-1 rounded-full text-xs tracking-widest text-neon-300 bg-neon-400/10 border border-neon-400/30 animate-fade-up">
        COMING SOON
      </span>
      <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight animate-fade-up [animation-delay:0.1s]">
        {title}
      </h1>
      <p className="mt-5 text-ink-400 leading-relaxed-pro animate-fade-up [animation-delay:0.2s]">
        {desc}
      </p>
      <p className="mt-3 text-sm text-ink-500 animate-fade-up [animation-delay:0.3s]">
        本模块将在后续步骤中实现。
      </p>
      <Link to="/" className="btn-primary mt-8 animate-fade-up [animation-delay:0.4s]">
        ← 返回首页
      </Link>
    </section>
  );
}
