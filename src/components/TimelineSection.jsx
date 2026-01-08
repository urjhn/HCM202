import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHome, FaBook, FaGraduationCap, FaShip, FaMapMarkerAlt } from 'react-icons/fa';
import { BiSolidQuoteAltLeft } from 'react-icons/bi';

const TimelineSection = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { id: 0, title: 'Hành trình lớn lên', icon: <FaGraduationCap /> },
    { id: 1, title: 'Những ảnh hưởng', icon: <FaHome /> },
    { id: 2, title: 'Sự kiện quan trọng', icon: <FaBook /> },
    { id: 3, title: 'Bài học', icon: <FaShip /> }
  ];

  return (
    <div className="w-full bg-gradient-to-b from-white to-gray-50 py-16">
      {/* HEADER */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="w-full mb-8 overflow-hidden relative"
      >
        <div className="flex items-center justify-end mr-12">
          {/* Left - Year (overlapping onto the image) */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="w-1/3 flex items-center justify-center bg-transparent pl-8 relative z-10 -mr-32"
          >
            <h1 className="text-[10rem] font-bold leading-none" 
                style={{ 
                  fontFamily: 'Arial, sans-serif',
                  color: '#D63426',
                  letterSpacing: '-0.05em'
                }}>
              1890-1911
            </h1>
          </motion.div>

          {/* Right - Image */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="w-1/2"
          >
            <img 
              src="https://cdn3.ivivu.com/2024/09/lang-sen-que-bac-ivivu-1.png" 
              alt="Lang Sen"
              className="w-full h-[500px] object-cover grayscale"
              style={{ filter: 'grayscale(100%)' }}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* INTRO SECTION - Scrollytelling */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto px-6 mb-16"
      >
        <div className="grid grid-cols-2 gap-12" style={{ fontFamily: 'Arial, sans-serif' }}>
          {/* Left Column - Title and Info */}
          <div>
            <div className="w-full h-px bg-gray-300 mb-6"></div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl font-bold mb-2" 
              style={{ fontFamily: 'Arial, sans-serif', color: '#D63426' }}
            >
              "Tại sao người Pháp không phải gánh, mà dân ta phải gánh?"
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm mb-6" 
              style={{ fontFamily: 'Arial, sans-serif', color: '#D63426' }}
            >
              Tại Làng Sen, Nam Đàn, Nghệ An
            </motion.p>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm text-gray-400 italic mt-8" 
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              "Nước mất, nhà tan, biết sống làm chi?"
            </motion.p>

            {/* Timeline visual indicator */}
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: "200px" }}
              transition={{ duration: 1, delay: 0.8 }}
              className="w-1 bg-gradient-to-b from-[#D63426] to-transparent mt-8 ml-4"
            />
          </div>
          
          {/* Right Column - Content with Timeline */}
          <div className="relative border-l-2 border-[#D63426]/20 pl-8">
            {/* Đoạn 1: Những năm tháng ấu thơ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8 }}
              className="mb-6"
            >
              <p className="text-base text-gray-800 leading-relaxed">
                Những năm tháng ấu thơ, dù ở Làng Sen hay kinh thành Huế, cậu bé Nguyễn Sinh Cung đã sớm chứng kiến nỗi thống khổ của đồng bào. Đó là hình ảnh những đoàn dân phu{' '}
                <span className="font-semibold text-gray-900">gầy guộc, mồ hôi đầm đìa</span> dưới roi vọt của thực dân.
              </p>
            </motion.div>

            {/* Đoạn 2: Hạt giống đỏ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-6"
            >
              <p className="text-base text-gray-800 leading-relaxed">
                Những câu hỏi ngây thơ nhưng nhức nhối ấy đã gieo vào lòng cậu bé một{' '}
                <span className="font-bold text-[#D63426]">hạt giống đỏ</span>. Trong sự im lặng đau đớn của người cha Nguyễn Sinh Sắc và bi kịch của gia đình, chàng thanh niên{' '}
                <span className="relative inline-block">
                  <span className="font-bold text-gray-900">Nguyễn Tất Thành</span>
                </span>{' '}
                dần hiểu rằng: <span className="font-bold text-[#D63426]">Chỉ có con đường tự lực tự cường mới cứu được dân tộc.</span>
              </p>
            </motion.div>

            {/* Timeline dot for 1901 */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="absolute -left-3 top-[280px] w-6 h-6 rounded-full bg-[#D63426] border-4 border-white shadow-lg z-10"
            />

            {/* Đoạn 3: Quyết định lịch sử */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-8"
            >
              <p className="text-base text-gray-800 leading-relaxed mb-6">
                Từ những trăn trở đầu đời ấy, một quyết định lịch sử đã được nung nấu:
              </p>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-gradient-to-r from-[#D63426] to-[#B52A1E] text-white p-6 rounded-lg shadow-xl"
              >
                <p className="text-xl font-bold text-center italic">
                  "Phải ra đi tìm đường cứu nước."
                </p>
              </motion.div>
            </motion.div>

            {/* Decorative quote mark */}
            <motion.div
              initial={{ opacity: 0, rotate: -45 }}
              whileInView={{ opacity: 0.1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="absolute -top-8 -right-8 text-9xl text-[#D63426] font-serif leading-none pointer-events-none"
            >
              "
            </motion.div>
          </div>
        </div>

        {/* Evidence Card - Historical Quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 flex justify-center"
        >
          <div className="max-w-2xl bg-gradient-to-br from-orange-50 to-yellow-50 border-l-4 border-[#D63426] shadow-xl rounded-lg p-8 relative">
            <div className="absolute -top-6 -left-4 text-6xl text-[#D63426] opacity-30 font-serif">"</div>
            
            <p className="text-lg font-serif italic text-gray-800 leading-relaxed mb-6 relative z-10">
              "Tôi muốn đi ra ngoài, xem nước Pháp và các nước khác. Sau khi xem xét họ làm như thế nào, tôi sẽ trở về giúp đồng bào chúng tôi."
            </p>
            
            <div className="border-t-2 border-[#D63426]/20 pt-4">
              <div className="flex flex-col items-end">
                <span className="font-bold text-[#D63426] uppercase tracking-wider text-sm">Hồ Chí Minh</span>
                <span className="text-xs text-gray-500 italic mt-1">
                  Trích: Những mẩu chuyện về đời hoạt động của Hồ Chủ tịch - Trần Dân Tiên
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* CONTEXT - Visual Timeline */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold mb-12 text-center" 
          style={{ fontFamily: 'Arial, sans-serif', color: '#D63426' }}
        >
          Bối Cảnh Lịch Sử
        </motion.h2>
        
        <motion.div className="relative">
          {/* Central Vertical Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#D63426] to-[#B52A1E] -ml-px" />
          
          {/* Vertical Timeline */}
          <div className="space-y-0">
            {[
              { year: '1858', event: 'Pháp xâm lược', desc: 'Pháp bắt đầu xâm lược Việt Nam, mở đầu cho thời kỳ thực dân. Đây là bước ngoặt lịch sử khi đất nước bắt đầu rơi vào tay kẻ thù.', color: 'from-red-500 to-red-600' },
              { year: '1884', event: 'Pháp chiếm toàn bộ VN', desc: 'Toàn bộ đất nước rơi vào tay thực dân Pháp, dân tộc mất nước. Người dân Việt Nam phải sống trong cảnh khổ cực và áp bức.', color: 'from-red-600 to-red-700' },
              { year: '1890', event: 'Hồ Chí Minh ra đời', desc: 'Nguyễn Sinh Cung ra đời tại làng Sen, Nghệ An. Ngày 19 tháng 5 năm 1890, người sẽ trở thành lãnh tụ vĩ đại của dân tộc Việt Nam.', color: 'from-yellow-400 to-orange-500', highlight: true },
              { year: '1906', event: 'Phong trào Đông Du thất bại', desc: 'Phong trào du học Nhật Bản của Phan Bội Châu bị đàn áp. Con đường cứu nước theo lối cũ không còn khả thi.', color: 'from-red-500 to-red-600' },
              { year: '1911', event: 'Chuẩn bị ra đi', desc: 'Nguyễn Tất Thành quyết định ra đi tìm đường cứu nước. Ngày 5 tháng 6, lên tàu Amiral Latouche-Tréville, bắt đầu hành trình 29 năm lưu lạc.', color: 'from-blue-500 to-blue-600', highlight: true }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
                className="relative flex items-center py-8"
              >
                {/* Left Content (for even index) */}
                {index % 2 === 0 && (
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={`w-5/12 bg-gradient-to-br ${item.highlight ? 'from-yellow-50 to-orange-50 border-yellow-500' : 'from-white to-red-50 border-[#D63426]'} p-6 rounded-xl shadow-lg border-l-4 hover:shadow-2xl transition-all mr-auto`}
                  >
                    <div>
                      <h3 className="text-xl font-bold mb-2" style={{ color: item.highlight ? '#F59E0B' : '#D63426' }}>
                        {item.event}
                      </h3>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </motion.div>
                )}

                {/* Timeline Node (Center) */}
                <div className="absolute left-1/2 -translate-x-1/2 z-10">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.15 + 0.2, type: "spring" }}
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center text-white font-bold text-xs shadow-xl cursor-pointer relative`}
                  >
                    <span className="text-[10px]">{item.year}</span>
                    <motion.div
                      className={`absolute inset-0 rounded-full bg-gradient-to-br ${item.color}`}
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </motion.div>
                </div>

                {/* Right Content (for odd index) */}
                {index % 2 === 1 && (
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={`w-5/12 bg-gradient-to-br ${item.highlight ? 'from-yellow-50 to-orange-50 border-yellow-500' : 'from-white to-red-50 border-[#D63426]'} p-6 rounded-xl shadow-lg border-l-4 hover:shadow-2xl transition-all ml-auto`}
                  >
                    <div>
                      <h3 className="text-xl font-bold mb-2" style={{ color: item.highlight ? '#F59E0B' : '#D63426' }}>
                        {item.event}
                      </h3>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* CONTENT - Tabs */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-8 text-center" 
          style={{ fontFamily: 'Arial, sans-serif', color: '#D63426' }}
        >
          Nội Dung Chi Tiết
        </motion.h2>
        
        {/* Tab Headers */}
        <div className="flex gap-4 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#D63426] to-[#B52A1E] text-white shadow-lg'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[#D4AF37] hover:shadow-md'
              }`}
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              {tab.icon}
              {tab.title}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-white to-orange-50 p-8 rounded-lg shadow-xl border-2 border-[#D4AF37]/30 min-h-[500px]"
        >
          {activeTab === 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-[#D63426] to-[#D4AF37]"></div>
                <h3 className="text-2xl font-bold" style={{ color: '#D63426' }}>Hành Trình Lớn Lên</h3>
              </div>
              
              {[
                { 
                  year: '1890-1901', 
                  title: 'Thời thơ ấu ở Xứ Nghệ & Huế', 
                  details: [
                    'Sinh tại làng Hoàng Trù (Quê ngoại), năm 1901 về Làng Sen (Quê nội).', 
                    'Thừa hưởng truyền thống nho học uyên thâm từ cha (Cụ Nguyễn Sinh Sắc).', 
                    '1901: Biến cố lớn - Mẹ mất tại Huế, bắt đầu thấu hiểu nỗi đau đời.'
                  ],
                  color: 'from-red-500/10 to-orange-500/10'
                },
                { 
                  year: '1905-1909', 
                  title: 'Ánh sáng và Bạo quyền', 
                  details: [
                    'Học trường Quốc học Huế. Tiếp thu văn hóa phương Tây.', 
                    '1908: Tham gia phong trào chống thuế Trung Kỳ → Bị đuổi học.', 
                    'Nhận ra: "Cải lương" hay "Cầu viện" đều bế tắc.'
                  ],
                  color: 'from-yellow-500/10 to-red-500/10'
                },
                { 
                  year: '1910-1911', 
                  title: 'Dục Thanh & Quyết định lịch sử', 
                  details: [
                    'Dạy học tại trường Dục Thanh (Phan Thiết) - truyền lửa cho học trò.', 
                    'Đi vào Sài Gòn, nhìn thấy sự phồn hoa đối lập với nghèo đói.', 
                    '5/6/1911: Lên tàu Amiral Latouche-Tréville với tên Văn Ba.'
                  ],
                  color: 'from-blue-500/10 to-indigo-500/10'
                }
              ].map((period, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                  whileHover={{ x: 5, boxShadow: '0 10px 30px rgba(214, 52, 38, 0.2)' }}
                  className={`bg-gradient-to-r ${period.color} border-l-4 border-[#D4AF37] pl-6 py-4 rounded-r-lg transition-all`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-gradient-to-r from-[#D63426] to-[#D4AF37] text-white px-4 py-1 rounded-full font-bold text-sm shadow-md">
                      {period.year}
                    </span>
                    <h4 className="font-bold text-lg text-gray-800">{period.title}</h4>
                  </div>
                  <ul className="space-y-2 ml-4">
                    {period.details.map((detail, i) => (
                      <motion.li 
                        key={i} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.15 + i * 0.1 }}
                        className="text-gray-700 leading-relaxed"
                      >
                        {detail}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}

              {/* Source citation */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 p-4 bg-yellow-50 border-l-4 border-[#D4AF37] rounded-r"
              >
                <p className="text-xs text-gray-600 italic">
                  <strong>Nguồn tham khảo:</strong> Hồ Chí Minh Toàn tập, Tập 1 | Biên niên tiểu sử Hồ Chí Minh
                </p>
              </motion.div>
            </div>
          )}

          {activeTab === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-[#D63426] to-[#D4AF37]"></div>
                <h3 className="text-2xl font-bold" style={{ color: '#D63426' }}>Những Ảnh Hưởng Định Hình</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                {[
                  { 
                    icon: 'https://upload.wikimedia.org/wikipedia/vi/0/08/Nguyensinhsac.jpg', 
                    title: 'CHA', 
                    subtitle: 'Nguyễn Sinh Sắc', 
                    content: 'Tinh thần yêu nước', 
                    quote: 'Con phải học hành cho nên người, để giúp nước, giúp dân',
                    gradient: 'from-red-500 to-orange-500'
                  },
                  { 
                    icon: '📚', 
                    title: 'THẦY GIÁO', 
                    subtitle: 'Vuông, Giảng', 
                    content: 'Kiến thức & lý tưởng', 
                    quote: 'Học để làm người, làm người để phụng sự dân tộc',
                    gradient: 'from-yellow-500 to-amber-500'
                  },
                  { 
                    icon: '🌾', 
                    title: 'DÂN TỘC', 
                    subtitle: 'Nỗi đau', 
                    content: 'của dân lao động', 
                    quote: 'Con đường cũ không còn, phải tìm con đường mới',
                    gradient: 'from-green-600 to-emerald-600'
                  }
                ].map((influence, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.2 }}
                    whileHover={{ scale: 1.05, rotateY: 5, boxShadow: '0 20px 40px rgba(214, 52, 38, 0.3)' }}
                    className="bg-white p-6 rounded-lg shadow-lg cursor-pointer border-2 border-transparent hover:border-[#D4AF37] transition-all relative overflow-hidden group"
                  >
                    {/* Decorative background gradient on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${influence.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                    
                    <div className="relative z-10">
                      <div className="mb-3 text-center transform group-hover:scale-110 transition-transform">
                        {influence.icon.startsWith('http') ? (
                          <img src={influence.icon} alt={influence.title} className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-[#D63426] shadow-lg" />
                        ) : (
                          <span className="text-5xl">{influence.icon}</span>
                        )}
                      </div>
                      <h4 className="font-bold text-lg text-center mb-1" style={{ color: '#D63426' }}>{influence.title}</h4>
                      <p className="text-center text-sm mb-2 text-[#D4AF37] font-semibold">{influence.subtitle}</p>
                      <p className="text-center text-gray-700 mb-3">{influence.content}</p>
                      <div className="border-t-2 border-[#D4AF37]/30 pt-3">
                        <p className="italic text-sm text-gray-600 leading-relaxed">"{influence.quote}"</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 p-4 bg-yellow-50 border-l-4 border-[#D4AF37] rounded-r"
              >
                <p className="text-xs text-gray-600 italic">
                  <strong>Nguồn:</strong> Trần Dân Tiên - <em>Những mẩu chuyện về đời hoạt động của Hồ Chủ tịch</em>
                </p>
              </motion.div>
            </div>
          )}

          {activeTab === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-[#D63426] to-[#D4AF37]"></div>
                <h3 className="text-2xl font-bold" style={{ color: '#D63426' }}>Sự Kiện Quan Trọng</h3>
              </div>
              
              <div className="space-y-6 relative">
                {/* Timeline line */}
                <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#D63426] via-[#D4AF37] to-[#B52A1E]"></div>
                
                {[
                  { 
                    year: '1905', 
                    event: 'Phong trào Đông Du & Duy Tân', 
                    impact: 'Bác khâm phục lòng yêu nước nhưng không tán thành cách làm (dựa vào Nhật).',
                    color: 'from-red-500 to-red-600',
                    image: '🏯'
                  },
                  { 
                    year: '1908', 
                    event: 'Biểu tình chống thuế Trung Kỳ', 
                    impact: 'Trực tiếp chứng kiến sự đàn áp đẫm máu. Hiểu rõ bản chất thực dân.',
                    color: 'from-orange-500 to-red-500',
                    image: '✊'
                  },
                  { 
                    year: '1910', 
                    event: 'Dạy học ở Trường Dục Thanh', 
                    impact: 'Gieo mầm yêu nước cho thế hệ trẻ qua các bài thể dục và lịch sử.',
                    color: 'from-yellow-500 to-orange-500',
                    image: '📖'
                  },
                  { 
                    year: '1911', 
                    event: 'Rời bến cảng Nhà Rồng', 
                    impact: 'Mở ra kỷ nguyên mới: Tự mình đi tìm chân lý thay vì chờ đợi.',
                    color: 'from-blue-500 to-indigo-600',
                    image: '🚢'
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15 }}
                    className="flex gap-4 items-start relative group"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.15, rotate: 360 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className={`flex-shrink-0 w-20 h-20 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl relative z-10 cursor-pointer`}
                    >
                      {item.year}
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ x: 5, boxShadow: '0 10px 30px rgba(212, 175, 55, 0.3)' }}
                      className="flex-1 bg-white p-5 rounded-lg shadow-md border-l-4 border-[#D4AF37] hover:border-[#D63426] transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-2 text-gray-800">{item.event}</h4>
                          <p className="text-gray-700 italic">→ {item.impact}</p>
                        </div>
                        {/* Thumbnail image appears on hover */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          whileHover={{ opacity: 1, scale: 1 }}
                          className="ml-4 text-4xl"
                        >
                          {item.image}
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              {/* Historical quote */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-8 bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-lg border-l-4 border-[#D63426] shadow-md"
              >
                <p className="text-sm italic text-gray-700 mb-2 leading-relaxed">
                  "Những cuộc biểu tình của nông dân (năm 1908) đã cho tôi thấy sức mạnh to lớn của nhân dân, nhưng cũng cho thấy sự tàn bạo của kẻ thù."
                </p>
                <p className="text-xs text-[#D63426] font-semibold">— Hồ Chí Minh Toàn tập, Tập 1</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-4 p-4 bg-yellow-50 border-l-4 border-[#D4AF37] rounded-r"
              >
                <p className="text-xs text-gray-600 italic">
                  <strong>Nguồn:</strong> Hồ Chí Minh Toàn tập | Khu di tích trường Dục Thanh (Phan Thiết)
                </p>
              </motion.div>
            </div>
          )}

          {activeTab === 3 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-[#D63426] to-[#D4AF37]"></div>
                <h3 className="text-2xl font-bold" style={{ color: '#D63426' }}>Bài Học Từ Giai Đoạn Này</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  { text: 'Yêu nước phải xuất phát từ thực tế cuộc sống', icon: '❤️' },
                  { text: 'Không thể cứu nước bằng con đường cũ', icon: '🚫' },
                  { text: 'Cần học hỏi, tìm kiếm tri thức mới', icon: '📚' },
                  { text: 'Quyết tâm phải gắn với hành động cụ thể', icon: '💪' }
                ].map((lesson, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-start gap-4 bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-lg border-l-4 border-green-500 hover:border-[#D4AF37] shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    <motion.span 
                      className="text-3xl group-hover:scale-125 transition-transform"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    >
                      {lesson.icon}
                    </motion.span>
                    <p className="text-lg text-gray-800 flex-1">{lesson.text}</p>
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-lg border-2 border-[#D4AF37] shadow-lg"
                >
                  <p className="text-lg mb-4 font-semibold text-gray-800" style={{ fontFamily: 'Arial, sans-serif' }}>
                    💭 Nếu là bạn sống trong thời kỳ đó, bạn sẽ làm gì?
                  </p>
                  <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(214, 52, 38, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-3 bg-gradient-to-r from-[#D63426] to-[#B52A1E] text-white rounded-lg font-bold hover:from-[#B52A1E] hover:to-[#D63426] transition-all shadow-md"
                  >
                    Chia sẻ suy nghĩ
                  </motion.button>
                </motion.div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* CONNECT - Transition to next phase */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto px-6"
      >
        <div className="bg-gradient-to-r from-[#D63426] to-[#B52A1E] text-white p-8 rounded-lg shadow-2xl">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FaShip className="text-3xl" />
            HỆ QUẢ CỦA GIAI ĐOẠN NÀY
          </h3>
          <div className="space-y-2 mb-6">
            <p className="flex items-center gap-2"><span className="text-xl">✓</span> Nhận thức: Con đường cũ không còn</p>
            <p className="flex items-center gap-2"><span className="text-xl">✓</span> Quyết tâm: Phải tìm đường cứu nước</p>
            <p className="flex items-center gap-2"><span className="text-xl">✓</span> Hành động: Ra đi vào năm 1911</p>
          </div>
          <div className="bg-white/20 p-4 rounded-lg mb-6">
            <p className="text-lg mb-2">❓ CÂU HỎI DẪN ĐẾN GIAI ĐOẠN SAU:</p>
            <p className="text-xl font-bold italic">"Ở nước ngoài, người ta cứu nước bằng cách nào?"</p>
          </div>
          <button className="w-full py-4 bg-white text-[#D63426] rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
            Khám phá hành trình 1911-1920 →
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TimelineSection;
