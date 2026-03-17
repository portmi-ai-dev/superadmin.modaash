"use client";

import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 font-sans px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="h-16 w-16 relative flex items-center justify-center rounded-xl overflow-hidden shadow-sm bg-black">
              <Image
                src="/logo.png"
                alt="Modaash Logo"
                fill
                className="object-contain p-2"
                priority
              />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            SuperAdmin Portal
          </h2>
          <p className="text-sm text-center text-gray-500 mb-8">
            Enter your credentials to access the dashboard
          </p>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@modaash.com"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4A71E6] focus:border-transparent bg-white text-gray-900 outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <a href="#" className="text-sm text-[#4A71E6] hover:text-[#3b5bc1] transition-colors">
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4A71E6] focus:border-transparent bg-white text-gray-900 outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#4A71E6] text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-[#3b5bc1] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#4A71E6]"
            >
              Sign In
            </button>
          </form>
        </div>
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Secure access restricted to authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}
