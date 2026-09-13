import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'Drishyam - Real-time AI Surveillance Operations Center',
  description: 'AI-powered video surveillance platform detecting weapons, violence, intrusion, and loitering in real-time.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark-950 text-slate-100 antialiased selection:bg-brand-500 selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
