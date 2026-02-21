import React from 'react';
import { Menu, X, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">M</span>
                        </div>
                        <span className="font-bold text-xl text-slate-900">MarketNow</span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/marketplace" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Marketplace</Link>
                        <Link to="/advertisers" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Advertisers</Link>
                        <Link to="/publishers" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Publishers</Link>
                        <Link to="/" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Company</Link>
                    </div>

                    {/* Right Side Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                            <Bell className="h-5 w-5" />
                        </button>
                        <Link to="/login" className="text-slate-700 hover:text-indigo-600 font-medium px-4 py-2 transition-colors">
                            Log in
                        </Link>
                        <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md">
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-slate-600 hover:text-slate-900 focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-100 shadow-lg">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        <a href="#" className="block px-3 py-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-md font-medium">Marketplace</a>
                        <a href="#" className="block px-3 py-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-md font-medium">Advertisers</a>
                        <a href="#" className="block px-3 py-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-md font-medium">Publishers</a>
                        <a href="#" className="block px-3 py-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-md font-medium">Company</a>
                        <div className="border-t border-slate-100 my-2 pt-2 space-y-2">
                            <button className="w-full text-left px-3 py-2 text-slate-700 hover:text-indigo-600 font-medium">
                                Log in
                            </button>
                            <button className="w-full bg-indigo-600 text-white px-3 py-2.5 rounded-lg font-medium shadow-sm">
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Header;
