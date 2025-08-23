import { FaFacebook, FaInstagram } from "react-icons/fa";
import { SiKick } from "react-icons/si";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-t from-black to-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <h2 className="text-2xl font-bold text-red-600 mb-4">JoyFlix</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your ultimate destination for streaming the best movies and
              series. Discover, watch, and enjoy unlimited entertainment.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-red-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/movies" className="hover:text-red-400 transition">
                  Movies
                </Link>
              </li>
              <li>
                <Link href="/series" className="hover:text-red-400 transition">
                  TV Series
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-red-400 transition"
                >
                  My Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="hover:text-red-400 transition cursor-pointer">
                  Action
                </span>
              </li>
              <li>
                <span className="hover:text-red-400 transition cursor-pointer">
                  Comedy
                </span>
              </li>
              <li>
                <span className="hover:text-red-400 transition cursor-pointer">
                  Drama
                </span>
              </li>
              <li>
                <span className="hover:text-red-400 transition cursor-pointer">
                  Thriller
                </span>
              </li>
            </ul>
          </div>

          {/* Developer & Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <p className="text-sm text-gray-400 mb-4">
              Developed by{" "}
              <span className="text-red-400 font-medium">Aljoy.DEV</span>
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/tanoshiijoy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-500 transition-colors"
                aria-label="Facebook"
              >
                <FaFacebook size={20} />
              </a>
              <a
                href="https://www.instagram.com/tanoshii.joy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-500 transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="https://kick.com/tanoshii777/videos/f94ed2d0-6a2c-44c0-82d4-8d9e31923f1c"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-500 transition-colors"
                aria-label="Kick"
              >
                <SiKick size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} JoyFlix by Tanoshii. All rights
            reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <span className="hover:text-red-400 transition cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-red-400 transition cursor-pointer">
              Terms of Service
            </span>
            <span className="hover:text-red-400 transition cursor-pointer">
              Contact
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
