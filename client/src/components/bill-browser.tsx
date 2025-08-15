import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Timeline } from "@/components/ui/timeline";
import { Filter, Search, Bookmark, Share2, ExternalLink, Eye, Calendar, User, Bot } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Bill } from "@shared/schema";

export default function BillBrowser() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    query: "",
    status: "",
    jurisdiction: "",
    categories: [] as string[],
  });
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);

  const { data: billsData, isLoading, error } = useQuery({
    queryKey: ["/api/bills", filters, limit, offset],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });
      
      if (filters.query) params.append("query", filters.query);
      if (filters.status) params.append("status", filters.status);
      if (filters.jurisdiction) params.append("jurisdiction", filters.jurisdiction);
      
      const response = await fetch(`/api/bills?${params}`);
      if (!response.ok) throw new Error("Failed to fetch bills");
      return response.json();
    },
  });

  const bills = billsData?.bills || [];
  const total = billsData?.total || 0;

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setOffset(0); // Reset to first page when filters change
  };

  const loadMore = () => {
    setOffset(prev => prev + limit);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "signed":
      case "passed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "active":
      case "in_committee":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "failed":
      case "vetoed":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "signed":
      case "passed":
        return "✓";
      case "active":
      case "in_committee":
        return "⏳";
      case "failed":
      case "vetoed":
        return "✗";
      default:
        return "📋";
    }
  };

  if (error) {
    return (
      <section id="bills" className="mb-12">
        <div className="text-center py-8">
          <p className="text-destructive">Error: {(error as Error).message}</p>
          <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section id="bills" className="mb-12">
      <div className="flex flex-col lg:flex-row lg:space-x-8">
        {/* Filters Sidebar */}
        <div className="lg:w-1/4 mb-6 lg:mb-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-primary" />
                <span>Filter Bills</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search */}
              <div>
                <Label className="text-sm font-medium">Search</Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search bills..."
                    value={filters.query}
                    onChange={(e) => handleFilterChange("query", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Status</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="status-active"
                      checked={filters.status === "active"}
                      onCheckedChange={(checked) => 
                        handleFilterChange("status", checked ? "active" : "")
                      }
                    />
                    <Label htmlFor="status-active" className="text-sm flex items-center justify-between w-full">
                      <span>Active</span>
                      <Badge variant="secondary" className="text-xs">234</Badge>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="status-passed"
                      checked={filters.status === "passed"}
                      onCheckedChange={(checked) => 
                        handleFilterChange("status", checked ? "passed" : "")
                      }
                    />
                    <Label htmlFor="status-passed" className="text-sm flex items-center justify-between w-full">
                      <span>Passed</span>
                      <Badge variant="secondary" className="text-xs">67</Badge>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="status-failed"
                      checked={filters.status === "failed"}
                      onCheckedChange={(checked) => 
                        handleFilterChange("status", checked ? "failed" : "")
                      }
                    />
                    <Label htmlFor="status-failed" className="text-sm flex items-center justify-between w-full">
                      <span>Failed</span>
                      <Badge variant="secondary" className="text-xs">23</Badge>
                    </Label>
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="environment">Environment</SelectItem>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="immigration">Immigration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Jurisdiction Filter */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Jurisdiction</Label>
                <RadioGroup
                  value={filters.jurisdiction}
                  onValueChange={(value) => handleFilterChange("jurisdiction", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="" id="jurisdiction-all" />
                    <Label htmlFor="jurisdiction-all" className="text-sm">All Levels</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="federal" id="jurisdiction-federal" />
                    <Label htmlFor="jurisdiction-federal" className="text-sm">Federal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="state" id="jurisdiction-state" />
                    <Label htmlFor="jurisdiction-state" className="text-sm">State</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="local" id="jurisdiction-local" />
                    <Label htmlFor="jurisdiction-local" className="text-sm">Local</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setFilters({ query: "", status: "", jurisdiction: "", categories: [] });
                  setOffset(0);
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bills List */}
        <div className="lg:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">Recent Bills</h3>
            <div className="flex items-center space-x-4">
              <Select defaultValue="recent">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="relevant">Most Relevant</SelectItem>
                  <SelectItem value="active">Most Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-20 w-full mb-4" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {bills.map((bill: Bill) => (
                <BillCard key={bill.id} bill={bill} />
              ))}
              
              {bills.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No bills found matching your criteria.</p>
                </div>
              )}

              {bills.length > 0 && bills.length < total && (
                <div className="text-center mt-8">
                  <Button onClick={loadMore} variant="outline">
                    Load More Bills
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function BillCard({ bill }: { bill: Bill }) {
  const { t } = useTranslation();

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "signed":
      case "passed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "active":
      case "in_committee":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "failed":
      case "vetoed":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <Badge className={getStatusColor(bill.status)}>
                {bill.status.replace("_", " ").toUpperCase()}
              </Badge>
              <span className="text-sm text-muted-foreground">{bill.id}</span>
              <span className="text-sm text-muted-foreground capitalize">{bill.jurisdiction}</span>
            </div>
            
            <h4 className="text-lg font-semibold mb-2">{bill.title}</h4>
            
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {bill.summary}
            </p>
            
            {/* Impact Tags */}
            {bill.impactTags && bill.impactTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {bill.impactTags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Bill Timeline */}
            {bill.progress && (
              <Timeline 
                progress={bill.progress}
                className="mb-4"
              />
            )}

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              {bill.sponsor && (
                <span className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {bill.sponsor}
                </span>
              )}
              {bill.lastActionDate && (
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Updated {formatDate(bill.lastActionDate)}
                </span>
              )}

            </div>
          </div>
          
          <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 mt-4 lg:mt-0 lg:ml-6">
            <Button variant="ghost" size="sm">
              <Bot className="w-4 h-4 mr-1" />
              Ask AI
            </Button>
            <Button variant="outline" size="sm">
              <Bookmark className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
            <Button size="sm">
              <ExternalLink className="w-4 h-4 mr-1" />
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
