import React from "react";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const NotFoundScreen: React.FC<{ onHome?: () => void }> = ({ onHome }) => {
  const handleHome = () => {
    if (onHome) {
      onHome();
    } else if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-6 text-[#2D2926]" dir="rtl">
      <div className="max-w-md text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#F7F2EE] text-[#D4AF37] flex items-center justify-center">
          <Compass size={28} />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-serif italic">העמוד לא נמצא</h1>
          <p className="text-sm text-[#8C7E6E] leading-relaxed">
            הקישור שביקרת בו אינו קיים או הוסר. ניתן לחזור לעמוד הראשי כדי להמשיך.
          </p>
        </div>
        <Button onClick={handleHome} className="h-12 rounded-2xl bg-[#2D2926] text-white font-bold px-8">
          חזרה לעמוד הראשי
        </Button>
      </div>
    </div>
  );
};
