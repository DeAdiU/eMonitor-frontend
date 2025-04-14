"use client"

import { Search, Menu, X } from 'lucide-react';
import { useState } from 'react';
import UserNav from './userNav';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-indigo-50 p-4 shadow-sm">
      <div className="max-w-7xl mx-auto">
        {/* Desktop navbar */}
        <div className="hidden md:flex justify-between items-center">
          <div className="flex space-x-4">
            <a href="/" className="text-indigo-700 hover:text-indigo-900">Dashboard</a>
            <a href="/assessment" className="text-indigo-700 hover:text-indigo-900">Assessment</a>
            <a href="/leaderboard" className="text-indigo-700 hover:text-indigo-900">Leaderboard</a>
            <a href="/profile" className="text-indigo-700 hover:text-indigo-900">Profile</a>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-8 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <UserNav />
          </div>
        </div>
        
        {/* Mobile navbar */}
        <div className="md:hidden flex justify-between items-center">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-indigo-700 hover:text-indigo-900"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className="flex items-center space-x-2">
            <UserNav />
          </div>
        </div>
        
        {/* Mobile menu dropdown */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2 space-y-2 flex flex-col">
            <a href="/" className="text-indigo-700 hover:text-indigo-900 py-2">Dashboard</a>
            <a href="/assessment" className="text-indigo-700 hover:text-indigo-900 py-2">Assessment</a>
            <a href="/leaderboard" className="text-indigo-700 hover:text-indigo-900 py-2">Leaderboard</a>
            <a href="/profile" className="text-indigo-700 hover:text-indigo-900 py-2">Profile</a>
          </div>
        )}
      </div>
    </nav>
  );
}