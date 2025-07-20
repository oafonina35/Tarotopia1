import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "wouter";
import { Menu, Camera, BookOpen, Star } from "lucide-react";

export default function NavigationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = () => {
    console.log("Menu button clicked, current isOpen:", isOpen);
    setIsOpen(!isOpen);
  };

  // Don't render Sheet until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="border-slate-600 bg-slate-700/80 text-slate-100 hover:bg-slate-600 hover:text-white"
        onClick={() => {}}
      >
        <Menu className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="border-slate-600 bg-slate-700/80 text-slate-100 hover:bg-slate-600 hover:text-white"
          onClick={handleClick}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 bg-gradient-to-br from-teal-50 to-rose-50 border-r-teal-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-teal-700">Navigation Menu</h2>
        </div>
        
        <div className="space-y-4">
          <Link href="/" onClick={() => setIsOpen(false)}>
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

          <Link href="/meanings" onClick={() => setIsOpen(false)}>
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

          <Link href="/daily" onClick={() => setIsOpen(false)}>
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
      </SheetContent>
    </Sheet>
  );
}