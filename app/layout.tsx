import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Capsule",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white" suppressHydrationWarning>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
