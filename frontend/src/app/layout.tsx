import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Commute.ly | Your safer way home",
  description: "WebGIS konteks keamanan perjalanan KRL malam hari di Jakarta.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="id"><body>{children}</body></html>;
}
