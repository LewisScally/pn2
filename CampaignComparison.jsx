import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, BarChart2 } from "lucide-react";

export default function CampaignComparison() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await base44.auth.me();
      if (!userData) {
        base44.auth.redirectToLogin();
        return;
      }
      setUser(userData);
    };
    fetchUser();
  }, []);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns', user?.email],
    queryFn: () => base44.entities.Campaign.filter({ advertiser_email: user?.email }),
    enabled: !!user?.email,
  });

  const toggleCampaign = (id) => {
    setSelectedCampaignIds(prev => 
      prev.includes(id) 
        ? prev.filter(cid => cid !== id)
        : [...prev, id]
    );
  };

  const selectedCampaigns = campaigns.filter(c => selectedCampaignIds.includes(c.id));

  // Prepare data for charts
  // Comparing Budget vs Spent
  const budgetData = selectedCampaigns.map(c => ({
    name: c.name,
    Budget: c.budget || 0,
    Spent: c.spent || 0
  }));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("AdvertiserDashboard"))}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
          Campaign Comparison
        </h1>
        <p className="text-slate-500">
          Select campaigns to compare their performance side-by-side
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Selection */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Campaigns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="text-sm text-slate-500">Loading campaigns...</div>
              ) : campaigns.length === 0 ? (
                <div className="text-sm text-slate-500">No campaigns found.</div>
              ) : (
                campaigns.map(campaign => (
                  <div key={campaign.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={campaign.id} 
                      checked={selectedCampaignIds.includes(campaign.id)}
                      onCheckedChange={() => toggleCampaign(campaign.id)}
                    />
                    <label
                      htmlFor={campaign.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {campaign.name}
                    </label>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Area */}
        <div className="lg:col-span-3 space-y-8">
          {selectedCampaigns.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <BarChart2 className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-500">Select at least one campaign to view analytics</p>
            </div>
          ) : (
            <>
              {/* Budget vs Spent Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Budget vs. Spent</CardTitle>
                  <CardDescription>Financial comparison of selected campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={budgetData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                        <Legend />
                        <Bar dataKey="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Spent" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}