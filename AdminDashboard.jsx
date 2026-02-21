import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, ShoppingBag, DollarSign, TrendingUp, Clock } from "lucide-react";

export default function AdminDashboard() {
  const { data: publishers = [] } = useQuery({
    queryKey: ['admin-publishers'],
    queryFn: () => base44.entities.Publisher.list(),
  });

  const { data: offers = [] } = useQuery({
    queryKey: ['admin-offers'],
    queryFn: () => base44.entities.Offer.list(),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list(),
  });

  const stats = [
    {
      title: "Total Publishers",
      value: publishers.length,
      subtitle: `${publishers.filter(p => p.verified).length} verified`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Active Offers",
      value: offers.filter(o => o.status === "active").length,
      subtitle: `${offers.filter(o => o.moderation_status === "pending").length} pending approval`,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Total Orders",
      value: orders.length,
      subtitle: `${orders.filter(o => o.status === "in_escrow").length} in escrow`,
      icon: ShoppingBag,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Total Volume",
      value: `$${orders.reduce((sum, o) => sum + (o.amount || 0), 0).toLocaleString()}`,
      subtitle: "All time",
      icon: DollarSign,
      color: "text-amber-600",
      bgColor: "bg-amber-100"
    }
  ];

  const recentActivity = [
    ...publishers.slice(-5).reverse().map(p => ({
      type: "publisher",
      title: `New publisher: ${p.company_name}`,
      time: new Date(p.created_date).toLocaleDateString(),
      status: p.verified ? "verified" : "pending"
    })),
    ...offers.slice(-5).reverse().map(o => ({
      type: "offer",
      title: `New offer: ${o.title}`,
      time: new Date(o.created_date).toLocaleDateString(),
      status: o.moderation_status
    })),
    ...orders.slice(-5).reverse().map(o => ({
      type: "order",
      title: `Order #${o.id.slice(0, 8)}`,
      time: new Date(o.created_date).toLocaleDateString(),
      status: o.status
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

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
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === "publisher" ? "bg-blue-500" :
                    activity.type === "offer" ? "bg-purple-500" :
                    "bg-green-500"
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  activity.status === "verified" || activity.status === "approved" ? "bg-green-100 text-green-700" :
                  activity.status === "pending" ? "bg-amber-100 text-amber-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <Users className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Publishers Pending</h3>
            <p className="text-2xl font-bold text-blue-600">
              {publishers.filter(p => !p.verified).length}
            </p>
            <p className="text-sm text-gray-600 mt-2">Need verification</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <Package className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Offers to Review</h3>
            <p className="text-2xl font-bold text-purple-600">
              {offers.filter(o => o.moderation_status === "pending").length}
            </p>
            <p className="text-sm text-gray-600 mt-2">Awaiting moderation</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <TrendingUp className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Active Orders</h3>
            <p className="text-2xl font-bold text-green-600">
              {orders.filter(o => ["pending", "in_escrow", "delivered"].includes(o.status)).length}
            </p>
            <p className="text-sm text-gray-600 mt-2">In progress</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}