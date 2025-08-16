import { useState, useEffect } from "react";
import { useSimpleTranslation } from "@/hooks/use-simple-translation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Map, MapPin, Info, Search, Filter, Phone, Globe, ExternalLink, ZoomIn, ZoomOut } from "lucide-react";

interface CongressionalDistrict {
  id: string;
  state: string;
  district: string;
  representative: string;
  party: string;
  population: number;
  area: number;
  coordinates: number[][];
  bioguideId?: string;
  websiteUrl?: string;
  phone?: string;
}

export default function CongressionalDistrictsMap() {
  const { t } = useSimpleTranslation();
  const [selectedDistrict, setSelectedDistrict] = useState<CongressionalDistrict | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [districts, setDistricts] = useState<CongressionalDistrict[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [partyFilter, setPartyFilter] = useState<string | null>(null);
  const [filteredDistricts, setFilteredDistricts] = useState<CongressionalDistrict[]>([]);

  useEffect(() => {
    // Load congressional districts data
    fetch('/api/congressional-districts')
      .then(response => response.json())
      .then(data => {
        setDistricts(data.districts || []);
        setFilteredDistricts(data.districts || []);
        setMapLoaded(true);
      })
      .catch(error => {
        console.error('Error loading districts:', error);
        setMapLoaded(true);
      });
  }, []);

  // Filter districts based on search and party
  useEffect(() => {
    let filtered = districts;
    
    if (searchTerm) {
      filtered = filtered.filter(district => 
        district.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        district.representative.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (partyFilter) {
      filtered = filtered.filter(district => district.party === partyFilter);
    }
    
    setFilteredDistricts(filtered);
  }, [districts, searchTerm, partyFilter]);

  const handleDistrictClick = (district: CongressionalDistrict) => {
    setSelectedDistrict(district);
  };

  const getPartyColor = (party: string) => {
    switch (party.toLowerCase()) {
      case 'republican':
        return '#ef4444'; // red-500
      case 'democrat':
        return '#3b82f6'; // blue-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  const formatPopulation = (population: number) => {
    return new Intl.NumberFormat().format(population);
  };

  return (
    <section id="congressional-map" className="mb-12">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Map className="text-primary-foreground w-5 h-5" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {t("Congressional Districts")}
            </h2>
            <p className="text-muted-foreground">
              {t("Explore interactive map of US congressional districts and representatives")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>{t("Interactive Map")}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {/* TODO: Implement zoom functionality */}}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {/* TODO: Implement zoom functionality */}}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-[500px] overflow-hidden">
              {!mapLoaded ? (
                <div className="h-full flex items-center justify-center">
                  <div className="space-y-4 text-center">
                    <Skeleton className="w-32 h-32 mx-auto rounded-lg" />
                    <p className="text-muted-foreground">{t("Loading map data...")}</p>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
                  {/* Search and Filter Controls */}
                  <div className="absolute top-4 left-4 right-4 z-10 flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder={t("Search district or representative...")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/90 backdrop-blur-sm"
                      />
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant={partyFilter === null ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPartyFilter(null)}
                        className="bg-white/90 backdrop-blur-sm"
                      >
                        All
                      </Button>
                      <Button
                        variant={partyFilter === "Republican" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPartyFilter(partyFilter === "Republican" ? null : "Republican")}
                        className="bg-white/90 backdrop-blur-sm"
                        style={partyFilter === "Republican" ? { backgroundColor: getPartyColor("Republican"), color: "white" } : {}}
                      >
                        R
                      </Button>
                      <Button
                        variant={partyFilter === "Democrat" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPartyFilter(partyFilter === "Democrat" ? null : "Democrat")}
                        className="bg-white/90 backdrop-blur-sm"
                        style={partyFilter === "Democrat" ? { backgroundColor: getPartyColor("Democrat"), color: "white" } : {}}
                      >
                        D
                      </Button>
                    </div>
                  </div>

                  {/* District Grid */}
                  {districts.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2 p-4 pt-20 h-full overflow-y-auto">
                      {filteredDistricts.slice(0, 20).map((district, index) => (
                        <div
                          key={district.id}
                          className="relative bg-white dark:bg-slate-700 rounded-lg border-2 border-gray-200 dark:border-slate-600 cursor-pointer hover:shadow-lg transition-all duration-200 p-3 flex flex-col justify-center items-center group"
                          style={{ 
                            borderColor: getPartyColor(district.party),
                            backgroundColor: selectedDistrict?.id === district.id ? `${getPartyColor(district.party)}20` : `${getPartyColor(district.party)}10`
                          }}
                          onClick={() => handleDistrictClick(district)}
                        >
                          <div className="text-center">
                            <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                              TX-{district.district}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 truncate w-full">
                              {district.representative.split(',')[0].split(' ').slice(-1)[0]}
                            </div>
                            <div 
                              className="w-3 h-3 rounded-full mx-auto mt-2 group-hover:scale-125 transition-transform"
                              style={{ backgroundColor: getPartyColor(district.party) }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-muted-foreground">
                        <p>{t("Loading district data...")}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* District Info Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="w-5 h-5" />
                <span>{t("District Information")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDistrict ? (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center pb-4 border-b">
                    <h4 className="font-bold text-xl text-slate-800 dark:text-slate-200">
                      Texas District {selectedDistrict.district}
                    </h4>
                    <p className="text-muted-foreground text-sm mt-1">
                      {t("Congressional District")}
                    </p>
                  </div>
                  
                  {/* Representative Info */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-lg p-4">
                      <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        {t("Representative")}
                      </label>
                      <p className="font-bold text-lg mt-1">{selectedDistrict.representative}</p>
                      
                      <div className="mt-2">
                        <Badge 
                          variant="secondary"
                          style={{ 
                            backgroundColor: getPartyColor(selectedDistrict.party),
                            color: "white",
                            fontSize: "12px",
                            fontWeight: "600"
                          }}
                        >
                          {selectedDistrict.party}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Contact Information */}
                    {(selectedDistrict.phone || selectedDistrict.websiteUrl) && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                          {t("Contact")}
                        </label>
                        <div className="flex flex-col gap-2">
                          {selectedDistrict.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-blue-600" />
                              <span>{selectedDistrict.phone}</span>
                            </div>
                          )}
                          {selectedDistrict.websiteUrl && (
                            <div className="flex items-center gap-2 text-sm">
                              <Globe className="w-4 h-4 text-blue-600" />
                              <a 
                                href={selectedDistrict.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {t("Official Website")}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* District Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                        <label className="text-xs font-medium text-muted-foreground uppercase">
                          {t("Population")}
                        </label>
                        <p className="font-bold text-lg mt-1">{formatPopulation(selectedDistrict.population)}</p>
                      </div>
                      
                      <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                        <label className="text-xs font-medium text-muted-foreground uppercase">
                          {t("Area")} (sq mi)
                        </label>
                        <p className="font-bold text-lg mt-1">{formatPopulation(selectedDistrict.area)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-2 pt-4 border-t">
                    {selectedDistrict.websiteUrl && (
                      <Button 
                        className="w-full" 
                        onClick={() => window.open(selectedDistrict.websiteUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {t("Visit Official Website")}
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open(`https://www.congress.gov/search?q=%7B%22source%22%3A%5B%22legislation%22%5D%2C%22congress%22%3A%5B%22119%22%5D%2C%22bill-sponsor%22%3A%5B%22${selectedDistrict.bioguideId || ''}%22%5D%7D`, '_blank')}
                    >
                      {t("View Sponsored Bills")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t("Click on a district to view details")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t("Legend")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: getPartyColor('Republican') }}
                />
                <span className="text-sm">{t("Republican")}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: getPartyColor('Democrat') }}
                />
                <span className="text-sm">{t("Democrat")}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: getPartyColor('Independent') }}
                />
                <span className="text-sm">{t("Independent")}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}