import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  ChevronRight,
  FileText,
  Upload,
  Search,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { format } from "date-fns";

export default function Disputes() {
  const [user, setUser] = useState(null);
  const [showNewDispute, setShowNewDispute] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [newDispute, setNewDispute] = useState({
    order_id: "",
    reason: "",
    description: "",
    evidence_urls: []
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {}
    };
    fetchUser();
  }, []);

  const { data: disputes = [], isLoading } = useQuery({
    queryKey: ['disputes', user?.email],
    queryFn: () => base44.entities.Dispute.filter({ raised_by: user?.email }),
    enabled: !!user?.email,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders', user?.email],
    queryFn: () => base44.entities.Order.filter({ buyer_email: user?.email }),
    enabled: !!user?.email,
  });

  const createDisputeMutation = useMutation({
    mutationFn: async (data) => {
      const dispute = await base44.entities.Dispute.create({
        ...data,
        raised_by: user.email,
        status: "open"
      });

      const order = orders.find(o => o.id === data.order_id);
      if (order) {
        await base44.functions.invoke('sendOrderNotification', {
          notification_type: 'dispute_opened',
          order_id: data.order_id,
          recipient_type: 'buyer',
          dispute_reason: data.reason,
          dispute_description: data.description
        });

        await base44.functions.invoke('sendOrderNotification', {
          notification_type: 'dispute_opened',
          order_id: data.order_id,
          recipient_type: 'seller',
          dispute_reason: data.reason,
          dispute_description: data.description
        });
      }

      return dispute;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
      setShowNewDispute(false);
      setNewDispute({ order_id: "", reason: "", description: "", evidence_urls: [] });
    }
  });

  const getStatusConfig = (status) => {
    const configs = {
      open: { 
        color: "bg-amber-900/30 text-amber-400 border-amber-900", 
        icon: Clock,
        label: "Open"
      },
      under_review: { 
        color: "bg-blue-900/30 text-blue-400 border-blue-900", 
        icon: FileText,
        label: "Under Review"
      },
      resolved_buyer: { 
        color: "bg-green-900/30 text-green-400 border-green-900", 
        icon: CheckCircle,
        label: "Resolved (Buyer)"
      },
      resolved_seller: { 
        color: "bg-purple-900/30 text-purple-400 border-purple-900", 
        icon: CheckCircle,
        label: "Resolved (Seller)"
      },
      closed: { 
        color: "bg-gray-800 text-gray-400 border-gray-700", 
        icon: XCircle,
        label: "Closed"
      },
    };
    return configs[status] || configs.open;
  };

  const getReasonLabel = (reason) => {
    const labels = {
      late_delivery: "Late Delivery",
      no_delivery: "No Delivery",
      quality_issue: "Quality Issue",
      wrong_specs: "Wrong Specifications",
      other: "Other"
    };
    return labels[reason] || reason;
  };

  const filteredDisputes = disputes.filter(dispute => {
    const matchesStatus = statusFilter === "all" || dispute.status === statusFilter;
    const matchesSearch = dispute.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          dispute.order_id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setNewDispute(prev => ({
          ...prev,
          evidence_urls: [...prev.evidence_urls, file_url]
        }));
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            Dispute Center
          </h1>
          <p className="text-[#9CA3AF]">
            Manage and track your order disputes
          </p>
        </div>
        <Button 
          onClick={() => setShowNewDispute(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Open New Dispute
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Disputes", value: disputes.length, color: "text-white" },
          { label: "Open", value: disputes.filter(d => d.status === "open").length, color: "text-amber-400" },
          { label: "Under Review", value: disputes.filter(d => d.status === "under_review").length, color: "text-blue-400" },
          { label: "Resolved", value: disputes.filter(d => d.status?.includes("resolved")).length, color: "text-green-400" },
        ].map((stat, index) => (
          <Card key={index} className="bg-[#1F2937] border-[#374151]">
            <CardContent className="p-4">
              <div className="text-sm text-[#9CA3AF] mb-1">{stat.label}</div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[#1F2937] rounded-xl border border-[#374151] p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <Input
              placeholder="Search disputes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#0B1220] border-[#374151] text-white placeholder:text-[#6B7280]"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-48 bg-[#0B1220] border-[#374151] text-white">
              <Filter className="w-4 h-4 mr-2 text-[#9CA3AF]" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#1F2937] border-[#374151] text-white">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="resolved_buyer">Resolved (Buyer)</SelectItem>
              <SelectItem value="resolved_seller">Resolved (Seller)</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Disputes List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[#1F2937] rounded-xl p-6 animate-pulse border border-[#374151]">
              <div className="h-5 w-1/3 bg-[#374151] rounded mb-3" />
              <div className="h-4 w-2/3 bg-[#0B1220] rounded" />
            </div>
          ))}
        </div>
      ) : filteredDisputes.length === 0 ? (
        <Card className="bg-[#1F2937] border-[#374151]">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 bg-[#0B1220] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#374151]">
              <AlertCircle className="w-8 h-8 text-[#9CA3AF]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No disputes found</h3>
            <p className="text-[#9CA3AF] mb-6">
              {disputes.length === 0 
                ? "You haven't opened any disputes yet" 
                : "No disputes match your current filters"}
            </p>
            {disputes.length === 0 && (
              <Button 
                onClick={() => setShowNewDispute(true)}
                variant="outline"
                className="bg-transparent border-[#4B5563] text-white hover:bg-[#374151]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Open Your First Dispute
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredDisputes.map((dispute, index) => {
              const statusConfig = getStatusConfig(dispute.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <motion.div
                  key={dispute.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card 
                    className="hover:shadow-md transition-shadow cursor-pointer bg-[#1F2937] border-[#374151] hover:border-[#4B5563]"
                    onClick={() => setSelectedDispute(dispute)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={`border ${statusConfig.color}`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                            <Badge variant="outline" className="text-[#9CA3AF] border-[#4B5563]">
                              {getReasonLabel(dispute.reason)}
                            </Badge>
                          </div>
                          <p className="text-[#E5E7EB] mb-2 line-clamp-2">
                            {dispute.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-[#9CA3AF]">
                            <span>Order: {dispute.order_id?.slice(0, 8)}...</span>
                            <span>
                              Opened: {format(new Date(dispute.created_date), "MMM d, yyyy")}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#6B7280]" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* New Dispute Modal */}
      <Dialog open={showNewDispute} onOpenChange={setShowNewDispute}>
        <DialogContent className="max-w-lg bg-[#1F2937] border-[#374151] text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Open New Dispute</DialogTitle>
            <DialogDescription className="text-[#9CA3AF]">
              Provide details about the issue you're experiencing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-[#E5E7EB] mb-2 block">
                Select Order
              </label>
              <Select 
                value={newDispute.order_id} 
                onValueChange={(v) => setNewDispute({...newDispute, order_id: v})}
              >
                <SelectTrigger className="bg-[#0B1220] border-[#374151] text-white">
                  <SelectValue placeholder="Choose an order" />
                </SelectTrigger>
                <SelectContent className="bg-[#1F2937] border-[#374151] text-white">
                  {orders.map(order => (
                    <SelectItem key={order.id} value={order.id}>
                      Order #{order.id.slice(0, 8)} - ${order.amount}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#E5E7EB] mb-2 block">
                Reason
              </label>
              <Select 
                value={newDispute.reason} 
                onValueChange={(v) => setNewDispute({...newDispute, reason: v})}
              >
                <SelectTrigger className="bg-[#0B1220] border-[#374151] text-white">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent className="bg-[#1F2937] border-[#374151] text-white">
                  <SelectItem value="late_delivery">Late Delivery</SelectItem>
                  <SelectItem value="no_delivery">No Delivery</SelectItem>
                  <SelectItem value="quality_issue">Quality Issue</SelectItem>
                  <SelectItem value="wrong_specs">Wrong Specifications</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#E5E7EB] mb-2 block">
                Description
              </label>
              <Textarea
                placeholder="Describe the issue in detail..."
                value={newDispute.description}
                onChange={(e) => setNewDispute({...newDispute, description: e.target.value})}
                rows={4}
                className="bg-[#0B1220] border-[#374151] text-white placeholder:text-[#6B7280]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#E5E7EB] mb-2 block">
                Evidence (optional)
              </label>
              <div className="border-2 border-dashed border-[#374151] rounded-xl p-6 text-center bg-[#0B1220]/50 hover:bg-[#0B1220] transition-colors">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="evidence-upload"
                />
                <label 
                  htmlFor="evidence-upload"
                  className="cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2" />
                  <p className="text-sm text-[#9CA3AF]">
                    Click to upload screenshots or documents
                  </p>
                </label>
              </div>
              {newDispute.evidence_urls.length > 0 && (
                <div className="mt-2 text-sm text-green-400">
                  {newDispute.evidence_urls.length} file(s) uploaded
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 bg-transparent border-[#4B5563] text-white hover:bg-[#374151]"
              onClick={() => setShowNewDispute(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => createDisputeMutation.mutate(newDispute)}
              disabled={!newDispute.order_id || !newDispute.reason || !newDispute.description}
            >
              Submit Dispute
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dispute Detail Modal */}
      <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
        <DialogContent className="max-w-lg bg-[#1F2937] border-[#374151] text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white">
              Dispute Details
              {selectedDispute && (
                <Badge className={`border ${getStatusConfig(selectedDispute.status).color}`}>
                  {getStatusConfig(selectedDispute.status).label}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedDispute && (
            <div className="space-y-4 py-4">
              <div className="bg-[#0B1220] rounded-xl p-4 space-y-3 border border-[#374151]">
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">Order ID</span>
                  <span className="font-mono text-sm text-white">{selectedDispute.order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">Reason</span>
                  <span className="text-white">{getReasonLabel(selectedDispute.reason)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">Opened</span>
                  <span className="text-white">{format(new Date(selectedDispute.created_date), "PPp")}</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-[#E5E7EB] mb-2">Description</h4>
                <p className="text-[#9CA3AF] bg-[#0B1220] rounded-xl p-4 border border-[#374151]">
                  {selectedDispute.description}
                </p>
              </div>

              {selectedDispute.evidence_urls?.length > 0 && (
                <div>
                  <h4 className="font-medium text-[#E5E7EB] mb-2">Evidence Files</h4>
                  <div className="space-y-2">
                    {selectedDispute.evidence_urls.map((url, i) => (
                      <a 
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        Evidence File {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedDispute.resolution_notes && (
                <div className="bg-green-900/20 rounded-xl p-4 border border-green-900/30">
                  <h4 className="font-medium text-green-400 mb-2">Resolution</h4>
                  <p className="text-green-300">{selectedDispute.resolution_notes}</p>
                </div>
              )}
            </div>
          )}

          <Button 
            variant="outline" 
            className="w-full bg-transparent border-[#4B5563] text-white hover:bg-[#374151]"
            onClick={() => setSelectedDispute(null)}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}