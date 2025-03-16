import Link from "next/link";
import {
  FaFacebookF,
  FaXTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-black text-gray-50  mx-auto">
      <div className=" max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="md:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">ExplainAI</h3>
            <p className="text-sm">
              An AI application that explains your docs.
            </p>
          </div>
          <div>
            <ul className="space-y-2">
              <h3 className="text-lg font-semibold mb-4">Links</h3>
              <li>
                <Link
                  href="/"
                  className="text-sm hover:text-gray-600 transition-colors"
                >
                  Home
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-sm hover:text-gray-600 transition-colors"
                >
                  Privacy policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <address className="text-sm not-italic">
              <p>123 Main Street</p>
              <p>Anytown, USA 12345</p>
              <p>Email: info@example.com</p>
              <p>Phone: (123) 456-7890</p>
            </address>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} ExplainAI. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://x.com/timothymedewase"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                target="_blank"
              >
                <FaXTwitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>

              <Link
                href="https://www.linkedin.com/in/timothy-medewase"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                target="_blank"
              >
                <FaLinkedinIn className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link
                href="https://github.com/timothymedewase"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                target="_blank"
              >
                <FaGithub className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
