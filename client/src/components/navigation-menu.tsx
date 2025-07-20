import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Menu, Camera, BookOpen, Star, X } from "lucide-react";

export default function NavigationMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    console.log("Menu button clicked, toggling isOpen:", !isOpen);
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="border-slate-600 bg-slate-700/80 text-slate-100 hover:bg-slate-600 hover:text-white relative z-[1001]"
        onClick={handleToggle}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[999]"
          onClick={handleClose}
        />
      )}

      {/* Side Panel */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-gradient-to-br from-teal-50 to-rose-50 border-r-teal-200 shadow-xl z-[1000] transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-teal-200">
          <h2 className="text-xl font-semibold text-teal-700">Navigation Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-teal-600 hover:text-teal-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Menu Items */}
        <div className="p-6 space-y-4">
          <Link href="/" onClick={handleClose}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-teal-200 hover:border-teal-400">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Camera className="h-5 w-5 text-teal-600" />
                  <div>
                    <h3 className="font-semibold text-teal-800">Scanner</h3>
                    <p className="text-sm text-teal-600">Scan or upload card images</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/meanings" onClick={handleClose}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-teal-200 hover:border-teal-400">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-teal-600" />
                  <div>
                    <h3 className="font-semibold text-teal-800">Card Meanings Guide</h3>
                    <p className="text-sm text-teal-600">Browse all card descriptions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/daily" onClick={handleClose}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-teal-200 hover:border-teal-400">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-teal-600" />
                  <div>
                    <h3 className="font-semibold text-teal-800">Daily Card</h3>
                    <p className="text-sm text-teal-600">Draw a random card for guidance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}