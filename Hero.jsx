import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const Hero = () => {
    const [activeTab, setActiveTab] = useState('advertiser');

    return (
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 -z-10 bg-slate-50">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-400 opacity-20 blur-[100px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    {/* Text Content */}
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            img-1 now live for all users
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
                            Welcome to <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">MarketNow</span>
                        </h1>

                        <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                            Access premium crypto publisher inventory at <span className="font-semibold text-slate-900 bg-orange-100 text-orange-700 px-1 rounded">20% below market rates</span>.
                            The most efficient marketplace for modern advertising.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 group">
                                Start Trading
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-3.5 rounded-xl font-semibold transition-all shadow-sm">
                                View Inventory
                            </button>
                        </div>

                        <div className="mt-10 flex items-center gap-6 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                                <span>Verified Publishers</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                                <span>Instant Settlement</span>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Card */}
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur opacity-20"></div>
                        <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">

                            {/* Tab Header */}
                            <div className="flex border-b border-slate-100">
                                <button
                                    onClick={() => setActiveTab('advertiser')}
                                    className={`flex-1 py-4 text-sm font-semibold text-center transition-colors ${activeTab === 'advertiser'
                                            ? 'text-indigo-600 bg-indigo-50/50 border-b-2 border-indigo-600'
                                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    For Advertisers
                                </button>
                                <button
                                    onClick={() => setActiveTab('publisher')}
                                    className={`flex-1 py-4 text-sm font-semibold text-center transition-colors ${activeTab === 'publisher'
                                            ? 'text-indigo-600 bg-indigo-50/50 border-b-2 border-indigo-600'
                                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    For Publishers
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="p-8">
                                {activeTab === 'advertiser' ? (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="space-y-4">
                                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium text-slate-600">Avg. CPM</span>
                                                    <span className="text-sm font-bold text-emerald-600">-24% vs Direct</span>
                                                </div>
                                                <div className="text-2xl font-bold text-slate-900">$12.50</div>
                                            </div>

                                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium text-slate-600">Placement Reach</span>
                                                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Premium</span>
                                                </div>
                                                <div className="text-lg font-semibold text-slate-900">2.5M+ Monthly Views</div>
                                            </div>
                                        </div>

                                        <button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-semibold transition-colors">
                                            Create Campaign
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                                        <div className="space-y-4">
                                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium text-slate-600">Fill Rate</span>
                                                    <span className="text-sm font-bold text-emerald-600">+15% Growth</span>
                                                </div>
                                                <div className="text-2xl font-bold text-slate-900">98.5%</div>
                                            </div>

                                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium text-slate-600">Payout Speed</span>
                                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">Instant</span>
                                                </div>
                                                <div className="text-lg font-semibold text-slate-900">Same-Day Settlement</div>
                                            </div>
                                        </div>

                                        <button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-semibold transition-colors">
                                            Monetize Traffic
                                        </button>
                                    </div>
                                )}

                                <p className="mt-6 text-center text-xs text-slate-400">
                                    No credit card required for sign up.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
