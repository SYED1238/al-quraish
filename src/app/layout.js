import { AuthProvider } from "../context/AuthContext";
import { CartWishlistProvider } from "../context/CartWishlistContext";
import AtmosphericBackground from "../components/AtmosphericBackground";
import "./globals.css";

export const metadata = {
  title: "AL-QURAISH — Premium Halal Meat, Seafood & Gourmet",
  description:
    "Crafted for the finest tables. Premium halal meats, seafood, poultry and chef-selected cuts sourced with integrity and delivered with precision.",
  keywords: "halal meat, premium seafood, gourmet food, luxury halal, fresh poultry, chef cuts",
  openGraph: {
    title: "AL-QURAISH — Crafted for the Finest Tables",
    description:
      "Premium halal meats, seafood, poultry and chef-selected cuts sourced with integrity and delivered with precision.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          <CartWishlistProvider>
            <AtmosphericBackground />
            {children}
          </CartWishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
