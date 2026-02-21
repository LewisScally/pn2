import React from 'react';
import { UserPlus, Search, TrendingUp } from 'lucide-react';

const HowItWorks = () => {
    const steps = [
        {
            id: "01",
            title: "Create Account",
            description: "Sign up in seconds. No credit card required to explore our inventory.",
            icon: UserPlus
        },
        {
            id: "02",
            title: "Select Inventory",
            description: "Browse verified publishers and choose placements that fit your budget.",
            icon: Search
        },
        {
            id: "03",
            title: "Launch & Grow",
            description: "Deploy your campaign instantly and track real-time performance.",
            icon: TrendingUp
        }
    ];

    return (
        <section className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        How it works
                    </h2>
                    <p className="text-lg text-slate-600">
                        Get your campaign live in three simple steps. We've streamlined the process to save you time and money.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Connector Line (Desktop only) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-200 -z-10"></div>

                    {steps.map((step) => (
                        <div key={step.id} className="relative bg-white md:bg-transparent p-6 rounded-2xl md:p-0 shadow-sm md:shadow-none border border-slate-100 md:border-none">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mb-6 relative z-10">
                                    <step.icon className="w-10 h-10 text-indigo-600" />
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {step.id}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
