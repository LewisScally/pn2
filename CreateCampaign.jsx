import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Plus, X, Target, DollarSign, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedOffers, setSelectedOffers] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [objectiveInput, setObjectiveInput] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    budget: "",
    start_date: "",
    end_date: "",
    conversion_goal: "clicks",
    target_cpa: "",
    target_audience: {
      age_range: "",
      interests: "",
      location: "",
      demographics: ""
    }
  });

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const { data: offers = [] } = useQuery({
    queryKey: ['marketplace-offers'],
    queryFn: () => base44.entities.Offer.filter({ status: "active", moderation_status: "approved" }),
  });

  const addObjective = () => {
    if (objectiveInput.trim()) {
      setObjectives([...objectives, objectiveInput.trim()]);
      setObjectiveInput("");
    }
  };

  const toggleOffer = (offer) => {
    if (selectedOffers.find(o => o.id === offer.id)) {
      setSelectedOffers(selectedOffers.filter(o => o.id !== offer.id));
    } else {
      setSelectedOffers([...selectedOffers, offer]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.budget || !formData.start_date) {
      toast.error("Please fill in required fields");
      return;
    }

    if (selectedOffers.length === 0) {
      toast.error("Please select at least one offer");
      return;
    }

    try {
      const campaign = await base44.entities.Campaign.create({
        advertiser_email: user.email,
        name: formData.name,
        description: formData.description,
        budget: parseFloat(formData.budget),
        spent: 0,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        status: "draft",
        objectives,
        target_audience: formData.target_audience,
        creative_assets: []
      });

      // Create orders for selected offers
      for (const offer of selectedOffers) {
        await base44.entities.Order.create({
          listing_id: offer.id,
          buyer_email: user.email,
          seller_email: offer.created_by,
          amount: offer.deal_price,
          status: "pending",
          notes: `Campaign: ${formData.name}`
        });
      }

      toast.success("Campaign created successfully");
      navigate(createPageUrl("ManageCampaigns"));
    } catch (error) {
      toast.error("Failed to create campaign");
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      newsletter: "bg-blue-100 text-blue-700",
      twitter: "bg-sky-100 text-sky-700",
      telegram: "bg-indigo-100 text-indigo-700",
      youtube: "bg-red-100 text-red-700",
      podcast: "bg-purple-100 text-purple-700",
      website: "bg-green-100 text-green-700",
      pr: "bg-orange-100 text-orange-700",
      kol: "bg-pink-100 text-pink-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("AdvertiserDashboard"))}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          Create Campaign
        </h1>
        <p className="text-gray-500">
          Set up your advertising campaign and select offers
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Campaign Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Campaign Name *
                  </label>
                  <Input
                    placeholder="e.g., Q1 2024 Brand Awareness Campaign"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Description
                  </label>
                  <Textarea
                    placeholder="Describe your campaign goals and strategy..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Budget ($) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Start Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      End Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Objectives */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Objectives</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add an objective..."
                    value={objectiveInput}
                    onChange={(e) => setObjectiveInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addObjective();
                      }
                    }}
                  />
                  <Button type="button" onClick={addObjective}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {objectives.map((obj, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {obj}
                      <button
                        type="button"
                        onClick={() => setObjectives(objectives.filter((_, i) => i !== index))}
                        className="ml-2"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Target Audience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Target Audience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Age Range (e.g., 25-45)"
                    value={formData.target_audience.age_range}
                    onChange={(e) => setFormData({
                      ...formData,
                      target_audience: { ...formData.target_audience, age_range: e.target.value }
                    })}
                  />
                  <Input
                    placeholder="Location (e.g., USA, Europe)"
                    value={formData.target_audience.location}
                    onChange={(e) => setFormData({
                      ...formData,
                      target_audience: { ...formData.target_audience, location: e.target.value }
                    })}
                  />
                </div>
                <Input
                  placeholder="Interests (e.g., crypto, tech, finance)"
                  value={formData.target_audience.interests}
                  onChange={(e) => setFormData({
                    ...formData,
                    target_audience: { ...formData.target_audience, interests: e.target.value }
                  })}
                />
                <Input
                  placeholder="Demographics (e.g., professionals, entrepreneurs)"
                  value={formData.target_audience.demographics}
                  onChange={(e) => setFormData({
                    ...formData,
                    target_audience: { ...formData.target_audience, demographics: e.target.value }
                  })}
                />
              </CardContent>
            </Card>

            {/* Select Offers */}
            <Card>
              <CardHeader>
                <CardTitle>Select Offers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {offers.map(offer => (
                    <div
                      key={offer.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedOffers.find(o => o.id === offer.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => toggleOffer(offer)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={getCategoryColor(offer.category)}>
                          {offer.category}
                        </Badge>
                        <Checkbox
                          checked={!!selectedOffers.find(o => o.id === offer.id)}
                          onCheckedChange={() => toggleOffer(offer)}
                        />
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{offer.title}</h4>
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">{offer.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {(offer.audience_size / 1000).toFixed(0)}K reach
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          ${offer.deal_price?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Campaign Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">Total Budget</p>
                  <p className="text-2xl font-bold text-blue-900">
                    ${formData.budget || "0"}
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 mb-1">Selected Offers</p>
                  <p className="text-2xl font-bold text-green-900">
                    {selectedOffers.length}
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600 mb-1">Estimated Spend</p>
                  <p className="text-2xl font-bold text-purple-900">
                    ${selectedOffers.reduce((sum, o) => sum + (o.deal_price || 0), 0).toLocaleString()}
                  </p>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-600 mb-1">Total Reach</p>
                  <p className="text-2xl font-bold text-amber-900">
                    {(selectedOffers.reduce((sum, o) => sum + (o.audience_size || 0), 0) / 1000).toFixed(0)}K
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500">
                    <Save className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(createPageUrl("AdvertiserDashboard"))}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}