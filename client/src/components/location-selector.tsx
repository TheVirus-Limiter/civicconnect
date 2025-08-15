import { useState } from "react";
import { useLocation } from "@/hooks/use-location";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Settings } from "lucide-react";

const TEXAS_DISTRICTS = [
  { value: "TX-01", label: "TX-01 - East Texas" },
  { value: "TX-02", label: "TX-02 - Southeast Texas" },
  { value: "TX-03", label: "TX-03 - North Dallas" },
  { value: "TX-04", label: "TX-04 - Northeast Texas" },
  { value: "TX-05", label: "TX-05 - East Dallas" },
  { value: "TX-06", label: "TX-06 - Arlington/Mansfield" },
  { value: "TX-07", label: "TX-07 - West Houston" },
  { value: "TX-08", label: "TX-08 - North Houston" },
  { value: "TX-09", label: "TX-09 - Southeast Houston" },
  { value: "TX-10", label: "TX-10 - Austin/Tomball" },
  { value: "TX-11", label: "TX-11 - West Texas" },
  { value: "TX-12", label: "TX-12 - Fort Worth" },
  { value: "TX-13", label: "TX-13 - Panhandle" },
  { value: "TX-14", label: "TX-14 - Southeast Coast" },
  { value: "TX-15", label: "TX-15 - South Texas" },
  { value: "TX-16", label: "TX-16 - El Paso" },
  { value: "TX-17", label: "TX-17 - Central Texas" },
  { value: "TX-18", label: "TX-18 - Inner Houston" },
  { value: "TX-19", label: "TX-19 - Lubbock" },
  { value: "TX-20", label: "TX-20 - San Antonio West" },
  { value: "TX-21", label: "TX-21 - Austin/San Antonio" },
  { value: "TX-22", label: "TX-22 - Southwest Houston" },
  { value: "TX-23", label: "TX-23 - San Antonio/Border" },
  { value: "TX-24", label: "TX-24 - North Dallas" },
  { value: "TX-25", label: "TX-25 - Austin/Fort Hood" },
  { value: "TX-26", label: "TX-26 - North Texas" },
  { value: "TX-27", label: "TX-27 - Corpus Christi" },
  { value: "TX-28", label: "TX-28 - South Texas" },
  { value: "TX-29", label: "TX-29 - North Houston" },
  { value: "TX-30", label: "TX-30 - South Dallas" },
  { value: "TX-31", label: "TX-31 - Central Texas" },
  { value: "TX-32", label: "TX-32 - North Dallas" },
  { value: "TX-33", label: "TX-33 - Dallas/Fort Worth" },
  { value: "TX-34", label: "TX-34 - South Texas" },
  { value: "TX-35", label: "TX-35 - Austin/San Antonio" },
  { value: "TX-36", label: "TX-36 - Southeast Texas" },
  { value: "TX-37", label: "TX-37 - Central Texas" },
  { value: "TX-38", label: "TX-38 - North Texas" },
];

export default function LocationSelector() {
  const { location, updateLocation } = useLocation();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState({
    city: location.city || "",
    state: location.state || "",
    district: location.district || "",
  });

  const handleSave = () => {
    updateLocation(tempLocation);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MapPin className="w-4 h-4" />
          {location.city && location.state ? (
            `${location.city}, ${location.state}`
          ) : (
            "Set Location"
          )}
          <Settings className="w-3 h-3" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Your Location</DialogTitle>
          <DialogDescription>
            Set your location to get relevant bills and representatives for your area.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={tempLocation.city}
              onChange={(e) => setTempLocation(prev => ({ ...prev, city: e.target.value }))}
              placeholder="Enter your city"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={tempLocation.state}
              onChange={(e) => setTempLocation(prev => ({ ...prev, state: e.target.value }))}
              placeholder="Enter your state"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="district">Congressional District</Label>
            <Select
              value={tempLocation.district}
              onValueChange={(value) => setTempLocation(prev => ({ ...prev, district: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your district" />
              </SelectTrigger>
              <SelectContent>
                {TEXAS_DISTRICTS.map((district) => (
                  <SelectItem key={district.value} value={district.value}>
                    {district.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Location
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}