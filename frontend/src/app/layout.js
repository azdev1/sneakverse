import "./globals.css";
import Navbar from "../components/Navbar";
import CartDrawer from "../components/CartDrawer";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";

export const metadata = {
  title: "SneakVerse | Premium 3D Sneaker E-Commerce",
  description: "Step into the future. Customize premium 3D sneakers, explore limited-edition sports collections, and enjoy a luxury shopping experience with SneakVerse.",
  keywords: "sneakers, 3d customizer, threejs e-commerce, premium shoes, limited edition sneakers, sneakverse",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#030303] text-[#f5f5f7]">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <div className="flex-grow pt-16">
              {children}
            </div>
            <CartDrawer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

