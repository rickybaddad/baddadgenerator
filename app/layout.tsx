import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Iterative Gemini Creative Studio',
  description: 'Premium iterative AI image generation and editing with Gemini and optional OpenAI prompt improvement.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
