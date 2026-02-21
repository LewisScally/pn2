import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp } from "lucide-react";
import AdvertiserAnalytics from "@/components/analytics/AdvertiserAnalytics";
import PublisherAnalytics from "@/components/analytics/PublisherAnalytics";

export default function Analytics() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        setUserType(userData?.user_type);
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };
    fetchUser();
  }, []);

  if (!user) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Analytics</h1>
            <p className="text-[#9CA3AF]">Track your performance and metrics</p>
          </div>
        </div>
      </div>

      {/* Content based on user type */}
      <div className="text-[#E5E7EB]">
      {userType === "advertiser" ? (
        <AdvertiserAnalytics advertiserEmail={user.email} />
      ) : userType === "publisher" ? (
        <PublisherAnalytics publisherEmail={user.email} />
      ) : (
        <Tabs defaultValue="advertiser" className="space-y-6">
          <TabsList>
            <TabsTrigger value="advertiser">
              <TrendingUp className="w-4 h-4 mr-2" />
              Advertiser View
            </TabsTrigger>
            <TabsTrigger value="publisher">
              <BarChart3 className="w-4 h-4 mr-2" />
              Publisher View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="advertiser">
            <AdvertiserAnalytics advertiserEmail={user.email} />
          </TabsContent>

          <TabsContent value="publisher">
            <PublisherAnalytics publisherEmail={user.email} />
          </TabsContent>
        </Tabs>
      )}
      </div>
    </div>
  );
}