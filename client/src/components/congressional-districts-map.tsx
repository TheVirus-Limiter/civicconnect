import { useState, useEffect } from "react";
import { useSimpleTranslation } from "@/hooks/use-simple-translation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Map, MapPin, Info, ZoomIn, ZoomOut } from "lucide-react";

interface CongressionalDistrict {
  id: string;
  state: string;
  district: string;
  representative: string;
  party: string;
  population: number;
  area: number;
  coordinates: number[][];
}

export default function CongressionalDistrictsMap() {
  const { t } = useSimpleTranslation();
  const [selectedDistrict, setSelectedDistrict] = useState<CongressionalDistrict | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [districts, setDistricts] = useState<CongressionalDistrict[]>([]);

  useEffect(() => {
    // Load congressional districts data
    fetch('/api/congressional-districts')
      .then(response => response.json())
      .then(data => {
        setDistricts(data.districts || []);
        setMapLoaded(true);
      })
      .catch(error => {
        console.error('Error loading districts:', error);
        setMapLoaded(true);
      });
  }, []);

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
                    onClick={() => setZoom(Math.min(zoom * 1.2, 3))}
                    disabled={zoom >= 3}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.max(zoom / 1.2, 0.5))}
                    disabled={zoom <= 0.5}
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
                <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900">
                  {/* Simplified US Map with Districts */}
                  <svg
                    viewBox="0 0 1000 600"
                    className="w-full h-full"
                    style={{ transform: `scale(${zoom})` }}
                  >
                    {/* Texas highlighted */}
                    <g>
                      {/* Texas outline */}
                      <path
                        d="M200 300 L350 290 L380 350 L350 420 L200 400 Z"
                        fill="#f3f4f6"
                        stroke="#d1d5db"
                        strokeWidth="2"
                        className="cursor-pointer hover:fill-blue-100 transition-colors"
                      />
                      
                      {/* TX-23 District */}
                      <path
                        d="M200 350 L280 345 L290 390 L220 395 Z"
                        fill={getPartyColor('Republican')}
                        fillOpacity="0.7"
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleDistrictClick({
                          id: 'tx-23',
                          state: 'Texas',
                          district: '23',
                          representative: 'Tony Gonzales',
                          party: 'Republican',
                          population: 766987,
                          area: 58000,
                          coordinates: []
                        })}
                      />
                      
                      {/* Other sample districts */}
                      <path
                        d="M280 300 L350 295 L340 340 L275 345 Z"
                        fill={getPartyColor('Democrat')}
                        fillOpacity="0.7"
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleDistrictClick({
                          id: 'tx-20',
                          state: 'Texas',
                          district: '20',
                          representative: 'Joaquin Castro',
                          party: 'Democrat',
                          population: 798012,
                          area: 1200,
                          coordinates: []
                        })}
                      />
                    </g>
                    
                    {/* Map Labels */}
                    <text x="275" y="325" textAnchor="middle" className="text-xs font-semibold fill-slate-700">
                      TX-23
                    </text>
                    <text x="315" y="318" textAnchor="middle" className="text-xs font-semibold fill-slate-700">
                      TX-20
                    </text>
                    <text x="275" y="450" textAnchor="middle" className="text-sm font-bold fill-slate-600">
                      Texas
                    </text>
                  </svg>
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
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg">
                      {selectedDistrict.state} {selectedDistrict.district}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {t("Congressional District")}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        {t("Representative")}
                      </label>
                      <p className="font-medium">{selectedDistrict.representative}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        {t("Party")}
                      </label>
                      <div className="mt-1">
                        <Badge 
                          variant="secondary"
                          style={{ 
                            backgroundColor: `${getPartyColor(selectedDistrict.party)}20`,
                            color: getPartyColor(selectedDistrict.party),
                            border: `1px solid ${getPartyColor(selectedDistrict.party)}40`
                          }}
                        >
                          {selectedDistrict.party}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        {t("Population")}
                      </label>
                      <p className="font-medium">{formatPopulation(selectedDistrict.population)}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        {t("Area")} (sq mi)
                      </label>
                      <p className="font-medium">{formatPopulation(selectedDistrict.area)}</p>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4">
                    {t("View Representative Details")}
                  </Button>
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