import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { 
  CircleAlert, 
  LogOut, 
  User, 
  Bell,
  ChevronDown,
  Menu,
  X,
  Shield,
  LayoutDashboard,
  BarChart2,
  PieChart,
  ShoppingBag,
  ExternalLink
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        setUser(null);
      }
    };
    fetchUser();
  }, [location.pathname]);

  useEffect(() => {
    document.title = "MarketNow | Premium Crypto Ad Marketplace";
    
    // Add meta description for SEO
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = "Buy premium crypto publisher inventory 20% below market. The leading ad network for high-intent, financially active audiences.";
  }, []);

  // Redirect to user type selection if not set
  useEffect(() => {
    if (user && !user.user_type && currentPageName !== "UserTypeSelection") {
      window.location.href = createPageUrl("UserTypeSelection");
    }
  }, [user, currentPageName]);

  const handleLogout = () => {
    base44.auth.logout();
  };

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user?.email, read: false }),
    enabled: !!user?.email,
    refetchInterval: 30000 // Poll every 30s
  });

  const markRead = async (id) => {
    try {
      await base44.entities.Notification.update(id, { read: true });
      // Invalidate query handled by React Query naturally on refetch or we can force it
    } catch(e) {}
  };

  // Logo component
  const Logo = () => (
    <Link to={createPageUrl("Home")} className="flex items-center gap-3">
      <div className="w-8 h-8 rounded bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
          <path d="M3 21L9 15L15 21L21 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-slate-900 text-lg tracking-tight leading-none">MarketNow</span>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <style>{`
        :root {
          --background: 210 40% 98%;
          --foreground: 222.2 84% 4.9%;

          --card: 0 0% 100%;
          --card-foreground: 222.2 84% 4.9%;

          --popover: 0 0% 100%;
          --popover-foreground: 222.2 84% 4.9%;

          --primary: 243 75% 59%;
          --primary-foreground: 210 40% 98%;

          --secondary: 210 40% 96.1%;
          --secondary-foreground: 222.2 47.4% 11.2%;

          --muted: 210 40% 96.1%;
          --muted-foreground: 215.4 16.3% 46.9%;

          --accent: 210 40% 96.1%;
          --accent-foreground: 222.2 47.4% 11.2%;

          --destructive: 0 84.2% 60.2%;
          --destructive-foreground: 210 40% 98%;

          --border: 214.3 31.8% 91.4%;
          --input: 214.3 31.8% 91.4%;
          --ring: 243 75% 59%;

          --radius: 0.5rem;
        }

        body {
          background-color: hsl(var(--background));
          color: hsl(var(--foreground));
        }
      `}</style>
      {/* Sidebar - Desktop */}
      {user && (
        <aside className="hidden lg:flex w-64 bg-white flex-col border-r border-slate-200 fixed h-full z-20">
        <div className="p-6 border-b border-slate-200">
          <Logo />
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <div className="px-3 mb-2 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
            Platform
          </div>
          <Link 
            to={createPageUrl(user?.user_type === 'publisher' ? 'PublisherDashboard' : 'AdvertiserDashboard')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              ['AdvertiserDashboard', 'PublisherDashboard'].includes(currentPageName)
                ? "bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          
          {user?.role === "admin" && (
            <>
              <div className="px-3 mt-6 mb-2 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Administration
              </div>
              <Link 
                to={createPageUrl("AdminPanel")}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPageName === "AdminPanel" 
                    ? "bg-[#1F2937] text-[#00D4AA] border-l-2 border-[#00D4AA]" 
                    : "text-[#9CA3AF] hover:bg-[#1F2937]/50 hover:text-white"
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </Link>
            </>
          )}

          <div className="px-3 mt-6 mb-2 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
            Activity
          </div>
          <Link 
            to={createPageUrl("Orders")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPageName === "Orders" 
                ? "bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Orders & History
          </Link>

          <Link 
            to={createPageUrl("Analytics")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPageName === "Analytics" 
                ? "bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Performance
          </Link>

          <div className="px-3 mt-6 mb-2 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
            Support
          </div>
          <Link 
            to={createPageUrl("Disputes")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPageName === "Disputes" 
                ? "bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <CircleAlert className="w-4 h-4" />
            Dispute Center
          </Link>
        </nav>

        {/* User section at bottom */}
        {user && (
          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 font-semibold text-sm">
                  {user.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">
                  {user.full_name || "User"}
                </div>
                <div className="text-xs text-slate-500 truncate">{user.email}</div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
      </aside>
      )}

      {/* Main content area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${user ? 'lg:ml-64' : ''}`}>
        {/* Top header - Mobile & Desktop */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          {/* Mobile menu button */}
          {user && (
            <button 
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          {/* Logo - Show on mobile always, show on desktop only if sidebar is hidden (logged out) */}
          <div className={user ? "lg:hidden" : ""}>
            <Logo />
          </div>

          {/* Right side items */}
          <div className="flex items-center gap-4 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger className="relative p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors outline-none">
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-white border-slate-200 shadow-xl max-h-96 overflow-y-auto">
                <div className="px-4 py-3 font-semibold border-b border-slate-100 text-sm">
                  Notifications ({notifications.length})
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500">
                    No new notifications
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm text-slate-900">{n.title}</span>
                        <span className="text-[10px] text-slate-400">Just now</span>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">{n.message}</p>
                      <div className="flex gap-2">
                         {n.link && (
                           <Link 
                             to={n.link} 
                             className="text-xs font-medium text-indigo-600 hover:underline flex items-center"
                             onClick={() => markRead(n.id)}
                           >
                             View <ExternalLink className="w-3 h-3 ml-1" />
                           </Link>
                         )}
                         <button 
                           onClick={() => markRead(n.id)} 
                           className="text-xs text-slate-400 hover:text-slate-600"
                         >
                           Dismiss
                         </button>
                      </div>
                    </div>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="hidden lg:flex items-center gap-2 hover:bg-slate-100 rounded-lg px-3 py-1.5 transition-colors border border-transparent hover:border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 font-medium text-xs">
                      {user.full_name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <span className="text-sm text-slate-900">{user.full_name || "Account"}</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border-slate-200 text-slate-700">
                  <DropdownMenuItem asChild className="focus:bg-slate-50 focus:text-slate-900 cursor-pointer">
                    <Link to={createPageUrl(user?.user_type === 'publisher' ? 'PublisherDashboard' : 'AdvertiserDashboard')}>
                      <User className="w-4 h-4 mr-2" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="focus:bg-red-50 focus:text-red-600 text-red-500 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
               <div className="flex gap-3">
                 <Button 
                   variant="ghost" 
                   className="text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                   onClick={() => base44.auth.redirectToLogin()}
                 >
                   Login
                 </Button>
                 <Button 
                   className="bg-indigo-600 text-white hover:bg-indigo-700"
                   onClick={() => base44.auth.redirectToLogin(createPageUrl("UserTypeSelection"))}
                 >
                   Get Started
                 </Button>
               </div>
            )}
          </div>
        </header>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-[73px] bg-white z-20 p-4 border-t border-slate-200">
            <nav className="space-y-1">
              <Link 
                to={createPageUrl(user?.user_type === 'publisher' ? 'PublisherDashboard' : 'AdvertiserDashboard')}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Link>

              {user?.role === "admin" && (
                <Link 
                  to={createPageUrl("AdminPanel")}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield className="w-5 h-5" />
                  Admin Panel
                </Link>
              )}
              
              <Link 
                to={createPageUrl("Orders")}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingBag className="w-5 h-5" />
                Orders & History
              </Link>

              <Link 
                to={createPageUrl("Analytics")}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BarChart2 className="w-5 h-5" />
                Performance
              </Link>

              <Link 
                to={createPageUrl("Disputes")}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                <CircleAlert className="w-5 h-5" />
                Dispute Center
              </Link>
            </nav>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 p-6 bg-slate-50 text-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
}