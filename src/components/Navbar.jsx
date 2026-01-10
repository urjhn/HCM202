import { FaHome, FaShip, FaBook } from 'react-icons/fa';
import { BsSunFill } from 'react-icons/bs';
import logo from '../assets/logo.png';

const Navbar = () => {
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.location.hash = id;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
          <div className="flex items-center gap-8">
            {/* Chapter I */}
            <a href="#coi-nguon" className="group cursor-pointer">
              <div className="flex items-center gap-2 transition-all duration-300">
                <FaHome className="text-2xl text-[#D63426] group-hover:scale-110 transition-transform" />
                <div className="text-sm">
                  <p className="font-bold text-[#D63426]" style={{ fontFamily: 'Arial, sans-serif' }}>CHƯƠNG I</p>
                  <p className="text-xs text-gray-600 italic" style={{ fontFamily: 'Arial, sans-serif' }}>
                    Cội Nguồn
                  </p>
                </div>
              </div>
            </a>

            {/* Chapter II */}
            <a
              href="#chuong-2"
              onClick={(e) => {
                e.preventDefault();
                scrollToId('chuong-2');
              }}
              className="group cursor-pointer"
            >
              <div className="flex items-center gap-2 transition-all duration-300">
                <FaShip className="text-2xl text-[#D63426] group-hover:scale-110 transition-transform" />
                <div className="text-sm">
                  <p className="font-bold text-[#D63426]" style={{ fontFamily: 'Arial, sans-serif' }}>CHƯƠNG II</p>
                  <p className="text-xs text-gray-600 italic" style={{ fontFamily: 'Arial, sans-serif' }}>
                    Dấu Chân
                  </p>
                </div>
              </div>
            </a>

            {/* Chapter III */}
            <div className="group cursor-pointer">
              <div className="flex items-center gap-2 transition-all duration-300">
                <BsSunFill className="text-2xl text-[#D63426] group-hover:scale-110 transition-transform" />
                <div className="text-sm">
                  <p className="font-bold text-[#D63426]" style={{ fontFamily: 'Arial, sans-serif' }}>CHƯƠNG III</p>
                  <p className="text-xs text-gray-600 italic" style={{ fontFamily: 'Arial, sans-serif' }}>
                    Thức Tỉnh
                  </p>
                </div>
              </div>
            </div>

            {/* Chapter IV */}
            <div className="group cursor-pointer">
              <div className="flex items-center gap-2 transition-all duration-300">
                <FaBook className="text-2xl text-[#D63426] group-hover:scale-110 transition-transform" />
                <div className="text-sm">
                  <p className="font-bold text-[#D63426]" style={{ fontFamily: 'Arial, sans-serif' }}>CHƯƠNG IV</p>
                  <p className="text-xs text-gray-600 italic" style={{ fontFamily: 'Arial, sans-serif' }}>
                    Di Sản
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => scrollToId('coi-nguon')}
              className="px-6 py-2.5 bg-[#F5DEDE] text-[#D63426] font-bold rounded-sm relative overflow-hidden border-[3px] border-dashed border-[#D63426] transition-colors duration-300 hover:text-white fill-animation"
              style={{
                fontFamily: 'Arial, sans-serif',
                letterSpacing: '0.05em'
              }}>
              <span className="relative z-10">BẮT ĐẦU HÀNH TRÌNH</span>
            </button>
          </div>
        </div>
      </div>

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
