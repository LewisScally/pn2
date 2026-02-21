import React from 'react';
import { ShieldCheck, Zap, Headphones, BarChart3 } from 'lucide-react';

const Features = () => {
    const features = [
        {
            title: "Verified Publishers",
            description: "Every publisher is manually vetted to ensure high-quality traffic and engagement.",
            icon: ShieldCheck
        },
        {
            title: "Escrow Protection",
            description: "Funds are held safely until the service is delivered as promised.",
            icon: Zap
        },
        {
            title: "24/7 Support",
            description: "Dedicated account managers available round the clock to assist you.",
            icon: Headphones
        },
        {
            title: "Fast Resolution",
            description: "Any disputes are handled within 24 hours by our neutral mediation team.",
            icon: BarChart3
        }
    ];

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        Trusted by Leading Crypto Projects
                    </h2>
                    <p className="text-lg text-slate-600">
                        Join hundreds of successful projects scaling with MarketNow.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="group p-6 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 border border-transparent hover:border-slate-100">
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <feature.icon className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3">{feature.title}</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="mt-20 p-8 md:p-12 bg-indigo-900 rounded-3xl text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:32px_32px]"></div>
                    </div>

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold text-white mb-6">Ready to scale your reach?</h2>
                        <p className="text-indigo-100 mb-8 text-lg">
                            Join the fastest growing crypto advertising marketplace today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="bg-white text-indigo-900 px-8 py-3.5 rounded-xl font-semibold hover:bg-slate-100 transition-colors shadow-lg">
                                Get Started Now
                            </button>
                            <button className="bg-transparent border border-indigo-400 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-indigo-800 transition-colors">
                                Contact Sales
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Features;
