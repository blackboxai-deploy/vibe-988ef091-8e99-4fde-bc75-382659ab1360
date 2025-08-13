import './globals.css';

export const metadata = {
  title: 'Next Todo',
  description: 'A simple todo list built with Next.js'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
