import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const STATIC_PASSWORD = 'mockinterview2024'; // Set your static password here

function PasswordPage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already authenticated via localStorage
    const isAuth = localStorage.getItem('password_authenticated') === 'true';
    if (isAuth) {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    // Redirect when authenticated
    if (authenticated) {
      try {
        // Set authentication in localStorage first
        localStorage.setItem('password_authenticated', 'true');
        
        // Use window.location for a hard redirect instead of Next.js router
        window.location.href = '/';
      } catch (error) {
        console.error('Redirection error:', error);
      }
    }
  }, [authenticated, router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === STATIC_PASSWORD) {
      // Force a hard navigation instead of client-side routing
      localStorage.setItem('password_authenticated', 'true');
      window.location.href = '/';
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
        <div className="flex justify-center mb-6">
          <img src="/logo.svg" alt="Intervue.AI Logo" className="h-16" />
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-800 dark:text-white">Password Protected</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">This area is restricted to authorized users only</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <div className="relative">
              <input
                id="password"
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-base"
              />
              {error && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 transform hover:translate-y-[-2px] hover:shadow-lg"
          >
            Access Interview Platform
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Need access? Please contact:
          </p>
            <a
            href="https://www.linkedin.com/in/suchit-hubale-40a920256/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 font-medium flex items-center justify-center w-full"
            >
          <div className="w-full flex items-center justify-center mt-3 space-x-2 border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-gray-100 dark:bg-gray-900">
           
              
              <span>Suchit Hubale</span>
              <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 19H16V13.7C16 12.87 15.33 12.2 14.5 12.2C13.67 12.2 13 12.87 13 13.7V19H10V10H13V11.2C13.5 10.36 14.59 9.8 15.5 9.8C17.43 9.8 19 11.37 19 13.3V19ZM6.5 8.31C5.5 8.31 4.69 7.5 4.69 6.5C4.69 5.5 5.5 4.69 6.5 4.69C7.5 4.69 8.31 5.5 8.31 6.5C8.31 7.5 7.5 8.31 6.5 8.31ZM8 19H5V10H8V19ZM20 2H4C2.89 2 2 2.89 2 4V20C2 21.1 2.89 22 4 22H20C21.1 22 22 21.1 22 20V4C22 2.89 21.1 2 20 2Z" />
              </svg>
          </div>
          
          </a>
        </div>
      </div>
    </div>
  );
}

export default PasswordPage;