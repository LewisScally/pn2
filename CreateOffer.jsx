import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Upload, Plus, X, Image, Video } from "lucide-react";
import { toast } from "sonner";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function CreateOffer() {
  const navigate = useNavigate();
  const [publisher, setPublisher] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "newsletter",
    ad_type: "sponsored_post",
    audience_size: "",
    rrp_price: "",
    deal_price: "",
    delivery_days: 7,
    inventory_count: 1,
    image_urls: [],
    video_urls: [],
    sample_work_urls: [],
    audience_demographics: {
      age_range: "",
      gender_split: "",
      top_countries: "",
      interests: "",
      income_level: "",
      education_level: ""
    },
    category_specifics: {
      // Newsletter
      subscriber_count: "",
      open_rate: "",
      click_rate: "",
      
      // Website
      monthly_traffic: "",
      domain_authority: "",
      avg_session_duration: "",
      
      // Social Media
      follower_count: "",
      engagement_rate: "",
      avg_views: "",
      
      // YouTube/Podcast
      avg_watch_time: "",
      episode_count: ""
    }
  });

  useEffect(() => {
    const fetchPublisher = async () => {
      const user = await base44.auth.me();
      const publishers = await base44.entities.Publisher.filter({ user_email: user.email });
      if (publishers.length > 0) {
        setPublisher(publishers[0]);
      } else {
        toast.error("Publisher profile not found");
        navigate(createPageUrl("PublisherDashboard"));
      }
    };
    fetchPublisher();
  }, [navigate]);

  const handleFileUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        const response = await base44.integrations.Core.UploadFile({ file });
        const url = response.file_url;
        
        if (type === "image") {
          setFormData(prev => ({
            ...prev,
            image_urls: [...prev.image_urls, url]
          }));
        } else if (type === "video") {
          setFormData(prev => ({
            ...prev,
            video_urls: [...prev.video_urls, url]
          }));
        }
      }
      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeUrl = (type, index) => {
    if (type === "image") {
      setFormData(prev => ({
        ...prev,
        image_urls: prev.image_urls.filter((_, i) => i !== index)
      }));
    } else if (type === "video") {
      setFormData(prev => ({
        ...prev,
        video_urls: prev.video_urls.filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        sample_work_urls: prev.sample_work_urls.filter((_, i) => i !== index)
      }));
    }
  };

  const renderCategorySpecificFields = () => {
    switch (formData.category) {
      case "newsletter":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Subscriber Count
              </label>
              <Input
                type="number"
                placeholder="50000"
                value={formData.category_specifics.subscriber_count}
                onChange={(e) => setFormData({
                  ...formData,
                  category_specifics: { ...formData.category_specifics, subscriber_count: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Open Rate (%)
              </label>
              <Input
                type="number"
                step="0.1"
                placeholder="35.5"
                value={formData.category_specifics.open_rate}
                onChange={(e) => setFormData({
                  ...formData,
                  category_specifics: { ...formData.category_specifics, open_rate: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Click-Through Rate (%)
              </label>
              <Input
                type="number"
                step="0.1"
                placeholder="4.2"
                value={formData.category_specifics.click_rate}
                onChange={(e) => setFormData({
                  ...formData,
                  category_specifics: { ...formData.category_specifics, click_rate: e.target.value }
                })}
              />
            </div>
          </div>
        );
      
      case "website":
      case "blog":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Monthly Traffic
              </label>
              <Input
                type="number"
                placeholder="100000"
                value={formData.category_specifics.monthly_traffic}
                onChange={(e) => setFormData({
                  ...formData,
                  category_specifics: { ...formData.category_specifics, monthly_traffic: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Domain Authority
              </label>
              <Input
                type="number"
                placeholder="65"
                value={formData.category_specifics.domain_authority}
                onChange={(e) => setFormData({
                  ...formData,
                  category_specifics: { ...formData.category_specifics, domain_authority: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Avg. Session Duration (min)
              </label>
              <Input
                type="number"
                step="0.1"
                placeholder="3.5"
                value={formData.category_specifics.avg_session_duration}
                onChange={(e) => setFormData({
                  ...formData,
                  category_specifics: { ...formData.category_specifics, avg_session_duration: e.target.value }
                })}
              />
            </div>
          </div>
        );
      
      case "twitter":
      case "instagram":
      case "tiktok":
      case "linkedin":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Follower Count
              </label>
              <Input
                type="number"
                placeholder="50000"
                value={formData.category_specifics.follower_count}
                onChange={(e) => setFormData({
                  ...formData,
                  category_specifics: { ...formData.category_specifics, follower_count: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Engagement Rate (%)
              </label>
              <Input
                type="number"
                step="0.1"
                placeholder="5.2"
                value={formData.category_specifics.engagement_rate}
                onChange={(e) => setFormData({
                  ...formData,
                  category_specifics: { ...formData.category_specifics, engagement_rate: e.target.value }
                })}
              />
            </div>
          </div>
        );
      
      case "youtube":
      case "podcast":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Subscriber/Follower Count
              </label>
              <Input
                type="number"
                placeholder="25000"
                value={formData.category_specifics.follower_count}
                onChange={(e) => setFormData({
                  ...formData,
                  category_specifics: { ...formData.category_specifics, follower_count: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Avg. Views/Listens
              </label>
              <Input
                type="number"
                placeholder="10000"
                value={formData.category_specifics.avg_views}
                onChange={(e) => setFormData({
                  ...formData,
                  category_specifics: { ...formData.category_specifics, avg_views: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Episode Count
              </label>
              <Input
                type="number"
                placeholder="50"
                value={formData.category_specifics.episode_count}
                onChange={(e) => setFormData({
                  ...formData,
                  category_specifics: { ...formData.category_specifics, episode_count: e.target.value }
                })}
              />
            </div>
          </div>
        );
      
      case "telegram":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Channel Members
              </label>
              <Input
                type="number"
                placeholder="15000"
                value={formData.category_specifics.follower_count}
                onChange={(e) => setFormData({
                  ...formData,
                  category_specifics: { ...formData.category_specifics, follower_count: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Avg. Post Views
              </label>
              <Input
                type="number"
                placeholder="8000"
                value={formData.category_specifics.avg_views}
                onChange={(e) => setFormData({
                  ...formData,
                  category_specifics: { ...formData.category_specifics, avg_views: e.target.value }
                })}
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.rrp_price || !formData.deal_price) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (parseFloat(formData.deal_price) >= parseFloat(formData.rrp_price)) {
      toast.error("Deal price must be less than RRP");
      return;
    }

    try {
      await base44.entities.Offer.create({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        ad_type: formData.ad_type,
        publisher_id: publisher.id,
        audience_size: parseInt(formData.audience_size),
        rrp_price: parseFloat(formData.rrp_price),
        deal_price: parseFloat(formData.deal_price),
        delivery_days: parseInt(formData.delivery_days),
        inventory_count: parseInt(formData.inventory_count),
        image_urls: formData.image_urls,
        sample_work_urls: formData.sample_work_urls,
        audience_demographics: formData.audience_demographics,
        status: "draft",
        moderation_status: "pending"
      });

      toast.success("Offer created and submitted for review");
      navigate(createPageUrl("ManageOffers"));
    } catch (error) {
      toast.error("Failed to create offer");
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("PublisherDashboard"))}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          Create New Offer
        </h1>
        <p className="text-gray-500">
          List your inventory on the marketplace
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Offer Title *
              </label>
              <Input
                placeholder="e.g., Featured Newsletter Placement - 50K Subscribers"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Description *
              </label>
              <ReactQuill
                theme="snow"
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Describe what you're offering, your audience, and what makes your platform valuable..."
                className="bg-white rounded-lg"
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['link'],
                    ['clean']
                  ]
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Category *
                </label>
                <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="podcast">Podcast</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Ad Type *
                </label>
                <Select value={formData.ad_type} onValueChange={(val) => setFormData({ ...formData, ad_type: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sponsored_post">Sponsored Post</SelectItem>
                    <SelectItem value="banner">Banner Ad</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="article">Sponsored Article</SelectItem>
                    <SelectItem value="newsletter_placement">Newsletter Placement</SelectItem>
                    <SelectItem value="twitter_thread">Twitter Thread</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Audience Size *
              </label>
              <Input
                type="number"
                placeholder="e.g., 50000"
                value={formData.audience_size}
                onChange={(e) => setFormData({ ...formData, audience_size: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of subscribers, followers, or monthly visitors
              </p>
            </div>
            </CardContent>
            </Card>

            {/* Category-Specific Metrics */}
            <Card>
            <CardHeader>
            <CardTitle>Platform Metrics</CardTitle>
            </CardHeader>
            <CardContent>
            {renderCategorySpecificFields()}
            </CardContent>
            </Card>

            {/* Audience Demographics */}
            <Card>
            <CardHeader>
            <CardTitle>Audience Demographics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Age Range
                </label>
                <Input
                  placeholder="e.g., 25-45"
                  value={formData.audience_demographics.age_range}
                  onChange={(e) => setFormData({
                    ...formData,
                    audience_demographics: { ...formData.audience_demographics, age_range: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Gender Split
                </label>
                <Input
                  placeholder="e.g., 60% Male, 40% Female"
                  value={formData.audience_demographics.gender_split}
                  onChange={(e) => setFormData({
                    ...formData,
                    audience_demographics: { ...formData.audience_demographics, gender_split: e.target.value }
                  })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Top Countries/Regions
              </label>
              <Input
                placeholder="e.g., USA (40%), UK (20%), Canada (15%)"
                value={formData.audience_demographics.top_countries}
                onChange={(e) => setFormData({
                  ...formData,
                  audience_demographics: { ...formData.audience_demographics, top_countries: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Primary Interests
              </label>
              <Input
                placeholder="e.g., Crypto, DeFi, NFTs, Trading"
                value={formData.audience_demographics.interests}
                onChange={(e) => setFormData({
                  ...formData,
                  audience_demographics: { ...formData.audience_demographics, interests: e.target.value }
                })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Income Level
                </label>
                <Select
                  value={formData.audience_demographics.income_level}
                  onValueChange={(val) => setFormData({
                    ...formData,
                    audience_demographics: { ...formData.audience_demographics, income_level: val }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select income level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low ($0-$30K)</SelectItem>
                    <SelectItem value="middle">Middle ($30K-$100K)</SelectItem>
                    <SelectItem value="upper_middle">Upper Middle ($100K-$250K)</SelectItem>
                    <SelectItem value="high">High ($250K+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Education Level
                </label>
                <Select
                  value={formData.audience_demographics.education_level}
                  onValueChange={(val) => setFormData({
                    ...formData,
                    audience_demographics: { ...formData.audience_demographics, education_level: val }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high_school">High School</SelectItem>
                    <SelectItem value="some_college">Some College</SelectItem>
                    <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                    <SelectItem value="masters">Master's Degree</SelectItem>
                    <SelectItem value="doctorate">Doctorate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            </CardContent>
            </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Delivery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Regular Price (RRP) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.rrp_price}
                    onChange={(e) => setFormData({ ...formData, rrp_price: e.target.value })}
                    className="pl-7"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Marketplace Price (20% off) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.deal_price}
                    onChange={(e) => setFormData({ ...formData, deal_price: e.target.value })}
                    className="pl-7"
                    required
                  />
                </div>
                {formData.rrp_price && formData.deal_price && (
                  <p className="text-xs text-gray-500 mt-1">
                    Discount: {(((formData.rrp_price - formData.deal_price) / formData.rrp_price) * 100).toFixed(0)}%
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Delivery Time (days) *
                </label>
                <Input
                  type="number"
                  value={formData.delivery_days}
                  onChange={(e) => setFormData({ ...formData, delivery_days: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Available Slots
                </label>
                <Input
                  type="number"
                  value={formData.inventory_count}
                  onChange={(e) => setFormData({ ...formData, inventory_count: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader>
            <CardTitle>Media & Samples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Images (Multiple)
              </label>
              <div className="space-y-2">
                {formData.image_urls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <img src={url} alt="" className="w-16 h-16 object-cover rounded" />
                    <span className="flex-1 text-sm text-gray-600 truncate">{url}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeUrl("image", index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e, "image")}
                    className="hidden"
                    disabled={uploading}
                  />
                  <Button type="button" variant="outline" className="w-full" disabled={uploading} asChild>
                    <span>
                      <Image className="w-4 h-4 mr-2" />
                      {uploading ? "Uploading..." : "Upload Images"}
                    </span>
                  </Button>
                </label>
                <p className="text-xs text-gray-500">
                  You can upload multiple images at once
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Videos (Optional)
              </label>
              <div className="space-y-2">
                {formData.video_urls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                      <Video className="w-6 h-6 text-gray-400" />
                    </div>
                    <span className="flex-1 text-sm text-gray-600 truncate">{url}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeUrl("video", index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <label className="block">
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={(e) => handleFileUpload(e, "video")}
                    className="hidden"
                    disabled={uploading}
                  />
                  <Button type="button" variant="outline" className="w-full" disabled={uploading} asChild>
                    <span>
                      <Video className="w-4 h-4 mr-2" />
                      {uploading ? "Uploading..." : "Upload Videos"}
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Sample Work URLs
              </label>
              <div className="space-y-2">
                {formData.sample_work_urls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <span className="flex-1 text-sm text-gray-600 truncate">{url}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeUrl("sample", index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Input
                  placeholder="Paste a link to sample work..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.target.value) {
                      e.preventDefault();
                      setFormData(prev => ({
                        ...prev,
                        sample_work_urls: [...prev.sample_work_urls, e.target.value]
                      }));
                      e.target.value = "";
                    }
                  }}
                />
                <p className="text-xs text-gray-500">
                  Press Enter to add a URL
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(createPageUrl("PublisherDashboard"))}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500">
            <Save className="w-4 h-4 mr-2" />
            Submit for Review
          </Button>
        </div>
      </form>
    </div>
  );
}