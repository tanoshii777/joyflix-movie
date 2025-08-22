// app/components/Footer.tsx
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { SiKick } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="bg-black/70 backdrop-blur-md text-gray-400 text-sm mt-12">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Left Side - Logo / Name */}
        <h1 className="text-lg sm:text-xl font-bold text-red-600 tracking-wide">
          Aljoy.DEV
        </h1>

        {/* Middle - Social Media Icons */}
        <nav className="flex gap-6 text-xl">
          <a
            href="https://www.facebook.com/tanoshiijoy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-500 transition"
          >
            <FaFacebook />
          </a>
          <a
            href="https://www.instagram.com/tanoshii.joy/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-500 transition"
          >
            <FaInstagram />
          </a>
          <a
            href="https://kick.com/tanoshii777/videos/f94ed2d0-6a2c-44c0-82d4-8d9e31923f1c"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-500 transition"
          >
            <SiKick />
          </a>
        </nav>

        {/* Right Side - Copyright */}
        <p className="text-gray-500 text-xs sm:text-sm">
          © {new Date().getFullYear()} Tanoshii. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
