import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Target, 
  Users, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Calendar,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function AdvertiserOnboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    website: "",
    industry: "",
    companySize: "",
    monthlyBudget: "",
    campaignGoals: [],
    targetAudience: "",
    preferredChannels: []
  });

  const steps = [
    {
      title: "Company Information",
      icon: Building2,
      fields: ["companyName", "website", "industry", "companySize"]
    },
    {
      title: "Budget & Goals",
      icon: Target,
      fields: ["monthlyBudget", "campaignGoals"]
    },
    {
      title: "Target Audience",
      icon: Users,
      fields: ["targetAudience", "preferredChannels"]
    }
  ];

  const industries = [
    "Cryptocurrency", "DeFi", "NFT", "Blockchain", "Web3", 
    "Gaming", "Finance", "Technology", "E-commerce", "Other"
  ];

  const companySizes = ["1-10", "11-50", "51-200", "201-500", "500+"];

  const budgetRanges = [
    "< $5,000", "$5,000 - $10,000", "$10,000 - $25,000", 
    "$25,000 - $50,000", "$50,000+"
  ];

  const goalOptions = [
    "Brand Awareness", "Lead Generation", "Product Launch", 
    "Community Growth", "Token Promotion", "Event Marketing"
  ];

  const channelOptions = [
    "Newsletter", "Twitter", "Telegram", "YouTube", 
    "Podcast", "Website", "LinkedIn", "Instagram"
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // Update user profile
      await base44.auth.updateMe({
        company_name: formData.companyName,
        website: formData.website,
        onboarding_completed: true,
        onboarding_data: formData
      });

      // Create buyer profile
      const user = await base44.auth.me();
      await base44.entities.BuyerProfile.create({
        user_email: user.email,
        company_name: formData.companyName,
        industry: formData.industry,
        company_size: formData.companySize,
        monthly_ad_budget: parseFloat(formData.monthlyBudget.replace(/[^0-9]/g, "")) || 0,
        target_audience: { description: formData.targetAudience },
        preferred_channels: formData.preferredChannels
      });

      toast.success("Welcome to PinnacleDealz! Your advertiser account is ready.");
      navigate(createPageUrl("AdvertiserDashboard"));
    } catch (error) {
      console.error("Onboarding failed:", error);
      toast.error("Failed to complete onboarding. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleArrayItem = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div key={index} className="flex-1 flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    index <= currentStep 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-200 text-gray-400"
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      index < currentStep ? "bg-blue-500" : "bg-gray-200"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-center text-gray-600 text-sm">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Form Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {steps[currentStep].title}
          </h2>

          <div className="space-y-6">
            {/* Step 0: Company Information */}
            {currentStep === 0 && (
              <>
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    placeholder="Your company name"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    placeholder="https://yourcompany.com"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <Select 
                    value={formData.industry}
                    onValueChange={(value) => setFormData({...formData, industry: value})}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map(industry => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="companySize">Company Size *</Label>
                  <Select 
                    value={formData.companySize}
                    onValueChange={(value) => setFormData({...formData, companySize: value})}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizes.map(size => (
                        <SelectItem key={size} value={size}>
                          {size} employees
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Step 1: Budget & Goals */}
            {currentStep === 1 && (
              <>
                <div>
                  <Label htmlFor="monthlyBudget">Monthly Ad Budget *</Label>
                  <Select 
                    value={formData.monthlyBudget}
                    onValueChange={(value) => setFormData({...formData, monthlyBudget: value})}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetRanges.map(range => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Campaign Goals (Select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {goalOptions.map(goal => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleArrayItem("campaignGoals", goal)}
                        className={`p-3 rounded-lg border text-sm transition-all ${
                          formData.campaignGoals.includes(goal)
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Target Audience */}
            {currentStep === 2 && (
              <>
                <div>
                  <Label htmlFor="targetAudience">Target Audience Description *</Label>
                  <Textarea
                    id="targetAudience"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                    placeholder="Describe your ideal customer (demographics, interests, behaviors...)"
                    rows={4}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Preferred Advertising Channels (Select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {channelOptions.map(channel => (
                      <button
                        key={channel}
                        type="button"
                        onClick={() => toggleArrayItem("preferredChannels", channel)}
                        className={`p-3 rounded-lg border text-sm transition-all ${
                          formData.preferredChannels.includes(channel)
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {channel}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <Button
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {currentStep === steps.length - 1 ? (
                isSubmitting ? "Completing..." : "Complete Onboarding"
              ) : (
                "Continue"
              )}
              {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}