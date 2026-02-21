import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Check, X, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function PublisherManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPublisher, setSelectedPublisher] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const queryClient = useQueryClient();

  const { data: publishers = [], isLoading } = useQuery({
    queryKey: ['admin-publishers'],
    queryFn: () => base44.entities.Publisher.list(),
  });

  const updatePublisher = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Publisher.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-publishers']);
      setSelectedPublisher(null);
    },
  });

  const handleVerify = async (publisher) => {
    setVerifying(true);
    try {
      const response = await base44.functions.invoke('verifyPublisher', {
        publisherId: publisher.id,
        website: publisher.website,
        description: publisher.description
      });

      if (response.data.verified) {
        toast.success(`${publisher.company_name} verified successfully`);
      } else {
        toast.error(`Verification failed: ${response.data.recommendation}`);
      }
      
      queryClient.invalidateQueries(['admin-publishers']);
      setSelectedPublisher(null);
    } catch (error) {
      toast.error("Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleReject = async (publisher) => {
    await updatePublisher.mutateAsync({
      id: publisher.id,
      data: { verified: false, verification_notes: "Rejected by admin" }
    });
    toast.success("Publisher rejected");
  };

  const filteredPublishers = publishers.filter(p =>
    p.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingPublishers = filteredPublishers.filter(p => !p.verified);
  const verifiedPublishers = filteredPublishers.filter(p => p.verified);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search publishers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Pending Publishers */}
      {pendingPublishers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Pending Verification ({pendingPublishers.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingPublishers.map(publisher => (
              <Card key={publisher.id} className="border-amber-200 bg-amber-50/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{publisher.company_name}</h3>
                      <p className="text-sm text-gray-500">{publisher.user_email}</p>
                    </div>
                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                      Pending
                    </Badge>
                  </div>

                  {publisher.website && (
                    <a 
                      href={publisher.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-4"
                    >
                      {publisher.website}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => setSelectedPublisher(publisher)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Verify
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleReject(publisher)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Verified Publishers */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Check className="w-5 h-5 text-green-500" />
          Verified Publishers ({verifiedPublishers.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {verifiedPublishers.map(publisher => (
            <Card key={publisher.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{publisher.company_name}</h3>
                    <p className="text-sm text-gray-500">{publisher.user_email}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    Verified
                  </Badge>
                </div>

                {publisher.website && (
                  <a 
                    href={publisher.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-3"
                  >
                    {publisher.website}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                <div className="flex gap-4 text-sm text-gray-500">
                  <div>
                    <span className="font-medium text-gray-900">{publisher.total_deals || 0}</span> deals
                  </div>
                  {publisher.rating && (
                    <div>
                      <span className="font-medium text-gray-900">{publisher.rating.toFixed(1)}</span> rating
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Verification Dialog */}
      <Dialog open={!!selectedPublisher} onOpenChange={() => setSelectedPublisher(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Publisher</DialogTitle>
            <DialogDescription>
              Review and verify {selectedPublisher?.company_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Company Name</label>
              <p className="text-gray-900">{selectedPublisher?.company_name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900">{selectedPublisher?.user_email}</p>
            </div>

            {selectedPublisher?.website && (
              <div>
                <label className="text-sm font-medium text-gray-700">Website</label>
                <a 
                  href={selectedPublisher.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  {selectedPublisher.website}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {selectedPublisher?.description && (
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-600 text-sm">{selectedPublisher.description}</p>
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
              <strong>AI Verification:</strong> The system will automatically check the website legitimacy and publisher credibility before approval.
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setSelectedPublisher(null)}
              disabled={verifying}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => handleVerify(selectedPublisher)}
              disabled={verifying}
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Verify Publisher
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}