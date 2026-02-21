import React from 'react';

const Stats = () => {
    return (
        <section className="py-12 bg-white border-y border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">

                    <div className="space-y-2">
                        <h3 className="text-4xl font-bold text-slate-900">$2M+</h3>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Volume</p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-4xl font-bold text-slate-900">500+</h3>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Publishers</p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-4xl font-bold text-orange-600">20%</h3>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Avg. Savings</p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-4xl font-bold text-slate-900">98%</h3>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">On-Time Delivery</p>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Stats;
