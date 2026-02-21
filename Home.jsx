import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { 
  TrendingDown, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Users,
  BarChart3,
  Search,
  Lock,
  Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  const [userType, setUserType] = useState("advertiser");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="-m-6">
      {/* Hero Section */}
      <div className="relative min-h-[800px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#4F46E5] via-[#7C3AED] to-[#DB2777]">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="flex flex-col items-center text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-8"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium">Premium Crypto Ad Marketplace</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight"
            >
              Welcome to <span className="text-yellow-300">MarketNow</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed"
            >
              Buy premium crypto publisher inventory <span className="font-bold text-white border-b-2 border-yellow-300">20% below market</span>.
              <br className="hidden md:block" /> Or list your own inventory and earn.
            </motion.p>
          </div>

          {/* Interactive Card */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto bg-white rounded-3xl p-2 shadow-2xl"
          >
            <div className="bg-slate-50 rounded-2xl p-6 md:p-10">
              <div className="flex flex-col items-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Get Started</h3>
                <p className="text-slate-500 mb-8">Cooperation Type</p>

                {/* Toggle */}
                <div className="flex bg-slate-200 p-1 rounded-xl mb-10 w-full max-w-md">
                  <button
                    onClick={() => setUserType("advertiser")}
                    className={`flex-1 py-3 px-6 rounded-lg text-sm font-bold transition-all duration-300 ${
                      userType === "advertiser" 
                        ? "bg-[#1e293b] text-white shadow-lg" 
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Advertiser
                  </button>
                  <button
                    onClick={() => setUserType("publisher")}
                    className={`flex-1 py-3 px-6 rounded-lg text-sm font-bold transition-all duration-300 ${
                      userType === "publisher" 
                        ? "bg-[#1e293b] text-white shadow-lg" 
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Publisher
                  </button>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-6 w-full mb-10">
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 text-emerald-600">
                      <TrendingDown className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1">20% Below RRP</h4>
                    <p className="text-sm text-slate-500">Guaranteed savings on premium inventory</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1">Escrow Protected</h4>
                    <p className="text-sm text-slate-500">Payment held until delivery verified</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 text-amber-600">
                      <Zap className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1">Strict SLAs</h4>
                    <p className="text-sm text-slate-500">Auto-refund if deadlines missed</p>
                  </div>
                </div>

                {/* CTA */}
                <Link 
                  to={createPageUrl(userType === "advertiser" ? "Marketplace" : "CreateOffer")}
                  className="w-full"
                >
                  <Button className="w-full h-14 text-lg font-bold bg-[#4F46E5] hover:bg-[#4338ca] shadow-xl shadow-indigo-200 rounded-xl">
                    {userType === "advertiser" ? "Start Buying Now" : "Start Selling Now"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-[#4F46E5] mb-2">$2M+</div>
              <div className="text-slate-500 font-medium">Total Volume</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-[#7C3AED] mb-2">500+</div>
              <div className="text-slate-500 font-medium">Active Publishers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-[#EA580C] mb-2">20%</div>
              <div className="text-slate-500 font-medium">Avg. Savings</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-[#DB2777] mb-2">98%</div>
              <div className="text-slate-500 font-medium">On-Time Delivery</div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Simple, secure, and efficient process for all parties</p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                step: "01",
                title: "Browse Inventory",
                desc: "Explore premium crypto publisher inventory at discounted rates",
                icon: Search,
                color: "text-blue-500",
                bg: "bg-blue-50"
              },
              {
                step: "02",
                title: "Secure Payment",
                desc: "Pay securely through our escrow system - funds held until delivery",
                icon: Lock,
                color: "text-indigo-500",
                bg: "bg-indigo-50"
              },
              {
                step: "03",
                title: "Get Results",
                desc: "Receive verified delivery or automatic refund if SLA is missed",
                icon: Trophy,
                color: "text-pink-500",
                bg: "bg-pink-50"
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                variants={itemVariants}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow duration-300"
              >
                <div className={`text-4xl font-bold ${item.color} opacity-20 mb-6`}>{item.step}</div>
                <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Trusted By */}
      <div className="bg-white py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
            Trusted by Leading Crypto Projects
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto mb-16 text-lg">
            Our marketplace connects advertisers with verified publishers in the crypto space
          </p>

          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {[
              "Verified Publishers",
              "Escrow Protection",
              "24/7 Support",
              "Fast Resolution"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 px-6 py-3 bg-slate-50 rounded-full border border-slate-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-slate-800 pb-12 mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00D4AA] to-[#4F46E5] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M3 21L9 15L15 21L21 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-2xl font-bold">MarketNow</span>
            </div>
            <div className="flex gap-8 text-slate-400">
              <Link to={createPageUrl("Marketplace")} className="hover:text-white transition-colors">Marketplace</Link>
              <Link to={createPageUrl("AdvertiserDashboard")} className="hover:text-white transition-colors">Advertisers</Link>
              <Link to={createPageUrl("PublisherDashboard")} className="hover:text-white transition-colors">Publishers</Link>
              <Link to={createPageUrl("Disputes")} className="hover:text-white transition-colors">Support</Link>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
            <div>© 2026 MarketNow. All rights reserved.</div>
            <div className="flex gap-6">
              <Link to={createPageUrl("pp")} className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to={createPageUrl("tos")} className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}