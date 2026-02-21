import React, { useState } from 'react';
import { Home, BarChart2, Briefcase, Settings, LogOut, Bell, Menu, X, Wallet, Users } from 'lucide-react';

const Dashboard = ({ type = 'advertiser' }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = type === 'advertiser'
        ? [
            { name: 'Overview', icon: Home, current: true },
            { name: 'Campaigns', icon: Briefcase, current: false },
            { name: 'Analytics', icon: BarChart2, current: false },
            { name: 'Wallet', icon: Wallet, current: false },
            { name: 'Settings', icon: Settings, current: false },
        ]
        : [
            { name: 'Overview', icon: Home, current: true },
            { name: 'Inventory', icon: Briefcase, current: false },
            { name: 'Earnings', icon: Wallet, current: false },
            { name: 'Audience', icon: Users, current: false },
            { name: 'Settings', icon: Settings, current: false },
        ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center h-16 px-6 bg-slate-950">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-xl">M</span>
                    </div>
                    <span className="text-white font-bold text-xl">MarketNow</span>
                </div>

                <div className="px-4 py-6">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">
                        {type === 'advertiser' ? 'Advertiser Console' : 'Publisher Portal'}
                    </div>
                    <nav className="space-y-1">
                        {navigation.map((item) => (
                            <a
                                key={item.name}
                                href="#"
                                className={`${item.current ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    } group flex items-center px-2 py-3 text-sm font-medium rounded-md transition-colors`}
                            >
                                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                                {item.name}
                            </a>
                        ))}
                    </nav>
                </div>

                <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
                    <a href="#" className="flex items-center px-2 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-md transition-colors text-sm font-medium">
                        <LogOut className="mr-3 h-5 w-5" />
                        Sign Out
                    </a>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="bg-white border-b border-slate-200">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                        <button
                            className="text-slate-500 focus:outline-none lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        <div className="flex items-center justify-end w-full">
                            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors relative">
                                <Bell className="h-6 w-6" />
                                <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                            </button>
                            <div className="ml-4 flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                                    {type === 'advertiser' ? 'AD' : 'PU'}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-2xl font-bold text-slate-900 mb-6">Overview</h1>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-slate-500">{type === 'advertiser' ? 'Active Campaigns' : 'Active Listings'}</h3>
                                    <Briefcase className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div className="text-3xl font-bold text-slate-900">12</div>
                                <div className="mt-2 text-sm text-emerald-600 flex items-center">
                                    <span className="font-medium">+2 new</span>
                                    <span className="text-slate-400 ml-2">this week</span>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-slate-500">{type === 'advertiser' ? 'Total Spend' : 'Total Earnings'}</h3>
                                    <DollarSignHack className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div className="text-3xl font-bold text-slate-900">$4,250</div>
                                <div className="mt-2 text-sm text-emerald-600 flex items-center">
                                    <span className="font-medium">+15%</span>
                                    <span className="text-slate-400 ml-2">vs last month</span>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-slate-500">{type === 'advertiser' ? 'Impressions' : 'Page Views'}</h3>
                                    <Users className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div className="text-3xl font-bold text-slate-900">85.4k</div>
                                <div className="mt-2 text-sm text-slate-500 flex items-center">
                                    <span className="font-medium">Avg CPM:</span>
                                    <span className="text-slate-900 ml-1 font-semibold">$12.40</span>
                                </div>
                            </div>
                        </div>

                        {/* Empty State / Content Area */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <BarChart2 className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 mb-2">No recent activity</h3>
                            <p className="text-slate-500 max-w-sm mb-6">
                                Get started by {type === 'advertiser' ? 'creating your first campaign' : 'adding your inventory'} to the marketplace.
                            </p>
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                                {type === 'advertiser' ? 'New Campaign' : 'Add Listing'}
                            </button>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

// SVG Icon Hack for missing Lucide icon in this context if needed, 
// strictly generic since we import generic ones.
const DollarSignHack = (props) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line x1="12" x2="12" y1="2" y2="22" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
)

export default Dashboard;
