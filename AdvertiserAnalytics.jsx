import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MousePointerClick, TrendingUp, DollarSign, Target, BarChart3 } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdvertiserAnalytics({ advertiserEmail }) {
  const [timeRange, setTimeRange] = useState("7d");

  const { data: clicks = [] } = useQuery({
    queryKey: ['advertiser-clicks', advertiserEmail],
    queryFn: () => base44.entities.Click.filter({ advertiser_email: advertiserEmail }),
  });

  const { data: conversions = [] } = useQuery({
    queryKey: ['advertiser-conversions', advertiserEmail],
    queryFn: () => base44.entities.Conversion.filter({ advertiser_email: advertiserEmail }),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['advertiser-orders', advertiserEmail],
    queryFn: () => base44.entities.Order.filter({ buyer_email: advertiserEmail }),
  });

  // Calculate metrics
  const totalClicks = clicks.length;
  const totalConversions = conversions.length;
  const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : 0;
  const totalSpend = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const costPerClick = totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : 0;
  const costPerConversion = totalConversions > 0 ? (totalSpend / totalConversions).toFixed(2) : 0;

  // Group clicks by date
  const clicksByDate = clicks.reduce((acc, click) => {
    const date = new Date(click.created_date).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(clicksByDate).map(([date, count]) => ({
    date,
    clicks: count,
    conversions: conversions.filter(c => 
      new Date(c.created_date).toLocaleDateString() === date
    ).length
  })).slice(-7);

  // Device breakdown
  const deviceData = clicks.reduce((acc, click) => {
    acc[click.device_type] = (acc[click.device_type] || 0) + 1;
    return acc;
  }, {});

  const deviceChartData = Object.entries(deviceData).map(([device, count]) => ({
    device: device.charAt(0).toUpperCase() + device.slice(1),
    count
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
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Cost per Click",
      value: `$${costPerClick}`,
      icon: DollarSign,
      color: "text-amber-600",
      bgColor: "bg-amber-100"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Campaign Performance</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

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

      {/* Performance Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} name="Clicks" />
              <Line type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} name="Conversions" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Device Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={deviceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="device" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Total Spend</span>
              <span className="text-xl font-bold text-gray-900">${totalSpend.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Cost per Conversion</span>
              <span className="text-xl font-bold text-gray-900">${costPerConversion}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Active Campaigns</span>
              <span className="text-xl font-bold text-gray-900">
                {orders.filter(o => ["in_escrow", "delivered"].includes(o.status)).length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}