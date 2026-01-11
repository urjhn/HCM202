import { FaHome, FaShip, FaBook } from 'react-icons/fa';
import { BsSunFill } from 'react-icons/bs';
import logo from '../assets/logo.png';
import { trackVisit } from '../utils/tracking';
import { useEffect, useState } from 'react';
import Count from './Count';
import { AnimatePresence } from 'framer-motion';

const Navbar = () => {


  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.location.hash = id;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const [visitCount, setVisitCount] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    // Track visit on mount
    const updateCount = async () => {
      // Use trackVisit to increment, or getVisits to just read (to avoid double count on re-renders in dev)
      // For simplified demo, we'll increment strictly once per session storage check or just loose mount
      const count = await trackVisit();
      if (count) setVisitCount(count);
    };
    updateCount();
  }, []);

  return (
    <nav className="w-full bg-white border-b-2 border-[#D63426] sticky top-0 z-50"
      style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-2 -ml-2">
            <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
            <h1 className="text-lg font-bold"
              style={{
                fontFamily: 'Arial, sans-serif',
                color: '#D63426',
                letterSpacing: '0.08em'
              }}>
              CON ĐƯỜNG SÁNG
            </h1>
          </div>

          {/* Menu Items */}
          <div className="flex items-center gap-6">
            {/* Stage 1 */}
            <button
              onClick={() => scrollToId('stage-1')}
              className="group cursor-pointer text-left"
            >
              <div className="flex items-center gap-2 transition-all duration-300">
                <FaHome className="text-xl text-[#D63426] group-hover:scale-110 transition-transform" />
                <div className="hidden lg:block text-sm">
                  <p className="font-bold text-[#D63426] uppercase">Giai đoạn 1</p>
                  <p className="text-xs text-gray-600 italic">Yêu nước (Trước 1911)</p>
                </div>
              </div>
            </button>

            {/* Stage 2 */}
            <button
              onClick={() => scrollToId('stage-2')}
              className="group cursor-pointer text-left"
            >
              <div className="flex items-center gap-2 transition-all duration-300">
                <FaShip className="text-xl text-[#D63426] group-hover:scale-110 transition-transform" />
                <div className="hidden lg:block text-sm">
                  <p className="font-bold text-[#D63426] uppercase">Giai đoạn 2</p>
                  <p className="text-xs text-gray-600 italic">Tìm đường (1911-20)</p>
                </div>
              </div>
            </button>

            {/* Stage 3 */}
            <button
              onClick={() => scrollToId('stage-3')}
              className="group cursor-pointer text-left"
            >
              <div className="flex items-center gap-2 transition-all duration-300">
                <BsSunFill className="text-xl text-[#D63426] group-hover:scale-110 transition-transform" />
                <div className="hidden lg:block text-sm">
                  <p className="font-bold text-[#D63426] uppercase">Giai đoạn 3</p>
                  <p className="text-xs text-gray-600 italic">Hình thành (1920-30)</p>
                </div>
              </div>
            </button>

            {/* Stage 4 */}
            <button
              onClick={() => scrollToId('stage-4')}
              className="group cursor-pointer text-left"
            >
              <div className="flex items-center gap-2 transition-all duration-300">
                <FaBook className="text-xl text-[#D63426] group-hover:scale-110 transition-transform" />
                <div className="hidden lg:block text-sm">
                  <p className="font-bold text-[#D63426] uppercase">Giai đoạn 4</p>
                  <p className="text-xs text-gray-600 italic">Thử thách (1930-41)</p>
                </div>
              </div>
            </button>

            {/* Stage 5 */}
            <button
              onClick={() => scrollToId('stage-5')}
              className="group cursor-pointer text-left"
            >
              <div className="flex items-center gap-2 transition-all duration-300">
                <FaBook className="text-xl text-[#D63426] group-hover:scale-110 transition-transform" />
                <div className="hidden lg:block text-sm">
                  <p className="font-bold text-[#D63426] uppercase">Giai đoạn 5</p>
                  <p className="text-xs text-gray-600 italic">Phát triển (1941-69)</p>
                </div>
              </div>
            </button>

            {/* Visit Counter Badge */}
            <button
              onClick={() => setShowDashboard(true)}
              className="hidden xl:flex items-center gap-2 ml-4 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200 shadow-sm hover:bg-gray-200 hover:scale-105 transition-all cursor-pointer"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <div className="text-xs text-left">
                <p className="text-gray-500 font-medium">Lượt truy cập</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Modal */}
      <AnimatePresence>
        {showDashboard && <Count onClose={() => setShowDashboard(false)} />}
      </AnimatePresence>

      <style>{`
        .fill-animation::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 0;
          height: 100%;
          background-color: #B52A1E;
          transition: width 0.5s ease;
          z-index: 0;
        }

        .fill-animation:hover::before {
          width: 100%;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
