import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Search, Check, X, AlertTriangle, Loader2, Users, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function OfferModeration() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [moderating, setModerating] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const queryClient = useQueryClient();

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['admin-offers'],
    queryFn: () => base44.entities.Offer.list(),
  });

  const updateOffer = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Offer.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-offers']);
      setSelectedOffer(null);
      setRejectReason("");
    },
  });

  const handleModerate = async (offer) => {
    setModerating(true);
    try {
      const response = await base44.functions.invoke('moderateOffer', {
        offerId: offer.id,
        title: offer.title,
        description: offer.description
      });

      toast.success(`Offer moderated: ${response.data.decision}`);
      queryClient.invalidateQueries(['admin-offers']);
      setSelectedOffer(null);
    } catch (error) {
      toast.error("Moderation failed");
    } finally {
      setModerating(false);
    }
  };

  const handleApprove = async (offer) => {
    await updateOffer.mutateAsync({
      id: offer.id,
      data: { moderation_status: "approved", moderation_notes: "Approved by admin" }
    });
    toast.success("Offer approved");
  };

  const handleReject = async (offer) => {
    await updateOffer.mutateAsync({
      id: offer.id,
      data: { 
        moderation_status: "rejected", 
        moderation_notes: rejectReason || "Rejected by admin",
        status: "draft"
      }
    });
    toast.success("Offer rejected");
  };

  const filteredOffers = offers.filter(o =>
    o.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingOffers = filteredOffers.filter(o => o.moderation_status === "pending");
  const approvedOffers = filteredOffers.filter(o => o.moderation_status === "approved");
  const rejectedOffers = filteredOffers.filter(o => o.moderation_status === "rejected");

  const getCategoryColor = (category) => {
    const colors = {
      newsletter: "bg-blue-100 text-blue-700",
      twitter: "bg-sky-100 text-sky-700",
      telegram: "bg-indigo-100 text-indigo-700",
      youtube: "bg-red-100 text-red-700",
      podcast: "bg-purple-100 text-purple-700",
      website: "bg-green-100 text-green-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num?.toString() || "0";
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search offers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Pending Moderation */}
      {pendingOffers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Pending Moderation ({pendingOffers.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingOffers.map(offer => (
              <Card key={offer.id} className="border-amber-200 bg-amber-50/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={getCategoryColor(offer.category)}>
                      {offer.category}
                    </Badge>
                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                      Pending
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2">{offer.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{offer.description}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {formatNumber(offer.audience_size)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {offer.delivery_days || 7}d
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xs text-gray-400 line-through">
                        ${offer.rrp_price?.toLocaleString()}
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        ${offer.deal_price?.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => setSelectedOffer(offer)}
                    >
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(offer)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Approved Offers */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Check className="w-5 h-5 text-green-500" />
          Approved Offers ({approvedOffers.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {approvedOffers.slice(0, 6).map(offer => (
            <Card key={offer.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={getCategoryColor(offer.category)}>
                    {offer.category}
                  </Badge>
                  <Badge className="bg-green-100 text-green-700">
                    Approved
                  </Badge>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2">{offer.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{offer.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {formatNumber(offer.audience_size)}
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    ${offer.deal_price?.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selectedOffer} onOpenChange={() => setSelectedOffer(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Offer</DialogTitle>
            <DialogDescription>
              Moderate {selectedOffer?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-start gap-4">
              <Badge className={getCategoryColor(selectedOffer?.category)}>
                {selectedOffer?.category}
              </Badge>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">{selectedOffer?.title}</h3>
                <p className="text-gray-600 text-sm">{selectedOffer?.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Audience</div>
                <div className="text-lg font-bold text-gray-900">
                  {formatNumber(selectedOffer?.audience_size)}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Delivery</div>
                <div className="text-lg font-bold text-gray-900">
                  {selectedOffer?.delivery_days || 7}d
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Price</div>
                <div className="text-lg font-bold text-gray-900">
                  ${selectedOffer?.deal_price?.toLocaleString()}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Rejection Reason (if rejecting)
              </label>
              <Textarea
                placeholder="Explain why this offer is being rejected..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>

            <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
              <strong>AI Moderation:</strong> Use AI to automatically check for fraud, offensive content, and compliance issues.
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setSelectedOffer(null)}
              disabled={moderating}
            >
              Cancel
            </Button>
            <Button 
              variant="outline"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => handleReject(selectedOffer)}
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={() => handleModerate(selectedOffer)}
              disabled={moderating}
            >
              {moderating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  AI Moderate
                </>
              )}
            </Button>
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => handleApprove(selectedOffer)}
            >
              <Check className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}