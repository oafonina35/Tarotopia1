import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Menu, Camera, BookOpen, Star, X } from "lucide-react";

export default function NavigationMenuV2() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      <Button
        variant="outline"
        size="icon"
        className="border-slate-600 bg-slate-700/80 text-slate-100 hover:bg-slate-600 hover:text-white relative z-[99998]"
        onClick={toggleMenu}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Overlay and Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-[99999]">
          {/* Full Screen Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-60"
            onClick={closeMenu}
            style={{ backdropFilter: 'blur(2px)' }}
          />
          
          {/* Sliding Menu Panel */}
          <div className="absolute top-0 left-0 h-full w-80 bg-white shadow-2xl">
            <div style={{
              background: 'linear-gradient(135deg, #f0fdfa 0%, #fdf2f8 100%)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              
              {/* Header with Close Button */}
              <div className="flex items-center justify-between p-6 border-b-2 border-teal-200">
                <h2 className="text-xl font-bold text-teal-700">Navigation</h2>
                <button
                  onClick={closeMenu}
                  className="p-2 rounded-full hover:bg-teal-100 text-teal-600 hover:text-teal-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="flex-1 p-6 space-y-4">
                {/* Scanner Link */}
                <Link href="/">
                  <div 
                    onClick={closeMenu}
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-teal-50 cursor-pointer transition-all duration-200 border border-transparent hover:border-teal-200 hover:shadow-md"
                  >
                    <div className="flex-shrink-0">
                      <Camera className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-teal-800 text-lg">Scanner</h3>
                      <p className="text-sm text-teal-600">Scan or upload card images</p>
                    </div>
                  </div>
                </Link>

                {/* Card Meanings Link */}
                <Link href="/meanings">
                  <div 
                    onClick={closeMenu}
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-teal-50 cursor-pointer transition-all duration-200 border border-transparent hover:border-teal-200 hover:shadow-md"
                  >
                    <div className="flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-teal-800 text-lg">Card Meanings</h3>
                      <p className="text-sm text-teal-600">Browse all card descriptions</p>
                    </div>
                  </div>
                </Link>

                {/* Daily Card Link */}
                <Link href="/daily">
                  <div 
                    onClick={closeMenu}
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-teal-50 cursor-pointer transition-all duration-200 border border-transparent hover:border-teal-200 hover:shadow-md"
                  >
                    <div className="flex-shrink-0">
                      <Star className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-teal-800 text-lg">Daily Card</h3>
                      <p className="text-sm text-teal-600">Draw a random card for guidance</p>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Footer */}
              <div className="p-6 text-center border-t border-teal-200">
                <p className="text-xs text-teal-500">Tarotopia Navigation</p>
              </div>
              
            </div>
          </div>
        </div>
      )}
    </>
  );
}