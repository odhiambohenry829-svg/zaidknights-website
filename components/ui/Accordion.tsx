import { useState } from 'react';

export interface AccordionItem {
  question: string;
  answer:   string;
}

interface AccordionProps {
  items:       AccordionItem[];
  className?:  string;
}

export default function Accordion({ items, className = '' }: AccordionProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, i) => (
        <div
          key={i}
          className={`glass rounded-xl overflow-hidden transition-all duration-200 ${
            open === i ? 'border-yellow-500/30' : ''
          }`}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-4 text-left
              hover:bg-white/5 transition-colors group"
          >
            <span className="text-white font-medium text-sm md:text-base pr-4">
              {item.question}
            </span>
            <span
              className={`text-yellow-400 transition-transform duration-200 flex-shrink-0
                text-lg leading-none ${open === i ? 'rotate-180' : ''}`}
            >
              ▾
            </span>
          </button>
          {open === i && (
            <div className="px-6 pb-5 border-t border-white/10 pt-4 text-gray-400 text-sm leading-relaxed">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
