import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export default function Button({ children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-full bg-gold px-6 py-3 text-black transition hover:scale-[1.02] hover:bg-gold/90 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
