import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Clock,
  Plus,
  Eye,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdvertiserDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        if (!userData) {
          base44.auth.redirectToLogin();
          return;
        }
        setUser(userData);
      } catch (error) {
        console.error("Auth error:", error);
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, []);

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns', user?.email],
    queryFn: () => base44.entities.Campaign.filter({ advertiser_email: user?.email }),
    enabled: !!user?.email,
  });

  const { data: watchlist = [] } = useQuery({
    queryKey: ['watchlist-dashboard', user?.email],
    queryFn: async () => {
      const items = await base44.entities.Watchlist.filter({ user_email: user?.email });
      // Fetch offer details for each
      const offers = await Promise.all(items.map(async (item) => {
        try {
          const offer = await base44.entities.Offer.get(item.offer_id);
          return { ...offer, watchlist_id: item.id };
        } catch (e) {
          return null;
        }
      }));
      return offers.filter(Boolean);
    },
    enabled: !!user?.email,
  });

  const { data: savedFilters = [] } = useQuery({
    queryKey: ['saved-filters', user?.email],
    queryFn: () => base44.entities.SavedFilter.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders', user?.email],
    queryFn: () => base44.entities.Order.filter({ buyer_email: user?.email }),
    enabled: !!user?.email,
  });

  const stats = [
    {
      title: "Active Campaigns",
      value: campaigns.filter(c => c.status === "active").length,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Total Spent",
      value: `$${orders.reduce((sum, o) => sum + (o.amount || 0), 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Active Orders",
      value: orders.filter(o => ["pending", "in_escrow", "delivered"].includes(o.status)).length,
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Pending Delivery",
      value: orders.filter(o => o.status === "delivered").length,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-100"
    }
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
            Welcome back{user?.company_name ? `, ${user.company_name}` : ""}
          </h1>
          <p className="text-slate-500">
            Manage your campaigns and track performance
          </p>
        </div>
        <div className="flex gap-3">
          <Link to={createPageUrl("Marketplace")}>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Eye className="w-4 h-4 mr-2" />
              Browse Offers
            </Button>
          </Link>
          <Link to={createPageUrl("ManageCampaigns")}>
            <Button variant="outline" className="bg-white text-slate-700 border-slate-200 hover:bg-slate-50">
              <BarChart3 className="w-4 h-4 mr-2" />
              Manage Campaigns
            </Button>
          </Link>
          <Link to={createPageUrl("CreateCampaign")}>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* Comparison Tool CTA */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white flex items-center justify-between shadow-lg">
          <div>
            <h3 className="text-xl font-bold mb-1">Analyze & Compare</h3>
            <p className="text-indigo-100">Compare performance across multiple campaigns to optimize your spend.</p>
          </div>
          <Link to={createPageUrl("CampaignComparison")}>
            <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-indigo-50">
              <BarChart3 className="w-4 h-4 mr-2" />
              Compare Campaigns
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col - Campaigns */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Recent Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No campaigns yet
              </h3>
              <p className="text-slate-500 mb-6">
                Create your first campaign to start advertising
              </p>
              <Link to={createPageUrl("CreateCampaign")}>
                <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.slice(0, 5).map(campaign => (
                <div key={campaign.id} className="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-slate-50 transition-colors border border-slate-200 shadow-sm">
                  <div>
                    <h4 className="font-medium text-slate-900">{campaign.name}</h4>
                    <p className="text-sm text-slate-500">
                      Budget: ${campaign.budget?.toLocaleString()} • Spent: ${campaign.spent?.toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    campaign.status === "active" ? "bg-green-100 text-green-700 border border-green-200" :
                    campaign.status === "paused" ? "bg-amber-100 text-amber-700 border border-amber-200" :
                    "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}>
                    {campaign.status}
                  </span>
                </div>
              ))}
            </div>
          )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col - Watchlist & Saved Searches */}
        <div className="space-y-8">
          {/* Watchlist */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Watchlist</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {watchlist.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  No saved offers.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {watchlist.slice(0, 5).map(offer => (
                    <Link key={offer.id} to={`${createPageUrl("OfferDetails")}?id=${offer.id}`} className="block hover:bg-slate-50 transition-colors p-4">
                      <div className="font-medium text-slate-900 truncate">{offer.title}</div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-slate-500 capitalize">{offer.category}</span>
                        <span className="text-xs font-bold text-indigo-600">${offer.deal_price?.toLocaleString()}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Saved Searches */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Saved Searches</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {savedFilters.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  No saved searches.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {savedFilters.slice(0, 5).map(filter => (
                    <div key={filter.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                      <div className="font-medium text-slate-900 text-sm">{filter.name}</div>
                      <div className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        Active
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}