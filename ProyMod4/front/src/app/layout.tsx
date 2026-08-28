import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ExcludedWrapper from "@/components/ExcludedWrapper";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import { AuthProvider } from "../contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import CategoriesBar from "@/components/CategoriesBar";
import { FavoriteProvider } from "@/contexts/FavoritesContext";

const primaryFont = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-primary",
  weight: "100 900",
});
const secondaryFont = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-secondary",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "e-commerce",
  description: "Project M4 Henry",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <html lang="en">
          <body className={`${primaryFont.variable} ${secondaryFont.variable} antialiased`}>
            <AuthProvider>
              <CartProvider>
                <FavoriteProvider>
                  <ExcludedWrapper>
                    <Navbar />
                    <CategoriesBar />
                  </ExcludedWrapper>

                  <main className="mx-auto w-[100%] md:w-10/12 md:mt-24 md:mb-2">{children}</main>

                  <ExcludedWrapper>
                    <Footer />
                  </ExcludedWrapper>
                </FavoriteProvider>
              </CartProvider>
            </AuthProvider>
          </body>
        </html>
  );
};