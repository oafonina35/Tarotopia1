import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Menu, Camera, BookOpen, Star, X } from "lucide-react";

export default function NavigationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="border-slate-600 bg-slate-700/80 text-slate-100 hover:bg-slate-600 hover:text-white"
        onClick={handleToggle}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50"
          style={{ 
            backdropFilter: 'blur(4px)',
            zIndex: 9998
          }}
        />
      )}

      {/* Sliding Menu */}
      <div
        ref={menuRef}
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(135deg, #f0fdfa 0%, #fdf2f8 100%)',
          borderRight: '2px solid #5eead4',
          zIndex: 9999
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-teal-200">
          <h2 className="text-xl font-bold text-teal-700">Navigation</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-teal-600 hover:text-teal-800 hover:bg-teal-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Menu Items */}
        <div className="p-6 space-y-4">
          <Link href="/" onClick={handleLinkClick}>
            <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-teal-50 cursor-pointer transition-all duration-200 border border-transparent hover:border-teal-200 hover:shadow-md">
              <div className="flex-shrink-0">
                <Camera className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-teal-800 text-lg">Scanner</h3>
                <p className="text-sm text-teal-600">Scan or upload card images</p>
              </div>
            </div>
          </Link>

          <Link href="/meanings" onClick={handleLinkClick}>
            <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-teal-50 cursor-pointer transition-all duration-200 border border-transparent hover:border-teal-200 hover:shadow-md">
              <div className="flex-shrink-0">
                <BookOpen className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-teal-800 text-lg">Card Meanings</h3>
                <p className="text-sm text-teal-600">Browse all card descriptions</p>
              </div>
            </div>
          </Link>

          <Link href="/daily" onClick={handleLinkClick}>
            <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-teal-50 cursor-pointer transition-all duration-200 border border-transparent hover:border-teal-200 hover:shadow-md">
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
        <div className="absolute bottom-6 left-6 right-6 text-center">
          <p className="text-xs text-teal-500">Tarotopia Navigation</p>
        </div>
      </div>
    </>
  );
}