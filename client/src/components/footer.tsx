import { useTranslation } from "@/hooks/use-translation";
import { Landmark, Heart } from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">


        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Built for the Congressional App Challenge.
          </p>
          <p className="text-gray-400 text-base mt-2">
            Made by Rehan Raj
          </p>
        </div>
      </div>
    </footer>
  );
}
