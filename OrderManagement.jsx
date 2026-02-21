import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ExternalLink, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function OrderManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
  });

  const filteredOrders = orders.filter(o =>
    o.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.buyer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.seller_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-amber-100 text-amber-700",
      in_escrow: "bg-blue-100 text-blue-700",
      delivered: "bg-purple-100 text-purple-700",
      completed: "bg-green-100 text-green-700",
      disputed: "bg-red-100 text-red-700",
      refunded: "bg-gray-100 text-gray-700",
    };
    return colors[status] || colors.pending;
  };

  const statusGroups = {
    active: orders.filter(o => ["pending", "in_escrow", "delivered"].includes(o.status)),
    completed: orders.filter(o => o.status === "completed"),
    disputed: orders.filter(o => o.status === "disputed"),
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by order ID, buyer, or seller..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">{statusGroups.active.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{statusGroups.completed.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Disputed</p>
                <p className="text-2xl font-bold text-gray-900">{statusGroups.disputed.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No orders found
              </div>
            ) : (
              filteredOrders.map(order => (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm text-gray-900">
                        #{order.id.slice(0, 8)}
                      </span>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Buyer:</span> {order.buyer_email}
                      <span className="mx-2">•</span>
                      <span className="font-medium">Seller:</span> {order.seller_email}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      ${order.amount?.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.created_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  <Badge className={getStatusColor(selectedOrder?.status)}>
                    {selectedOrder?.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Amount</label>
                <div className="mt-1 text-2xl font-bold text-gray-900">
                  ${selectedOrder?.amount?.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Buyer</label>
                <p className="mt-1 text-gray-900">{selectedOrder?.buyer_email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Seller</label>
                <p className="mt-1 text-gray-900">{selectedOrder?.seller_email}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Created</label>
              <p className="mt-1 text-gray-900">
                {new Date(selectedOrder?.created_date).toLocaleString()}
              </p>
            </div>

            {selectedOrder?.delivery_deadline && (
              <div>
                <label className="text-sm font-medium text-gray-700">Delivery Deadline</label>
                <p className="mt-1 text-gray-900">
                  {new Date(selectedOrder.delivery_deadline).toLocaleString()}
                </p>
              </div>
            )}

            {selectedOrder?.notes && (
              <div>
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <p className="mt-1 text-gray-600 text-sm">{selectedOrder.notes}</p>
              </div>
            )}

            {selectedOrder?.proof_url && (
              <div>
                <label className="text-sm font-medium text-gray-700">Proof of Delivery</label>
                <a 
                  href={selectedOrder.proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-blue-600 hover:underline flex items-center gap-1"
                >
                  View proof
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setSelectedOrder(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}