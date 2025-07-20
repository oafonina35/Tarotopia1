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

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="border-slate-600 bg-slate-700/80 text-slate-100 hover:bg-slate-600 hover:text-white"
        onClick={handleToggle}
      >
        <Menu className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <>
      {/* Menu Button (stays visible when open) */}
      <Button
        variant="outline"
        size="icon"
        className="border-slate-600 bg-slate-700/80 text-slate-100 hover:bg-slate-600 hover:text-white fixed top-4 left-4 z-[1002]"
        onClick={handleToggle}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Full Screen Modal */}
      <div className="fixed inset-0 z-[1001] bg-black/70 backdrop-blur-sm">
        <div className="flex h-full">
          {/* Left Panel */}
          <div className="w-80 bg-gradient-to-br from-teal-50 to-rose-50 border-r-teal-200 shadow-xl animate-in slide-in-from-left duration-300">
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

          {/* Right Side - Click to close */}
          <div className="flex-1" onClick={handleClose} />
        </div>
      </div>
    </>
  );
}