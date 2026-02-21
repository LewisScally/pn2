import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MousePointerClick, TrendingUp, DollarSign, Eye } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function PublisherAnalytics({ publisherEmail }) {
  const { data: clicks = [] } = useQuery({
    queryKey: ['publisher-clicks', publisherEmail],
    queryFn: () => base44.entities.Click.filter({ publisher_email: publisherEmail }),
  });

  const { data: conversions = [] } = useQuery({
    queryKey: ['publisher-conversions', publisherEmail],
    queryFn: () => base44.entities.Conversion.filter({ publisher_email: publisherEmail }),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['publisher-orders', publisherEmail],
    queryFn: () => base44.entities.Order.filter({ seller_email: publisherEmail }),
  });

  const { data: offers = [] } = useQuery({
    queryKey: ['publisher-offers-analytics', publisherEmail],
    queryFn: async () => {
      const publisher = await base44.entities.Publisher.filter({ user_email: publisherEmail });
      if (publisher.length > 0) {
        return await base44.entities.Offer.filter({ publisher_id: publisher[0].id });
      }
      return [];
    },
  });

  // Calculate metrics
  const totalClicks = clicks.length;
  const totalConversions = conversions.length;
  const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : 0;
  const totalEarnings = orders.filter(o => o.status === "completed").reduce((sum, o) => sum + (o.amount || 0), 0);
  const activeOffers = offers.filter(o => o.status === "active").length;

  // Click through rate by offer
  const offerPerformance = offers.map(offer => {
    const offerClicks = clicks.filter(c => c.offer_id === offer.id).length;
    const offerConversions = conversions.filter(c => c.offer_id === offer.id).length;
    return {
      title: offer.title,
      clicks: offerClicks,
      conversions: offerConversions,
      ctr: offerClicks > 0 ? ((offerConversions / offerClicks) * 100).toFixed(1) : 0
    };
  }).sort((a, b) => b.clicks - a.clicks).slice(0, 5);

  // Clicks over time
  const clicksByDate = clicks.reduce((acc, click) => {
    const date = new Date(click.created_date).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(clicksByDate).map(([date, count]) => ({
    date,
    clicks: count
  })).slice(-7);

  // Offer category distribution
  const categoryData = offers.reduce((acc, offer) => {
    acc[offer.category] = (acc[offer.category] || 0) + 1;
    return acc;
  }, {});

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];
  const categoryChartData = Object.entries(categoryData).map(([category, count]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: count
  }));

  const stats = [
    {
      title: "Total Clicks",
      value: totalClicks.toLocaleString(),
      icon: MousePointerClick,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Conversions",
      value: totalConversions.toLocaleString(),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Active Offers",
      value: activeOffers.toLocaleString(),
      icon: Eye,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Total Earnings",
      value: `$${totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: "text-amber-600",
      bgColor: "bg-amber-100"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Clicks Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Clicks Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Offer Performance & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Offers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {offerPerformance.length === 0 ? (
                <p className="text-gray-500 text-sm">No performance data yet</p>
              ) : (
                offerPerformance.map((offer, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-900 text-sm">{offer.title}</span>
                      <span className="text-xs text-gray-500">{offer.ctr}% CTR</span>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>{offer.clicks} clicks</span>
                      <span>{offer.conversions} conversions</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Offer Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">No offers yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 mb-1">Avg. CTR</p>
              <p className="text-2xl font-bold text-blue-900">{conversionRate}%</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 mb-1">Completed Orders</p>
              <p className="text-2xl font-bold text-green-900">
                {orders.filter(o => o.status === "completed").length}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 mb-1">Pending Orders</p>
              <p className="text-2xl font-bold text-purple-900">
                {orders.filter(o => ["in_escrow", "delivered"].includes(o.status)).length}
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-600 mb-1">Avg. Earnings</p>
              <p className="text-2xl font-bold text-amber-900">
                ${orders.length > 0 ? (totalEarnings / orders.length).toFixed(0) : 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}