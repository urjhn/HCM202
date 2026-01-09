import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, useAnimationControls, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FaHome, FaBook, FaGraduationCap, FaShip, FaMapMarkerAlt } from 'react-icons/fa';
import { BiSolidQuoteAltLeft } from 'react-icons/bi';
import { Accordion, AccordionItem } from '@heroui/react';
import { geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';

const TimelineSection = () => {
  const Motion = motion;
  const [activeTab, setActiveTab] = useState(0);
  const [chapter2Tab, setChapter2Tab] = useState(0);
  const [activeStopId, setActiveStopId] = useState('saigon');
  const [walkChoice, setWalkChoice] = useState(null);
  const [quizPicked, setQuizPicked] = useState(() => new Set());
  const [detectiveAnswer, setDetectiveAnswer] = useState('');
  const [detectiveFeedback, setDetectiveFeedback] = useState(null);
  const [worldFeatures, setWorldFeatures] = useState(null);
  const [isDeparting, setIsDeparting] = useState(false);
  const [isChoosingSeat, setIsChoosingSeat] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [departureCountdown, setDepartureCountdown] = useState(null);

  const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

  const MAP_W = 900;
  const MAP_H = 460;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(GEO_URL);
        if (!res.ok) return;
        const topo = await res.json();
        const geo = feature(topo, topo.objects.countries);
        if (!cancelled) setWorldFeatures(geo.features);
      } catch {
        // ignore network errors; map will render without countries
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const worldFeatureCollection = useMemo(
    () => ({ type: 'FeatureCollection', features: worldFeatures ?? [] }),
    [worldFeatures]
  );

  const mapProjection = useMemo(() => {
    const proj = geoMercator();
    if (worldFeatures && worldFeatures.length > 0) {
      return proj.fitSize([MAP_W, MAP_H], worldFeatureCollection);
    }

    return proj.scale(135).translate([MAP_W / 2, MAP_H / 1.45]);
  }, [worldFeatures, worldFeatureCollection]);

  const mapPath = useMemo(() => geoPath(mapProjection), [mapProjection]);

  const journeyStops = useMemo(() => ([
    {
      id: 'saigon',
      label: 'Sài Gòn (Bến Nhà Rồng)',
      year: '1911',
      country: 'Việt Nam',
      coords: [106.7009, 10.7769],
      job: 'Phụ bếp trên tàu (Văn Ba)',
      learned: 'Bước đầu hòa nhập đời sống thủy thủ; quyết tâm tìm con đường mới.',
      note: 'Rời bến 5/6/1911 trên tàu Amiral Latouche-Tréville.'
    },
    {
      id: 'marseille',
      label: 'Marseille',
      year: '1911',
      country: 'Pháp',
      coords: [5.3698, 43.2965],
      job: 'Làm việc trên tàu, lao động phổ thông',
      learned: 'Quan sát đời sống người lao động và khoảng cách giàu–nghèo ở chính quốc.',
      note: 'Một trong những điểm đặt chân đầu tiên tại Pháp.'
    },
    {
      id: 'london',
      label: 'London',
      year: '1913',
      country: 'Anh',
      coords: [-0.1276, 51.5072],
      job: 'Lao động dịch vụ (bếp/khách sạn), làm thuê',
      learned: 'Kỷ luật lao động; quan sát tổ chức công đoàn, đời sống công nhân.',
      note: 'Giai đoạn lao động khó khăn, tích lũy trải nghiệm xã hội.'
    },
    {
      id: 'newyork',
      label: 'New York',
      year: '1913–1917',
      country: 'Mỹ',
      coords: [-74.0060, 40.7128],
      job: 'Nhiều nghề: rửa bát, làm vườn, lao động phổ thông…',
      learned: 'Nhìn thấy bất bình đẳng xã hội; trải nghiệm đời sống người nhập cư/lao động.',
      note: 'Tư liệu tiểu sử ghi nhận thời gian hoạt động tại Mỹ.'
    },
    {
      id: 'paris',
      label: 'Paris',
      year: '1917–1920',
      country: 'Pháp',
      coords: [2.3522, 48.8566],
      job: 'Làm thợ ảnh, viết báo, hoạt động chính trị',
      learned: 'Tham gia phong trào công nhân; tiếp cận tư tưởng xã hội chủ nghĩa; chuyển biến quyết định năm 1920.',
      note: '1919 gửi “Yêu sách của nhân dân An Nam”; 1920 tham gia Đảng Cộng sản Pháp (Tours).'
    }
  ]), []);

  const projectedStops = useMemo(() => {
    return journeyStops
      .map((s) => {
        const p = mapProjection(s.coords);
        if (!p) return null;
        return { ...s, p };
      })
      .filter(Boolean);
  }, [journeyStops, mapProjection]);

  const routePathD = useMemo(() => {
    if (!projectedStops.length) return '';
    const [first, ...rest] = projectedStops;
    return `M ${first.p[0]} ${first.p[1]} ` + rest.map((s) => `L ${s.p[0]} ${s.p[1]}`).join(' ');
  }, [projectedStops]);

  const activeStop = useMemo(
    () => journeyStops.find((s) => s.id === activeStopId) ?? journeyStops[0],
    [activeStopId, journeyStops]
  );

  const chapter2Tabs = useMemo(
    () => [
      { id: 0, title: '🌍 Bản đồ hành trình' },
      { id: 1, title: '👔 1001 nghề nghiệp' },
      { id: 2, title: '📚 Những bài học lớn' },
      { id: 3, title: '⚡ Sự kiện trọng đại' },
      { id: 4, title: '💪 Con người thời kỳ này' }
    ],
    []
  );

  const jobsGrid = useMemo(
    () => [
      { icon: '🍳', title: 'Bếp phó', story: 'Lao động trên tàu/nhà bếp, rèn kỷ luật và ý chí.' },
      { icon: '🧹', title: 'Lao động dịch vụ', story: 'Công việc chân tay nơi xứ người, thấu hiểu đời sống công nhân.' },
      { icon: '🌳', title: 'Làm vườn', story: 'Lao động phổ thông, học cách tự lực và quan sát xã hội.' },
      { icon: '🔥', title: 'Đốt lò', story: 'Cực nhọc nhưng giúp hiểu rõ giá trị của lao động.' },
      { icon: '📷', title: 'Sửa ảnh', story: 'Thời gian ở Paris, vừa kiếm sống vừa hoạt động.' },
      { icon: '✍️', title: 'Viết', story: 'Viết bài, kiến nghị, truyền thông chính trị.' },
      { icon: '📰', title: 'Báo chí', story: 'Tham gia báo chí cách mạng, lên tiếng cho người bị áp bức.' },
      { icon: '🗣️', title: 'Diễn thuyết', story: 'Rèn khả năng thuyết trình, tranh luận trong phong trào.' },
      { icon: '📚', title: 'Tự học', story: 'Học ngoại ngữ, lịch sử, xã hội học qua trải nghiệm và sách báo.' },
      { icon: '🎭', title: 'Văn nghệ', story: 'Tiếp xúc văn hóa, mở rộng tầm nhìn về xã hội phương Tây.' }
    ],
    []
  );

  const handlePickQuiz = useCallback((stopId) => {
    setQuizPicked((prev) => {
      const next = new Set(prev);
      if (next.has(stopId)) next.delete(stopId);
      else next.add(stopId);
      return next;
    });
  }, []);

  const runDetective = useCallback(() => {
    const answer = detectiveAnswer.trim().toLowerCase();
    if (!answer) {
      setDetectiveFeedback({ score: 0, notes: ['Hãy nhập câu trả lời để hệ thống phản hồi.'] });
      return;
    }

    const keys = [
      { k: ['tù', 'đại xá', 'tù chính trị'], label: 'Bạn đã nhắc tới đại xá/tù chính trị.' },
      { k: ['báo chí', 'xuất bản'], label: 'Bạn đã nhắc tới tự do báo chí/xuất bản.' },
      { k: ['hội họp', 'lập hội', 'tổ chức'], label: 'Bạn đã nhắc tới quyền hội họp/lập hội.' },
      { k: ['bình đẳng', 'người bản xứ', 'pháp luật'], label: 'Bạn đã nhắc tới bình đẳng trước pháp luật/cải cách pháp lý.' },
      { k: ['wilson', '14 điểm', 'tự quyết'], label: 'Bạn đã liên hệ với “14 điểm” và quyền tự quyết.' }
    ];

    let score = 0;
    const notes = [];
    for (const item of keys) {
      if (item.k.some((kw) => answer.includes(kw))) {
        score += 1;
        notes.push(item.label);
      }
    }
    if (notes.length === 0) notes.push('Gợi ý: thử nhắc tới “tự do báo chí”, “đại xá tù chính trị”, “quyền hội họp/lập hội”, “bình đẳng trước pháp luật”, hoặc liên hệ “14 điểm” của Wilson.');
    setDetectiveFeedback({ score, notes });
  }, [detectiveAnswer]);

  const seatRows = useMemo(() => {
    // 2 ghế - lối đi - 2 ghế (mô phỏng khoang tàu)
    const rows = 5;
    const cols = ['A', 'B', 'C', 'D'];
    return Array.from({ length: rows }, (_, rowIndex) => {
      const rowNum = rowIndex + 1;
      const left = [`${rowNum}${cols[0]}`, `${rowNum}${cols[1]}`];
      const right = [`${rowNum}${cols[2]}`, `${rowNum}${cols[3]}`];
      return { rowNum, left, right };
    });
  }, []);

  // Parallax (mouse-based) for the departure scene
  const parallaxX = useMotionValue(0);
  const parallaxY = useMotionValue(0);
  const smoothX = useSpring(parallaxX, { stiffness: 120, damping: 22 });
  const smoothY = useSpring(parallaxY, { stiffness: 120, damping: 22 });

  const bgX = useTransform(smoothX, (v) => v * 14);
  const bgY = useTransform(smoothY, (v) => v * 10);
  const shipX = useTransform(smoothX, (v) => v * 26);
  const shipY = useTransform(smoothY, (v) => v * 16);
  const textX = useTransform(smoothX, (v) => v * 10);
  const textY = useTransform(smoothY, (v) => v * 8);

  const shipControls = useAnimationControls();
  const oceanControls = useAnimationControls();

  const handleParallaxMove = useCallback((e) => {
    if (isDeparting || isChoosingSeat) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    parallaxX.set(relX);
    parallaxY.set(relY);
  }, [isDeparting, isChoosingSeat, parallaxX, parallaxY]);

  const handleParallaxLeave = useCallback(() => {
    if (isDeparting || isChoosingSeat) return;
    parallaxX.set(0);
    parallaxY.set(0);
  }, [isDeparting, isChoosingSeat, parallaxX, parallaxY]);

  const runDepartureAnimation = useCallback(async () => {
    oceanControls.start({
      opacity: 1,
      transition: { duration: 1.2, ease: 'easeInOut' }
    });

    await shipControls.start({
      x: '120vw',
      rotate: 6,
      transition: { duration: 1.8, ease: 'easeInOut' }
    });

    const nextId = 'chuong-2';
    window.location.hash = nextId;
    document.getElementById(nextId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [oceanControls, shipControls]);

  const handleOpenSeatSelection = useCallback(() => {
    if (isDeparting) return;
    setIsChoosingSeat(true);
  }, [isDeparting]);

  const handleConfirmSeat = useCallback(() => {
    if (isDeparting) return;
    if (!selectedSeat) return;
    setIsDeparting(true);
    setDepartureCountdown(5);
  }, [isDeparting, selectedSeat]);

  useEffect(() => {
    if (departureCountdown === null) return;

    if (departureCountdown <= 0) return;

    const timer = window.setTimeout(() => {
      if (departureCountdown === 1) {
        runDepartureAnimation();
      }
      setDepartureCountdown(departureCountdown - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [departureCountdown, runDepartureAnimation]);

  const tabs = [
    { id: 0, title: 'Hành trình lớn lên', icon: <FaGraduationCap /> },
    { id: 1, title: 'Những ảnh hưởng', icon: <FaHome /> },
    { id: 2, title: 'Sự kiện quan trọng', icon: <FaBook /> },
    { id: 3, title: 'Bài học', icon: <FaShip /> }
  ];

  return (
    <div id="coi-nguon" className="w-full bg-gradient-to-b from-white to-gray-50 py-16">
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
                    icon: 'https://cdn.giaoduc.net.vn/images/4de4c68b74530ee1841e187837764325c1ca1d4edd36241ff23121f64a06b40c91d553ef473aa90c361699425ad87f1a86372b6df2fa54ed05a39abefac2ff56be006905412b27d4feecd5babff4c1c6/khang_thue.png.webp', 
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
                  { text: 'Yêu nước phải xuất phát từ thực tế cuộc sống', icon: '' },
                  { text: 'Không thể cứu nước bằng con đường cũ', icon: '' },
                  { text: 'Cần học hỏi, tìm kiếm tri thức mới', icon: '' },
                  { text: 'Quyết tâm phải gắn với hành động cụ thể', icon: '' }
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
                    Nếu là bạn sống trong thời kỳ đó, bạn sẽ làm gì?
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
        className="max-w-6xl mx-auto px-6"
      >
        <div
          className="relative overflow-hidden rounded-2xl shadow-2xl border border-[#D4AF37]/30 min-h-[420px] md:min-h-[460px]"
          onMouseMove={handleParallaxMove}
          onMouseLeave={handleParallaxLeave}
        >
          {/* Lớp nền: Bến Nhà Rồng (mờ ảo) */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              x: bgX,
              y: bgY,
              backgroundImage: 'url(https://commons.wikimedia.org/wiki/Special:FilePath/Ben_Nha_Rong_ve_dem.JPG)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(2px) grayscale(25%)'
            }}
          />
          <div aria-hidden="true" className="absolute inset-0 bg-black/40" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#D63426]/55 to-[#B52A1E]/35" />

          {/* Lớp giữa: Con tàu */}
          <motion.div
            className="absolute bottom-10 left-10"
            animate={shipControls}
          >
            <motion.div style={{ x: shipX, y: shipY }}>
              <div className="flex items-end gap-4">
                <div className="text-white/90 drop-shadow-2xl">
                  <FaShip className="text-[6rem]" />
                </div>
                <div className="hidden md:block bg-white/10 text-white px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20">
                  <p className="text-sm font-semibold">Amiral Latouche-Tréville</p>
                  <p className="text-xs opacity-90">Rời bến Sài Gòn • 1911</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Lớp trên: Văn bản */}
          <motion.div
            className="relative z-10 p-8 md:p-10"
            style={{ x: textX, y: textY }}
          >
            <div className="max-w-2xl">
              <h3 className="text-3xl font-bold mb-4 flex items-center gap-3 text-white">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/15 border border-white/20">
                  <FaShip className="text-xl" />
                </span>
                CÁNH BUỒM RA KHƠI • 1911
              </h3>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">

                <div className="bg-white/15 p-4 rounded-lg mb-5 border border-white/15">
                  <p className="text-xl font-bold italic text-white">"Ở nước ngoài, người ta cứu nước bằng cách nào?"</p>
                </div>

                {!isChoosingSeat ? (
                  <button
                    onClick={handleOpenSeatSelection}
                    disabled={isDeparting}
                    className="w-full py-4 bg-white text-[#D63426] rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isDeparting ? 'Đang chuẩn bị…' : 'Chọn ghế để khởi hành →'}
                  </button>
                ) : (
                  <div className="bg-white/10 border border-white/20 rounded-xl p-5">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div>
                        <p className="text-white font-bold text-lg">Chọn ghế trên tàu</p>
                        <p className="text-white/80 text-sm">Chạm vào ghế để chọn, rồi xác nhận để khởi hành.</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/80 text-xs uppercase tracking-wider">Ghế đã chọn</p>
                        <p className="text-white text-lg font-bold">{selectedSeat ?? '—'}</p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/15 bg-black/10 p-4">
                      <div className="flex items-center justify-between text-white/70 text-xs mb-3">
                        <span>Mũi tàu</span>
                        <span>Lối đi</span>
                        <span>Đuôi tàu</span>
                      </div>

                      <div className="space-y-2">
                        {seatRows.map((row) => (
                          <div key={row.rowNum} className="grid grid-cols-5 gap-2 items-center">
                            {row.left.map((seat) => (
                              <button
                                key={seat}
                                type="button"
                                disabled={isDeparting}
                                onClick={() => setSelectedSeat(seat)}
                                className={
                                  `h-12 rounded-lg border text-sm font-bold transition-colors ` +
                                  (selectedSeat === seat
                                    ? 'bg-white text-[#D63426] border-white'
                                    : 'bg-white/10 text-white border-white/25 hover:bg-white/15') +
                                  (isDeparting ? ' opacity-70 cursor-not-allowed' : '')
                                }
                                aria-pressed={selectedSeat === seat}
                              >
                                {seat}
                              </button>
                            ))}

                            <div aria-hidden="true" className="h-12 rounded-md bg-white/5 border border-white/10" />

                            {row.right.map((seat) => (
                              <button
                                key={seat}
                                type="button"
                                disabled={isDeparting}
                                onClick={() => setSelectedSeat(seat)}
                                className={
                                  `h-12 rounded-lg border text-sm font-bold transition-colors ` +
                                  (selectedSeat === seat
                                    ? 'bg-white text-[#D63426] border-white'
                                    : 'bg-white/10 text-white border-white/25 hover:bg-white/15') +
                                  (isDeparting ? ' opacity-70 cursor-not-allowed' : '')
                                }
                                aria-pressed={selectedSeat === seat}
                              >
                                {seat}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleConfirmSeat}
                      disabled={isDeparting || !selectedSeat}
                      className="mt-4 w-full py-4 bg-white text-[#D63426] rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isDeparting
                        ? (departureCountdown ? `Khởi hành sau ${departureCountdown}s…` : 'Đang khởi hành…')
                        : 'Xác nhận chọn chỗ'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Biển (overlay chuyển xanh) */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={oceanControls}
            style={{
              background: 'linear-gradient(180deg, rgba(2, 62, 138, 0.0) 0%, rgba(0, 119, 182, 0.75) 55%, rgba(0, 150, 199, 0.95) 100%)'
            }}
          />

          {/* Countdown overlay (5s) */}
          {typeof departureCountdown === 'number' && departureCountdown > 0 && (
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className="bg-black/50 border border-white/20 text-white px-8 py-6 rounded-2xl backdrop-blur-sm text-center shadow-2xl">
                <p className="text-sm uppercase tracking-wider text-white/80 mb-1">Chuẩn bị rời bến</p>
                <p className="text-5xl font-extrabold leading-none">{departureCountdown}</p>
                <p className="text-white/90 mt-2">Tàu sẽ khởi hành sau {departureCountdown} giây</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* CHƯƠNG II: 1911-1920 - HÀNH TRÌNH TÌM ĐƯỜNG */}
      <div id="chuong-2" className="max-w-6xl mx-auto px-6 mt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="rounded-2xl border border-[#D4AF37]/30 shadow-2xl overflow-hidden bg-gradient-to-br from-white to-orange-50"
        >
          <div className="p-8 md:p-10">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <p className="text-sm font-bold tracking-wider text-[#D63426]" style={{ fontFamily: 'Arial, sans-serif' }}>GIAI ĐOẠN 2 • 1911–1920</p>
                <h2 className="text-3xl md:text-4xl font-extrabold mt-2" style={{ fontFamily: 'Arial, sans-serif', color: '#D63426' }}>
                  “HÀNH TRÌNH TÌM ĐƯỜNG”
                </h2>
                <p className="mt-3 text-gray-700" style={{ fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif' }}>
                  <span className="font-semibold">30 Quốc Gia</span> • <span className="font-semibold">1001 Nghề Nghiệp</span> • <span className="font-semibold">1 Khát Vọng</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/70 border border-[#D4AF37]/30 rounded-lg px-4 py-3">
                  <p className="text-gray-500">Thời gian</p>
                  <p className="font-bold text-gray-900">9 năm</p>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-gradient-to-r from-[#D63426] to-[#B52A1E] text-white rounded-xl p-5 shadow-lg">
              <div className="flex items-start gap-3">
                <BiSolidQuoteAltLeft className="text-3xl opacity-90 mt-1" />
                <div>
                  <p className="text-lg font-bold italic">“Đi để thấy rõ con đường.”</p>
                  <p className="text-sm text-white/85 mt-1">Gợi mở tinh thần tự tìm chân lý qua trải nghiệm thực tiễn.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="bg-white border-t border-[#D4AF37]/30 p-6 md:p-8">
            <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
              <h3 className="text-xl font-bold" style={{ fontFamily: 'Arial, sans-serif', color: '#D63426' }}>
                Bản đồ hành trình
              </h3>
              <p className="text-xs text-gray-500 italic">
                Gợi ý: click vào điểm dừng để xem thời gian/công việc/bài học.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-xl border border-gray-200 overflow-hidden bg-gradient-to-br from-gray-50 to-white">
                <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FaMapMarkerAlt className="text-[#D63426]" />
                    <span className="font-semibold">{activeStop.label}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{activeStop.year}</span>
                  </div>
                  <div className="text-xs text-gray-500">{activeStop.country}</div>
                </div>

                <div className="p-4">
                  <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="w-full h-auto" role="img" aria-label="Bản đồ thế giới và đường hành trình 1911-1920">
                    <rect x="0" y="0" width={MAP_W} height={MAP_H} fill="#ffffff" />

                    {/* Countries */}
                    <g>
                      {(worldFeatures ?? []).map((f, i) => (
                        <path
                          key={f.id ?? f.properties?.name ?? i}
                          d={mapPath(f)}
                          fill="#F3F4F6"
                          stroke="#E5E7EB"
                          strokeWidth={0.6}
                        />
                      ))}
                    </g>

                    {/* Route path (animated) */}
                    {routePathD && (
                      <path
                        d={routePathD}
                        className="route-dash"
                        fill="none"
                        stroke="#D63426"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                      />
                    )}

                    {/* Markers */}
                    <g>
                      {projectedStops.map((stop) => {
                        const isActive = stop.id === activeStopId;
                        return (
                          <g key={stop.id} onClick={() => setActiveStopId(stop.id)} style={{ cursor: 'pointer' }}>
                            <circle cx={stop.p[0]} cy={stop.p[1]} r={isActive ? 6 : 4.5} fill={isActive ? '#B52A1E' : '#D63426'} stroke="#fff" strokeWidth={2} />
                            <circle cx={stop.p[0]} cy={stop.p[1]} r={isActive ? 15 : 11} fill="transparent" stroke={isActive ? '#B52A1E' : '#D63426'} strokeWidth={1.2} opacity={0.35} />
                          </g>
                        );
                      })}
                    </g>
                  </svg>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="p-5 border-b border-gray-200">
                  <p className="text-xs uppercase tracking-wider text-gray-500">Chi tiết điểm dừng</p>
                  <h4 className="text-lg font-bold mt-1" style={{ color: '#D63426' }}>{activeStop.label}</h4>
                </div>
                <div className="p-5 space-y-3">
                  <div className="text-sm">
                    <p className="text-gray-500">Thời gian</p>
                    <p className="font-semibold text-gray-900">{activeStop.year}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-500">Công việc</p>
                    <p className="font-semibold text-gray-900">{activeStop.job}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-500">Điều học được</p>
                    <p className="text-gray-800">{activeStop.learned}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-500">Ghi chú</p>
                    <p className="text-gray-800">{activeStop.note}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-[#D4AF37] rounded-r">
              <p className="text-xs text-gray-700 italic">
                <strong>Nguồn tham khảo (tiểu sử/biên niên):</strong> Hồ Chí Minh Toàn tập (NXB Chính trị quốc gia Sự thật) • Biên niên tiểu sử Hồ Chí Minh.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-lg p-7">
            <h3 className="text-2xl font-bold" style={{ color: '#D63426', fontFamily: 'Arial, sans-serif' }}>2. STORY — Câu chuyện cảm xúc</h3>
            <p className="text-sm text-gray-600 mt-2">Tái hiện (không phải trích văn bản gốc):</p>
            <div className="mt-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-5">
              <p className="font-bold text-gray-900 mb-2">“Bếp phó trên tàu biển”</p>
              <p className="text-gray-800 leading-relaxed">
                Trong những năm bôn ba, Nguyễn Tất Thành làm nhiều công việc lao động nặng nhọc để tự nuôi mình, quan sát xã hội và tiếp xúc người lao động ở nhiều quốc gia.
                Trải nghiệm ấy góp phần hình thành nhận thức: muốn cứu nước phải gắn với đời sống nhân dân lao động và cuộc đấu tranh của những người bị áp bức.
              </p>
            </div>

            <div className="mt-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-[#D63426] rounded-r p-6">
              <p className="text-sm uppercase tracking-wider text-gray-500 mb-2">Trích đoạn có nguồn</p>
              <p className="text-base italic text-gray-800 leading-relaxed">
                “Luận cương của Lênin làm cho tôi rất cảm động, phấn khởi, sáng tỏ, tin tưởng biết bao! … Tôi vui mừng đến phát khóc lên.”
              </p>
              <p className="text-xs text-[#D63426] font-semibold mt-2">
                — Hồ Chí Minh, “Con đường dẫn tôi đến chủ nghĩa Lênin” (1960).
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-7">
            <h3 className="text-2xl font-bold" style={{ color: '#D63426', fontFamily: 'Arial, sans-serif' }}>3. CONTEXT — Bối cảnh lịch sử</h3>
            <ul className="mt-4 space-y-3 text-sm text-gray-800">
              <li className="flex gap-2"><span className="font-bold text-[#D63426]">1914–1918</span><span>Thế chiến thứ nhất</span></li>
              <li className="flex gap-2"><span className="font-bold text-[#D63426]">1917</span><span>Cách mạng Tháng Mười Nga</span></li>
              <li className="flex gap-2"><span className="font-bold text-[#D63426]">1918</span><span>“14 điểm” của Wilson (trong đó có nguyên tắc quyền tự quyết)</span></li>
              <li className="flex gap-2"><span className="font-bold text-[#D63426]">1919</span><span>Hội nghị Versailles; Quốc tế Cộng sản (Comintern) thành lập</span></li>
              <li className="flex gap-2"><span className="font-bold text-[#D63426]">1920</span><span>Bước ngoặt theo CNXH; tham gia Đảng Cộng sản Pháp (Tours)</span></li>
            </ul>
            <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-[#D4AF37] rounded-r">
              <p className="text-xs text-gray-700 italic">
                <strong>Lưu ý:</strong> Phần mốc sự kiện là bối cảnh thế giới; phần trích đoạn (1960) là hồi ký chính trị của Hồ Chí Minh về bước ngoặt 1920.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main content tabs */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="mt-10"
        >
          <h3 className="text-3xl font-bold text-center" style={{ color: '#D63426', fontFamily: 'Arial, sans-serif' }}>4. CONTENT — Nội dung chính</h3>

          <div className="flex gap-3 mt-6 mb-6 overflow-x-auto">
            {chapter2Tabs.map((t) => (
              <motion.button
                key={t.id}
                onClick={() => setChapter2Tab(t.id)}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className={
                  `px-5 py-3 rounded-lg font-bold whitespace-nowrap transition-all ` +
                  (chapter2Tab === t.id
                    ? 'bg-gradient-to-r from-[#D63426] to-[#B52A1E] text-white shadow-lg'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[#D4AF37] hover:shadow-md')
                }
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                {t.title}
              </motion.button>
            ))}
          </div>

          <motion.div
            key={chapter2Tab}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="bg-gradient-to-br from-white to-orange-50 p-7 md:p-8 rounded-2xl shadow-xl border border-[#D4AF37]/30"
          >
            {chapter2Tab === 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h4 className="text-2xl font-bold mb-3" style={{ color: '#D63426' }}>Bản đồ hành trình (tương tác)</h4>
                  <p className="text-gray-700 text-sm mb-5">Click marker trên bản đồ ở phần Header để chuyển điểm dừng; danh sách dưới đây tóm tắt 4 điểm chính.</p>
                  <div className="space-y-4">
                    {journeyStops.map((s, idx) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setActiveStopId(s.id)}
                        className={
                          `w-full text-left p-5 rounded-xl border transition-all ` +
                          (s.id === activeStopId
                            ? 'bg-white border-[#D63426]/40 shadow-md'
                            : 'bg-white/70 border-gray-200 hover:border-[#D4AF37] hover:shadow-sm')
                        }
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm text-gray-500">{idx + 1}. {s.year} • {s.country}</p>
                            <p className="font-bold text-gray-900 mt-1">{s.label}</p>
                          </div>
                          <span className="text-xs px-3 py-1 rounded-full bg-[#F5DEDE] text-[#D63426] font-bold">{s.job}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-2">{s.learned}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h5 className="font-bold text-lg" style={{ color: '#D63426' }}>Thế giới 1911–1920</h5>
                  <div className="mt-3 space-y-2 text-sm text-gray-800">
                    <p>⚡ 1914–1918: Thế chiến thứ nhất</p>
                    <p>⚡ 1917: Cách mạng Tháng Mười Nga</p>
                    <p>⚡ 1919: Versailles; Comintern</p>
                    <p>⚡ 1920: Bước ngoặt theo CNXH</p>
                  </div>
                </div>
              </div>
            )}

            {chapter2Tab === 1 && (
              <div>
                <h4 className="text-2xl font-bold mb-4" style={{ color: '#D63426' }}>“1001 nghề nghiệp” (minh hoạ)</h4>
                <p className="text-sm text-gray-700 mb-6">Di chuột/nhấn vào mỗi nghề để xem mô tả ngắn.</p>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {jobsGrid.map((job) => (
                    <motion.div
                      key={job.title}
                      whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(214, 52, 38, 0.16)' }}
                      className="bg-white border border-gray-200 rounded-xl p-4 cursor-default"
                      title={job.story}
                    >
                      <div className="text-3xl">{job.icon}</div>
                      <p className="font-bold mt-2 text-gray-900">{job.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{job.story}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-[#D4AF37] rounded-r">
                  <p className="text-xs text-gray-700 italic">
                    <strong>Gợi ý kiểm chứng:</strong> phần nghề nghiệp là minh hoạ theo mô típ “làm nhiều nghề để sinh sống khi bôn ba”; bạn có thể bổ sung nghề/cột mốc theo tư liệu trong Biên niên tiểu sử.
                  </p>
                </div>
              </div>
            )}

            {chapter2Tab === 2 && (
              <div>
                <h4 className="text-2xl font-bold mb-4" style={{ color: '#D63426' }}>Những bài học lớn (mở dần)</h4>
                <Accordion variant="splitted" className="bg-transparent">
                  <AccordionItem key="1" aria-label="Bài học về áp bức" title="BÀI HỌC VỀ ÁP BỨC">
                    <p className="text-gray-800 leading-relaxed">
                      Qua thực tiễn ở nhiều quốc gia, Người quan sát các hình thức bất bình đẳng và bóc lột, từ đó đặt vấn đề về gốc rễ của áp bức và con đường giải phóng.
                    </p>
                  </AccordionItem>
                  <AccordionItem key="2" aria-label="Bài học về đoàn kết" title="BÀI HỌC VỀ ĐOÀN KẾT">
                    <p className="text-gray-800 leading-relaxed">
                      Ý thức liên hệ cuộc đấu tranh của dân tộc bị áp bức với phong trào công nhân và phong trào tiến bộ trên thế giới.
                    </p>
                  </AccordionItem>
                  <AccordionItem key="3" aria-label="Bài học về tổ chức" title="BÀI HỌC VỀ TỔ CHỨC">
                    <p className="text-gray-800 leading-relaxed">
                      Quan sát phong trào công nhân ở Pháp giúp củng cố nhận thức: phong trào cần tổ chức và lãnh đạo.
                    </p>
                  </AccordionItem>
                  <AccordionItem key="4" aria-label="Bài học về lý luận" title="BÀI HỌC VỀ LÝ LUẬN">
                    <p className="text-gray-800 leading-relaxed">
                      Bước ngoặt 1920 gắn với việc tiếp cận luận điểm về vấn đề dân tộc và thuộc địa, từ đó xác lập con đường cách mạng.
                    </p>
                  </AccordionItem>
                </Accordion>
              </div>
            )}

            {chapter2Tab === 3 && (
              <div>
                <h4 className="text-2xl font-bold mb-4" style={{ color: '#D63426' }}>Sự kiện trọng đại</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <p className="text-sm font-bold text-[#D63426]">1919 • THÀNH NGUYỄN ÁI QUỐC</p>
                    <p className="mt-2 font-semibold text-gray-900">📜 “Yêu sách của nhân dân An Nam” (18/6/1919)</p>
                    <p className="text-sm text-gray-700 mt-2">Tóm tắt 8 điểm yêu cầu gửi Hội nghị Versailles:</p>
                    <ol className="mt-3 text-sm text-gray-800 list-decimal pl-5 space-y-1">
                      <li>Ân xá toàn thể các tù chính trị.</li>
                      <li>Cải cách nền pháp lý ở Đông Dương, thay chế độ ra sắc lệnh bằng chế độ luật pháp.</li>
                      <li>Tự do báo chí và tự do ngôn luận.</li>
                      <li>Tự do lập hội và hội họp.</li>
                      <li>Tự do cư trú ở nước ngoài và tự do xuất dương.</li>
                      <li>Tự do học tập; mở trường kỹ thuật và chuyên nghiệp cho người bản xứ.</li>
                      <li>Thay chế độ cai trị bằng sắc lệnh bằng chế độ có đại biểu của người bản xứ ở Nghị viện.</li>
                      <li>Bình đẳng về quyền lợi và nghĩa vụ giữa người bản xứ và người Pháp.</li>
                    </ol>
                    <p className="text-xs text-gray-500 italic mt-4">
                      Nguồn: Nguyễn Ái Quốc, “Yêu sách của nhân dân An Nam” (1919), in Hồ Chí Minh Toàn tập (NXB Chính trị quốc gia Sự thật).
                    </p>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <p className="text-sm font-bold text-[#D63426]">1920 • BƯỚC NGOẶT TƯ TƯỞNG</p>
                    <p className="mt-2 font-semibold text-gray-900">📖 Tiếp cận luận điểm về vấn đề dân tộc & thuộc địa</p>
                    <div className="mt-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-[#D63426] p-5 rounded-r">
                      <p className="text-sm italic text-gray-800 leading-relaxed">
                        “Luận cương của Lênin làm cho tôi rất cảm động, phấn khởi, sáng tỏ, tin tưởng biết bao! … Tôi vui mừng đến phát khóc lên.”
                      </p>
                      <p className="text-xs text-[#D63426] font-semibold mt-2">— Hồ Chí Minh, “Con đường dẫn tôi đến chủ nghĩa Lênin” (1960).</p>
                    </div>
                    <p className="mt-4 text-sm text-gray-700">
                      🔴 Tham gia Đảng Cộng sản Pháp tại Đại hội Tours (12/1920) — một dấu mốc chính trị quan trọng.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {chapter2Tab === 4 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h4 className="text-2xl font-bold" style={{ color: '#D63426' }}>Profile update</h4>
                  <div className="mt-4 space-y-3 text-sm text-gray-800">
                    <p><span className="font-bold">🧑 Tên gọi:</span> Nguyễn Tất Thành → Nguyễn Ái Quốc (1919)</p>
                    <p><span className="font-bold">🌍 Ngôn ngữ:</span> Việt • Pháp • Anh (và tiếp xúc các cộng đồng khác)</p>
                    <p><span className="font-bold">💼 Kỹ năng:</span> Viết • diễn thuyết • tổ chức</p>
                    <p><span className="font-bold">📖 Tri thức:</span> Tiếp cận chủ nghĩa Mác–Lênin (bước ngoặt 1920)</p>
                    <p><span className="font-bold">🎯 Mục tiêu:</span> Con đường cứu nước gắn với giải phóng người lao động và dân tộc bị áp bức</p>
                  </div>
                  <div className="mt-6 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border border-[#D4AF37]/40 rounded-xl">
                    <p className="text-gray-800 italic">
                      “Từ một thanh niên yêu nước mơ hồ → thành một chiến sĩ cách mạng giác ngộ (bước ngoặt 1920).”
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h4 className="text-2xl font-bold" style={{ color: '#D63426' }}>7. CONNECT</h4>
                  <div className="mt-4 border border-[#D4AF37]/30 rounded-xl overflow-hidden">
                    <div className="p-5 bg-gradient-to-r from-[#D63426] to-[#B52A1E] text-white">
                      <p className="font-bold text-lg">🌟 Chuyển biến lớn</p>
                      <p className="text-sm text-white/85 mt-1">Trước 1920: “Tìm đường cứu nước như thế nào?”</p>
                      <p className="text-sm text-white/85">Sau 1920: “CNXH + Tổ chức chính trị = con đường giải phóng”</p>
                    </div>
                    <div className="p-5 bg-white">
                      <p className="text-sm text-gray-800">
                        ➡️ Nhiệm vụ tiếp theo (gợi mở giai đoạn sau): tuyên truyền lý luận cách mạng, chuẩn bị cho sự ra đời tổ chức lãnh đạo.
                      </p>
                      <button
                        type="button"
                        className="mt-4 px-5 py-3 bg-[#F5DEDE] text-[#D63426] font-bold rounded-lg border-2 border-dashed border-[#D63426] opacity-70 cursor-not-allowed"
                        title="Chương tiếp theo sẽ được bổ sung"
                      >
                        Khám phá 1920–1930 →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Multimedia & Interactive */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-7">
            <h3 className="text-2xl font-bold" style={{ color: '#D63426', fontFamily: 'Arial, sans-serif' }}>5. MULTIMEDIA</h3>
            <p className="text-sm text-gray-700 mt-2">Gallery (placeholder) — bạn có thể thay ảnh thật sau.</p>
            <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { t: 'Tàu Amiral Latouche-Tréville', s: 'Bến Nhà Rồng / tư liệu ảnh' },
                { t: 'Paris đầu thế kỷ XX', s: 'Tư liệu đô thị' },
                { t: 'Hội nghị Versailles 1919', s: 'Tư liệu hội nghị' },
                { t: '“Yêu sách…” 1919', s: 'Văn bản/scan' },
                { t: 'Phong trào công nhân', s: 'Tư liệu lao động' },
                { t: 'Đại hội Tours 1920', s: 'Tư liệu đảng phái' }
              ].map((it) => (
                <div key={it.t} className="border border-gray-200 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-white">
                  <div className="h-24 bg-gradient-to-r from-[#F5DEDE] to-orange-50" />
                  <div className="p-3">
                    <p className="text-sm font-bold text-gray-900">{it.t}</p>
                    <p className="text-xs text-gray-500 italic mt-1">Nguồn: {it.s}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-7">
            <h3 className="text-2xl font-bold" style={{ color: '#D63426', fontFamily: 'Arial, sans-serif' }}>6. INTERACTIVE</h3>

            <div className="mt-4 space-y-6">
              {/* A. Walk in His Shoes */}
              <div className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50">
                <p className="font-bold text-gray-900">A. “Walk in His Shoes” (mô phỏng)</p>
                <p className="text-sm text-gray-700 mt-1">Bạn là Nguyễn Tất Thành năm 1913. Bạn dùng 3 shilling còn lại để làm gì?</p>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'books', t: 'Mua sách học tiếng Anh', r: 'Tăng vốn tri thức & khả năng giao tiếp, mở rộng cơ hội.' },
                    { id: 'send', t: 'Gửi về Việt Nam', r: 'Chia sẻ khó khăn với gia đình/đồng bào, nhưng ít tích lũy tri thức.' },
                    { id: 'club', t: 'Tham gia CLB chính trị', r: 'Tiếp xúc phong trào, nhưng rủi ro bị theo dõi/khó kiếm việc.' }
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setWalkChoice(c)}
                      className={
                        `px-4 py-3 rounded-lg border text-left transition-all ` +
                        (walkChoice?.id === c.id
                          ? 'bg-[#F5DEDE] border-[#D63426] shadow-sm'
                          : 'bg-white border-gray-200 hover:border-[#D4AF37]')
                      }
                    >
                      <p className="font-bold text-gray-900">{c.t}</p>
                    </button>
                  ))}
                </div>
                {walkChoice && (
                  <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-[#D4AF37] rounded-r text-sm text-gray-800">
                    <p className="font-bold">Kết quả (mô phỏng):</p>
                    <p className="mt-1">{walkChoice.r}</p>
                  </div>
                )}
              </div>

              {/* B. World Map Quiz */}
              <div className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50">
                <p className="font-bold text-gray-900">B. “World Map Quiz” (mini)</p>
                <p className="text-sm text-gray-700 mt-1">Click vào các điểm dừng chính (trên map ở phần Header) để ghi điểm.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {journeyStops.map((s) => {
                    const picked = quizPicked.has(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handlePickQuiz(s.id)}
                        className={
                          `px-3 py-2 rounded-lg border text-sm font-semibold transition-all ` +
                          (picked
                            ? 'bg-gradient-to-r from-[#D63426] to-[#B52A1E] text-white border-transparent'
                            : 'bg-white border-gray-200 text-gray-800 hover:border-[#D4AF37]')
                        }
                      >
                        {picked ? '✓ ' : ''}{s.country}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-sm text-gray-800">
                  Điểm: <span className="font-bold text-[#D63426]">{quizPicked.size * 10}</span> • Đã tìm: <span className="font-bold">{quizPicked.size}</span>/{journeyStops.length}
                </p>
              </div>

              {/* C. Document Detective */}
              <div className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50">
                <p className="font-bold text-gray-900">C. “Document Detective” (phân tích tự động)</p>
                <p className="text-sm text-gray-700 mt-1">Đọc “Yêu sách…” (1919) và trả lời ngắn: điều nào quan trọng nhất? vì sao? so sánh với “14 điểm” của Wilson?</p>
                <textarea
                  value={detectiveAnswer}
                  onChange={(e) => setDetectiveAnswer(e.target.value)}
                  rows={4}
                  className="mt-3 w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40"
                  placeholder="Nhập câu trả lời của bạn…"
                />
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={runDetective}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#D63426] to-[#B52A1E] text-white rounded-lg font-bold"
                  >
                    Submit
                  </button>
                  {detectiveFeedback && (
                    <p className="text-sm text-gray-800">
                      Điểm gợi ý: <span className="font-bold text-[#D63426]">{detectiveFeedback.score}</span>/5
                    </p>
                  )}
                </div>
                {detectiveFeedback && (
                  <ul className="mt-3 text-sm text-gray-800 space-y-1">
                    {detectiveFeedback.notes.map((n, i) => (
                      <li key={i}>• {n}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <style>{`
          .route-dash {
            stroke-dasharray: 2200;
            stroke-dashoffset: 2200;
            animation: routeDraw 2.2s ease forwards;
          }
          @keyframes routeDraw {
            to { stroke-dashoffset: 0; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default TimelineSection;
