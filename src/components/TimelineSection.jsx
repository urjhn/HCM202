import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useAnimationControls, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { FaHome, FaBook, FaGraduationCap, FaShip, FaMapMarkerAlt, FaEnvelope, FaMoneyBillWave, FaPiggyBank, FaHandshake, FaFileContract, FaUserSecret, FaFlag, FaBalanceScale, FaHeart, FaFire, FaShieldAlt, FaStar, FaRegLightbulb } from 'react-icons/fa';
import { HiBriefcase, HiLightBulb, HiStar, HiUserGroup } from 'react-icons/hi';
import { BiSolidQuoteAltLeft } from 'react-icons/bi';
import { Accordion, AccordionItem } from '@heroui/react';
import { geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { trackEvent } from '../utils/tracking'; // Tracking

const ThreeDTiltCard = ({ children, className, backgroundImage }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 50 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 50 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = event.clientX - rect.left;
    const mouseYPos = event.clientY - rect.top;

    const xPct = (mouseXPos / width) - 0.5;
    const yPct = (mouseYPos / height) - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative rounded-2xl transition-all duration-200 ease-out transform perspective-1000 ${className}`}
    >
      <div
        style={{ transform: "translateZ(50px)" }}
        className="absolute inset-4 rounded-xl shadow-2xl bg-black/20 z-0 content-[''] pointer-events-none filter blur-xl" // Shadow depth
      />
      <div className="relative z-10 h-full w-full bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 flex flex-col">
        {children}

        {/* Glosss Effect */}
        <motion.div
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.1) 50%, transparent 54%)",
            backgroundSize: "200% 200%",
            opacity: useTransform(mouseX, [-0.5, 0.5], [0, 1]),
            x: useTransform(mouseX, [-0.5, 0.5], ["100%", "-100%"]),
          }}
          className="absolute inset-0 pointer-events-none z-50 mix-blend-overlay"
        />
      </div>
    </motion.div>
  );
};

const TimelineSection = () => {
  const Motion = motion;
  const [activeTab, setActiveTab] = useState(0);
  const [chapter2Tab, setChapter2Tab] = useState(0);
  const [activeStopId, setActiveStopId] = useState('saigon');
  // Interactive Game State
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [scenarioHistory, setScenarioHistory] = useState([]);
  const [showScenarioResult, setShowScenarioResult] = useState(false);
  const [worldFeatures, setWorldFeatures] = useState(null);
  const [isDeparting, setIsDeparting] = useState(false);
  const [isChoosingSeat, setIsChoosingSeat] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [departureCountdown, setDepartureCountdown] = useState(null);
  const [isTicketTearing, setIsTicketTearing] = useState(false);
  const [isDepartureComplete, setIsDepartureComplete] = useState(false);
  const [shipAnimationKey, setShipAnimationKey] = useState(0);
  const [mapZoom, setMapZoom] = useState(1);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);

  const audioCtxRef = useRef(null);
  const audioPrimedRef = useRef(false);
  const journeyPathRef = useRef(null);
  const shipAnimRef = useRef(null);

  const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

  const MAP_W = 900;
  const MAP_H = 460;

  // Cuộn màn hình theo con tàu khi animation bắt đầu
  useEffect(() => {
    if (!isDepartureComplete || !journeyPathRef.current) return;

    const svgElement = journeyPathRef.current;
    const svgRect = svgElement.getBoundingClientRect();
    const startScrollY = window.scrollY;
    const svgTopRelativeToDocument = startScrollY + svgRect.top;
    const svgHeight = 550; // Chiều cao của SVG
    const animationDuration = 8000; // 8 giây - khớp với dur của animateMotion
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      // Easing function để cuộn mượt hơn
      const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const easedProgress = easeInOutQuad(progress);

      // Tính toán vị trí cuộn để theo dõi con tàu
      // Giữ con tàu ở khoảng 40% từ trên màn hình
      const shipPositionInSvg = easedProgress * svgHeight;
      const targetScrollY = svgTopRelativeToDocument + shipPositionInSvg - (window.innerHeight * 0.4);

      window.scrollTo({
        top: Math.max(0, targetScrollY),
        behavior: 'instant'
      });

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }, [isDepartureComplete]);

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
      year: '1913–1917',
      country: 'Anh',
      coords: [-0.1276, 51.5072],
      job: 'Lao động dịch vụ (bếp/khách sạn), làm thuê',
      learned: 'Kỷ luật lao động; quan sát tổ chức công đoàn, đời sống công nhân.',
      note: 'Giai đoạn lao động khó khăn, tích lũy trải nghiệm xã hội.'
    },
    {
      id: 'newyork',
      label: 'New York',
      year: '1912–1913 (?)',
      country: 'Mỹ',
      coords: [-74.0060, 40.7128],
      job: 'Nhiều nghề: rửa bát, làm vườn, lao động phổ thông…',
      learned: 'Nhìn thấy bất bình đẳng xã hội; trải nghiệm đời sống người nhập cư/lao động.',
      note: 'Lưu ý: Một số tư liệu tiểu sử ghi nhận thời gian hoạt động tại Mỹ, tuy nhiên mốc thời gian cụ thể chưa được xác minh đầy đủ.'
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
      { id: 0, title: 'Nghề Nghiệp', icon: <HiBriefcase /> },
      { id: 1, title: 'Những bài học lớn', icon: <HiLightBulb /> },
      { id: 2, title: 'Sự kiện trọng đại', icon: <HiStar /> },
      { id: 3, title: 'Con người thời kỳ này', icon: <HiUserGroup /> }
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

  // Data cho game nối thẻ Bài học lớn
  const lessonCards = useMemo(() => [
    { id: 'ap-buc', title: 'BÀI HỌC VỀ ÁP BỨC', content: 'Quan sát các hình thức bất bình đẳng và bóc lột, đặt vấn đề về gốc rễ của áp bức.' },
    { id: 'doan-ket', title: 'BÀI HỌC VỀ ĐOÀN KẾT', content: 'Liên hệ cuộc đấu tranh của dân tộc bị áp bức với phong trào công nhân thế giới.' },
    { id: 'to-chuc', title: 'BÀI HỌC VỀ TỔ CHỨC', content: 'Phong trào cần tổ chức và lãnh đạo để có sức mạnh.' },
    { id: 'ly-luan', title: 'BÀI HỌC VỀ LÝ LUẬN', content: 'Tiếp cận luận điểm về vấn đề dân tộc và thuộc địa, xác lập con đường cách mạng.' }
  ], []);

  // Data cho game Interactive (3 câu hỏi)
  const interactiveScenarios = useMemo(() => [
    {
      id: 'step1',
      title: 'London, 1913: Mùa Đông Lạnh',
      desc: 'Bạn đang làm phụ bếp tại khách sạn Carlton. Công việc cào tuyết rất cực nhọc. Trong túi chỉ còn vài đồng shilling tiền thừa.',
      question: 'Bạn sẽ làm gì với số tiền này?',
      options: [
        { id: 'A', label: 'Mua sách học tiếng Anh', icon: <FaBook />, type: 'vision', feedback: 'Đầu tư cho tri thức là con đường dài hạn.' },
        { id: 'B', label: 'Gửi tằn tiện về quê nhà', icon: <FaEnvelope />, type: 'heart', feedback: 'Tấm lòng hiếu thảo, nhưng chưa giúp được đại cục.' },
        { id: 'C', label: 'Tiết kiệm phòng thân', icon: <FaPiggyBank />, type: 'safe', feedback: 'An toàn là trên hết, nhưng khó tạo đột phá.' }
      ]
    },
    {
      id: 'step2',
      title: 'Paris, 1919: Thời Cơ Lịch Sử',
      desc: 'Hội nghị Hòa bình Paris (họp tại Versailles) khai mạc. Các cường quốc đang bàn lại trật tự thế giới. Cơ hội ngàn năm có một.',
      question: 'Hành động của bạn là gì?',
      options: [
        { id: 'A', label: 'Gửi "Bản Yêu sách" đòi quyền tự quyết', icon: <FaFileContract />, type: 'vision', feedback: 'Một hành động dũng cảm gây chấn động dư luận Pháp.' },
        { id: 'B', label: 'Viết bài ca ngợi nước Pháp', icon: <FaUserSecret />, type: 'safe', feedback: 'An toàn nhưng không thay đổi được thân phận nô lệ.' },
        { id: 'C', label: 'Quyên góp tiền cho hội người Việt', icon: <FaHandshake />, type: 'heart', feedback: 'Tốt cho cộng đồng, nhưng cần tiếng nói chính trị mạnh hơn.' }
      ]
    },
    {
      id: 'step3',
      title: 'Tours, 1920: Sự Lựa Chọn',
      desc: 'Đảng Xã hội Pháp họp Đại hội. Một bên ủng hộ Lênin (Quốc tế 3), một bên giữ nguyên quan điểm cũ (Quốc tế 2).',
      question: 'Lá phiếu của bạn đi về đâu?',
      options: [
        { id: 'A', label: 'Bỏ phiếu cho Quốc tế 3 (Lênin)', icon: <FaFlag />, type: 'vision', feedback: 'Vì Lênin ủng hộ giải phóng các dân tộc thuộc địa!' },
        { id: 'B', label: 'Trung lập / Không bỏ phiếu', icon: <FaBalanceScale />, type: 'safe', feedback: 'Sự do dự có thể làm lỡ nhịp lịch sử.' },
        { id: 'C', label: 'Ở lại Quốc tế 2 vì tình cảm cũ', icon: <FaHeart />, type: 'heart', feedback: 'Tình cảm đồng chí rất quý, nhưng độc lập dân tộc cần đường lối mới.' }
      ]
    }
  ], []);

  const handleScenarioChoice = useCallback((option) => {
    setScenarioHistory(prev => [...prev, option]);

    // Nếu chưa phải câu cuối -> next
    if (scenarioIndex < interactiveScenarios.length - 1) {
      setTimeout(() => {
        setScenarioIndex(prev => prev + 1);
      }, 400); // delay chút cho hiệu ứng
    } else {
      // Câu cuối -> show result
      setTimeout(() => {
        setShowScenarioResult(true);
      }, 400);
    }
  }, [scenarioIndex, interactiveScenarios.length]);

  const restartInteractiveGame = useCallback(() => {
    setScenarioIndex(0);
    setScenarioHistory([]);
    setShowScenarioResult(false);
  }, []);

  const handleSelectTitle = useCallback((id) => {
    setSelectedTitle(id);
    if (selectedContent === id) {
      setMatchedPairs(prev => [...prev, id]);
      setSelectedTitle(null);
      setSelectedContent(null);
    }
  }, [selectedContent]);

  const handleSelectContent = useCallback((id) => {
    setSelectedContent(id);
    if (selectedTitle === id) {
      setMatchedPairs(prev => [...prev, id]);
      setSelectedTitle(null);
      setSelectedContent(null);
    }
  }, [selectedTitle]);

  const resetMatchingGame = useCallback(() => {
    setMatchedPairs([]);
    setSelectedTitle(null);
    setSelectedContent(null);
  }, []);





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

  const primeTrainAudio = useCallback(async () => {
    try {
      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new Ctx();
      }
      await audioCtxRef.current.resume();
      audioPrimedRef.current = true;
    } catch {
      // ignore (autoplay policy / unavailable)
    }
  }, []);

  const playTrainDepartureSound = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx || !audioPrimedRef.current) return;

    const now = ctx.currentTime;

    // Master gain
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.35, now + 0.05);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
    master.connect(ctx.destination);

    // Steam/noise bed
    const dur = 1.8;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * 0.5;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.setValueAtTime(240, now);
    band.Q.setValueAtTime(0.9, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.22, now + 0.08);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    noise.connect(band);
    band.connect(noiseGain);
    noiseGain.connect(master);

    // Chug pulses (low oscillator with gated gain)
    const chugOsc = ctx.createOscillator();
    chugOsc.type = 'sawtooth';
    chugOsc.frequency.setValueAtTime(55, now);

    const chugGain = ctx.createGain();
    chugGain.gain.setValueAtTime(0.0001, now);

    const pulseCount = 7;
    for (let i = 0; i < pulseCount; i += 1) {
      const t = now + 0.1 + i * 0.18;
      chugGain.gain.setValueAtTime(0.0001, t);
      chugGain.gain.exponentialRampToValueAtTime(0.18, t + 0.03);
      chugGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    }

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(180, now);
    lowpass.Q.setValueAtTime(0.7, now);

    chugOsc.connect(lowpass);
    lowpass.connect(chugGain);
    chugGain.connect(master);

    // Whistle (short sine sweep)
    const whistle = ctx.createOscillator();
    whistle.type = 'sine';
    whistle.frequency.setValueAtTime(560, now + 0.05);
    whistle.frequency.exponentialRampToValueAtTime(820, now + 0.35);

    const whistleGain = ctx.createGain();
    whistleGain.gain.setValueAtTime(0.0001, now + 0.05);
    whistleGain.gain.exponentialRampToValueAtTime(0.14, now + 0.12);
    whistleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    whistle.connect(whistleGain);
    whistleGain.connect(master);

    // Start/stop nodes
    noise.start(now);
    noise.stop(now + dur);
    chugOsc.start(now);
    chugOsc.stop(now + dur);
    whistle.start(now);
    whistle.stop(now + 0.6);
  }, []);

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

    setIsTicketTearing(true);
    playTrainDepartureSound();

    const shipAnim = shipControls.start({
      x: '120vw',
      rotate: 6,
      transition: { duration: 1.8, ease: 'easeInOut' }
    });

    await Promise.all([shipAnim]);

    // Đánh dấu đã hoàn thành animation khởi hành và trigger animation con tàu
    setIsDepartureComplete(true);
    setShipAnimationKey(prev => prev + 1); // Force remount để animation chạy lại từ đầu

    const nextId = 'chuong-2';
    window.location.hash = nextId;
    document.getElementById(nextId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [oceanControls, playTrainDepartureSound, shipControls]);

  const handleOpenSeatSelection = useCallback(() => {
    if (isDeparting) return;
    setIsChoosingSeat(true);
  }, [isDeparting]);

  const handleConfirmSeat = useCallback(async () => {
    if (isDeparting) return;
    if (!selectedSeat) return;
    // Prime audio on user gesture to avoid autoplay blocking
    await primeTrainAudio();
    setIsDeparting(true);
    setDepartureCountdown(null);
    runDepartureAnimation();
  }, [isDeparting, primeTrainAudio, runDepartureAnimation, selectedSeat]);

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
        id="stage-1"
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
            <div className="max-w-2xl bg-gradient-to-br from-orange-50 to-yellow-50 border-l-4 border-[#D63426] shadow-xl rounded-lg p-5 sm:p-6 md:p-8 relative">
            <div className="absolute -top-6 -left-4 text-6xl text-[#D63426] opacity-30 font-serif">"</div>

            <p className="text-lg italic text-gray-800 leading-relaxed mb-6 relative z-10" style={{ fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif" }}>
              "Tôi muốn đi ra ngoài, xem nước Pháp và các nước khác. Sau khi xem xét họ làm như thế nào, tôi sẽ trở về giúp đồng bào chúng tôi."
            </p>

            <div className="border-t-2 border-[#D63426]/20 pt-4">
              <div className="flex flex-col items-end">
                <span className="font-bold text-[#D63426] uppercase tracking-wider text-sm">Hồ Chí Minh</span>
                <span className="text-xs text-gray-500 italic mt-1">
                  Trích: Những mẩu chuyện về đời hoạt động của Hồ Chủ tịch - Trần Dân Tiên (bút danh, 1948)
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
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#D63426] to-[#B52A1E] -ml-px" />

          {/* Vertical Timeline */}
          <div className="space-y-0">
            {[
              { year: '1858', event: 'Pháp xâm lược', desc: 'Pháp bắt đầu xâm lược Việt Nam, mở đầu cho thời kỳ thực dân. Đây là bước ngoặt lịch sử khi đất nước bắt đầu rơi vào tay kẻ thù.', color: 'from-red-500 to-red-600' },
              { year: '1884', event: 'Hiệp ước Patenôtre', desc: 'Hiệp ước Patenôtre (6/6/1884) công nhận quyền bảo hộ của Pháp trên toàn Việt Nam. Dân tộc mất nước, nhân dân phải sống trong cảnh khổ cực và áp bức.', color: 'from-red-600 to-red-700' },
              { year: '1890', event: 'Hồ Chí Minh ra đời', desc: 'Nguyễn Sinh Cung ra đời tại Kim Liên, Nam Đàn, Nghệ An. Ngày 19 tháng 5 năm 1890, người sẽ trở thành lãnh tụ vĩ đại của dân tộc Việt Nam.', color: 'from-yellow-400 to-orange-500', highlight: true },
              { year: '1908-1909', event: 'Phong trào Đông Du thất bại', desc: 'Phong trào du học Nhật Bản của Phan Bội Châu bị đàn áp, Nhật Bản trục xuất du học sinh Việt Nam. Con đường cứu nước theo lối cũ không còn khả thi.', color: 'from-red-500 to-red-600' },
              { year: '1911', event: 'Chuẩn bị ra đi', desc: 'Nguyễn Tất Thành quyết định ra đi tìm đường cứu nước. Ngày 5 tháng 6, lên tàu Amiral Latouche-Tréville, bắt đầu hành trình 29 năm lưu lạc.', color: 'from-blue-500 to-blue-600', highlight: true }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
                className="relative flex flex-col md:flex-row items-center py-8"
              >
                {/* Left Content (for even index) */}
                {index % 2 === 0 && (
                  <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={`w-full md:w-5/12 bg-gradient-to-br ${item.highlight ? 'from-yellow-50 to-orange-50 border-yellow-500' : 'from-white to-red-50 border-[#D63426]'} p-5 sm:p-6 rounded-xl shadow-lg border-l-4 hover:shadow-2xl transition-all md:mr-auto order-2 md:order-none`}
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
                <div className="relative md:absolute md:left-1/2 md:-translate-x-1/2 z-10 mb-4 md:mb-0 order-1 md:order-none">
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
                    className={`w-full md:w-5/12 bg-gradient-to-br ${item.highlight ? 'from-yellow-50 to-orange-50 border-yellow-500' : 'from-white to-red-50 border-[#D63426]'} p-5 sm:p-6 rounded-xl shadow-lg border-l-4 hover:shadow-2xl transition-all md:ml-auto order-2 md:order-none`}
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
        <div className="flex gap-3 sm:gap-4 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-bold whitespace-nowrap transition-all ${activeTab === tab.id
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
          className="bg-gradient-to-br from-white to-orange-50 p-5 sm:p-6 md:p-8 rounded-lg shadow-xl border-2 border-[#D4AF37]/30 min-h-[500px]"
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
                    '1908: Chứng kiến phong trào chống thuế Trung Kỳ; rời Quốc học Huế.',
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <strong>Nguồn:</strong> Trần Dân Tiên (bút danh, 1948) - <em>Những mẩu chuyện về đời hoạt động của Hồ Chủ tịch</em>
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: controls */}
              <div className="lg:col-span-7">
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

              {/* Right: ticket */}
              <div className="lg:col-span-5">
                <div className="relative">
                  {/* Full ticket (normal) */}
                  {!isTicketTearing && (
                    <div className="bg-[#F5DEDE] border-[3px] border-dashed border-[#D63426] rounded-2xl shadow-xl overflow-hidden">
                      <div className="p-5 bg-white/80 border-b border-[#D63426]/25">
                        <p className="text-xs uppercase tracking-widest text-[#D63426] font-bold">VÉ TÀU • 1911</p>
                        <p className="text-2xl font-extrabold text-[#D63426]" style={{ fontFamily: "'Roboto', 'Segoe UI', system-ui, sans-serif" }}>BẾN NHÀ RỒNG</p>
                      </div>

                      <div className="p-5 bg-white/70">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Hành khách</p>
                            <p className="font-bold text-gray-900">Văn Ba</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Ngày</p>
                            <p className="font-bold text-gray-900">05/06/1911</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Đi</p>
                            <p className="font-bold text-gray-900">Sài Gòn</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Đến (chặng đầu)</p>
                            <p className="font-bold text-gray-900">Marseille</p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-[#D63426]/20 flex items-center justify-between">
                          <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Hạng</p>
                            <p className="font-bold text-gray-900">Hạng 3</p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Chỗ</p>
                            <p className="font-bold text-gray-900">{selectedSeat ?? '—'}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="flex-1 h-px bg-[#D63426]/25" />
                          <div className="px-3 py-1 rounded-full border border-[#D63426]/35 text-[#D63426] text-xs font-bold">ĐÃ KIỂM</div>
                          <div className="flex-1 h-px bg-[#D63426]/25" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Torn ticket (animated halves) */}
                  {isTicketTearing && (
                    <div className="relative">
                      {/* Left half */}
                      <motion.div
                        initial={{ x: 0, rotate: 0, opacity: 1 }}
                        animate={{ x: -26, rotate: -7, opacity: 0 }}
                        transition={{ duration: 0.9, ease: 'easeInOut' }}
                        className="absolute inset-0"
                        style={{ clipPath: 'inset(0 50% 0 0)' }}
                      >
                        <div className="bg-[#F5DEDE] border-[3px] border-dashed border-[#D63426] rounded-2xl shadow-xl overflow-hidden">
                          <div className="p-5 bg-white/80 border-b border-[#D63426]/25">
                            <p className="text-xs uppercase tracking-widest text-[#D63426] font-bold">VÉ TÀU • 1911</p>
                            <p className="text-2xl font-extrabold text-[#D63426]" style={{ fontFamily: "'Roboto', 'Segoe UI', system-ui, sans-serif" }}>BẾN NHÀ RỒNG</p>
                          </div>
                          <div className="p-5 bg-white/70">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Hành khách</p>
                                <p className="font-bold text-gray-900">Văn Ba</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Ngày</p>
                                <p className="font-bold text-gray-900">05/06/1911</p>
                              </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-[#D63426]/20 flex items-center justify-between">
                              <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider">Hạng</p>
                                <p className="font-bold text-gray-900">Hạng 3</p>
                              </div>
                              <div className="text-right">
                                <p className="text-gray-500 text-xs uppercase tracking-wider">Chỗ</p>
                                <p className="font-bold text-gray-900">{selectedSeat ?? '—'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Right half */}
                      <motion.div
                        initial={{ x: 0, rotate: 0, opacity: 1 }}
                        animate={{ x: 26, rotate: 7, opacity: 0 }}
                        transition={{ duration: 0.9, ease: 'easeInOut' }}
                        className="absolute inset-0"
                        style={{ clipPath: 'inset(0 0 0 50%)' }}
                      >
                        <div className="bg-[#F5DEDE] border-[3px] border-dashed border-[#D63426] rounded-2xl shadow-xl overflow-hidden">
                          <div className="p-5 bg-white/80 border-b border-[#D63426]/25">
                            <p className="text-xs uppercase tracking-widest text-[#D63426] font-bold">VÉ TÀU • 1911</p>
                            <p className="text-2xl font-extrabold text-[#D63426]" style={{ fontFamily: "'Roboto', 'Segoe UI', system-ui, sans-serif" }}>BẾN NHÀ RỒNG</p>
                          </div>
                          <div className="p-5 bg-white/70">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Đi</p>
                                <p className="font-bold text-gray-900">Sài Gòn</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Đến (chặng đầu)</p>
                                <p className="font-bold text-gray-900">Marseille</p>
                              </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-[#D63426]/20 flex items-center justify-between">
                              <div className="px-3 py-1 rounded-full border border-[#D63426]/35 text-[#D63426] text-xs font-bold">ĐÃ KIỂM</div>
                              <div className="text-xs text-gray-600 italic">Khởi hành…</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Tear line */}
                      <div aria-hidden="true" className="absolute inset-0 flex items-stretch justify-center pointer-events-none">
                        <div className="w-[2px] bg-[#D63426] opacity-40" style={{ maskImage: 'repeating-linear-gradient(to bottom, rgba(0,0,0,1) 0 8px, rgba(0,0,0,0) 8px 14px)' }} />
                      </div>
                    </div>
                  )}
                </div>
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
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
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
      <div className="flex justify-center mt-14" aria-hidden="true">
        <svg
          ref={journeyPathRef}
          width="100"
          height="550"
          viewBox="0 0 100 550"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="opacity-90"
        >
          <path
            d="M 50 0 
               C 50 25, 85 45, 75 75 
               S 15 105, 25 135 
               S 80 165, 70 195 
               S 20 225, 30 255 
               S 75 285, 65 315 
               S 25 345, 35 375 
               S 80 405, 70 435 
               S 30 465, 40 495 
               S 50 525, 50 550"
            stroke="#D63426"
            strokeWidth="3"
            strokeDasharray="15 10"
            strokeLinecap="round"
            fill="none"
          />
          {/* Icon con tàu chạy dọc theo đường - sử dụng Framer Motion */}
          {isDepartureComplete && (
            <motion.g
              key={`ship-journey-${shipAnimationKey}`}
              style={{
                offsetPath: `path("M 50 0 C 50 25, 85 45, 75 75 S 15 105, 25 135 S 80 165, 70 195 S 20 225, 30 255 S 75 285, 65 315 S 25 345, 35 375 S 80 405, 70 435 S 30 465, 40 495 S 50 525, 50 550")`,
                offsetRotate: 'auto 90deg',
                filter: 'drop-shadow(0 0 10px rgba(214, 52, 38, 0.9))'
              }}
              initial={{ offsetDistance: '0%' }}
              animate={{ offsetDistance: '100%' }}
              transition={{ duration: 8, ease: 'easeInOut' }}
            >
              {/* Ship icon */}
              <g transform="translate(-24, -16) scale(1.8)">
                {/* Thân tàu */}
                <path
                  d="M 2 12 L 6 16 L 22 16 L 26 12 L 2 12 Z"
                  fill="#D63426"
                />
                {/* Cabin */}
                <rect x="8" y="8" width="12" height="4" rx="1" fill="#B52A1E" />
                {/* Ống khói */}
                <rect x="16" y="4" width="3" height="4" fill="#333" />
                {/* Khói */}
                <ellipse cx="17.5" cy="2" rx="2" ry="1.5" fill="#666" opacity="0.7">
                  <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1s" repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="19" cy="1" rx="1.5" ry="1" fill="#888" opacity="0.5">
                  <animate attributeName="opacity" values="0.5;0.2;0.5" dur="1.2s" repeatCount="indefinite" />
                </ellipse>
                {/* Cột buồm */}
                <rect x="11" y="2" width="1" height="6" fill="#8B4513" />
                {/* Buồm */}
                <path d="M 12 2 L 12 7 L 18 5 Z" fill="#FFF5E1" stroke="#D4AF37" strokeWidth="0.5" />
              </g>
            </motion.g>
          )}
        </svg>
      </div>
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
            <div id="stage-2" className="flex items-start justify-between gap-6 flex-wrap pt-20">
              <div>
                <p className="text-sm font-bold tracking-wider text-[#D63426]" style={{ fontFamily: 'Arial, sans-serif' }}>GIAI ĐOẠN 2 • 1911–1920</p>
                <h2 className="text-3xl md:text-4xl font-extrabold mt-2" style={{ fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif", color: '#D63426' }}>
                  "HÀNH TRÌNH TÌM ĐƯỜNG"
                </h2>
              </div>
            </div>

            <div className="mt-6 bg-gradient-to-r from-[#E88A82] to-[#D4736B] text-white rounded-xl p-5 shadow-lg">
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
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-500 mr-2">{activeStop.country}</div>
                    <button
                      onClick={() => setMapZoom(z => Math.max(1, z - 0.5))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition-colors"
                      title="Thu nhỏ"
                    >
                      −
                    </button>
                    <span className="text-xs text-gray-500 min-w-[40px] text-center">{Math.round(mapZoom * 100)}%</span>
                    <button
                      onClick={() => setMapZoom(z => Math.min(3, z + 0.5))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#D63426] hover:bg-[#B52A1E] text-white font-bold transition-colors"
                      title="Phóng to"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="p-4 overflow-auto max-h-[500px]" style={{ cursor: mapZoom > 1 ? 'grab' : 'default' }}>
                  <svg
                    viewBox={`0 0 ${MAP_W} ${MAP_H}`}
                    className="h-auto transition-transform duration-300"
                    style={{ width: `${100 * mapZoom}%`, minWidth: '100%' }}
                    role="img"
                    aria-label="Bản đồ thế giới và đường hành trình 1911-1920"
                  >
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
            <h3 className="text-2xl font-bold" style={{ color: '#D63426', fontFamily: 'Arial, sans-serif' }}>Câu chuyện cảm xúc</h3>
            <p className="text-sm text-gray-400 italic text-right">Tái hiện (không phải trích văn bản gốc)</p>
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
            <h3 className="text-2xl font-bold" style={{ color: '#D63426', fontFamily: 'Arial, sans-serif' }}>Bối cảnh lịch sử</h3>
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
          <h3 className="text-3xl font-bold text-center" style={{ color: '#D63426', fontFamily: 'Arial, sans-serif' }}>Nội dung</h3>

          <div className="flex gap-3 mt-6 mb-6 overflow-x-auto">
            {chapter2Tabs.map((t) => (
              <motion.button
                key={t.id}
                onClick={() => setChapter2Tab(t.id)}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className={
                  `px-5 py-3 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-2 ` +
                  (chapter2Tab === t.id
                    ? 'bg-gradient-to-r from-[#D63426] to-[#B52A1E] text-white shadow-lg'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[#D4AF37] hover:shadow-md')
                }
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                {t.icon}
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
              <div>
                <h4 className="text-2xl font-bold mb-4" style={{ color: '#D63426' }}>Nghề nghiệp</h4>
                <p className="text-sm text-gray-700 mb-6">Di chuột/nhấn vào mỗi nghề để xem mô tả ngắn.</p>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {jobsGrid.map((job) => (
                    <motion.div
                      key={job.title}
                      whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(214, 52, 38, 0.16)' }}
                      className="bg-white border border-gray-200 rounded-xl p-4 cursor-default group relative overflow-hidden"
                    >
                      <div className="text-4xl mb-2">{job.icon}</div>
                      <p className="font-bold text-gray-900">{job.title}</p>
                      {/* Tooltip hiển thị khi hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#D63426] to-[#B52A1E] text-white p-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
                        <p className="text-sm text-center">{job.story}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>


              </div>
            )}

            {chapter2Tab === 1 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-2xl font-bold" style={{ color: '#D63426' }}>Những bài học lớn - Nối thẻ</h4>
                  <button
                    onClick={resetMatchingGame}
                    className="px-4 py-2 bg-[#D63426] text-white rounded-lg font-bold text-sm hover:bg-[#B52A1E] transition-colors"
                  >
                    Chơi lại
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-6">Click vào thẻ tiêu đề bên trái và thẻ nội dung bên phải để nối cặp đúng. ({matchedPairs.length}/{lessonCards.length} cặp)</p>

                <div className="grid grid-cols-2 gap-6">
                  {/* Cột tiêu đề */}
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Tiêu đề</p>
                    {lessonCards.map((card) => (
                      <motion.button
                        key={card.id}
                        onClick={() => !matchedPairs.includes(card.id) && handleSelectTitle(card.id)}
                        whileHover={{ scale: matchedPairs.includes(card.id) ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${matchedPairs.includes(card.id)
                          ? 'bg-green-100 border-green-400 text-green-800 cursor-default'
                          : selectedTitle === card.id
                            ? 'bg-[#F5DEDE] border-[#D63426] text-[#D63426]'
                            : 'bg-white border-gray-200 text-gray-800 hover:border-[#D63426]/50'
                          }`}
                        disabled={matchedPairs.includes(card.id)}
                      >
                        <p className="font-bold">{card.title}</p>
                      </motion.button>
                    ))}
                  </div>

                  {/* Cột nội dung */}
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Nội dung</p>
                    {[...lessonCards].sort(() => 0.5 - Math.random()).map((card) => (
                      <motion.button
                        key={card.id}
                        onClick={() => !matchedPairs.includes(card.id) && handleSelectContent(card.id)}
                        whileHover={{ scale: matchedPairs.includes(card.id) ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${matchedPairs.includes(card.id)
                          ? 'bg-green-100 border-green-400 text-green-800 cursor-default'
                          : selectedContent === card.id
                            ? 'bg-[#F5DEDE] border-[#D63426] text-[#D63426]'
                            : 'bg-white border-gray-200 text-gray-800 hover:border-[#D63426]/50'
                          }`}
                        disabled={matchedPairs.includes(card.id)}
                      >
                        <p className="text-sm">{card.content}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {matchedPairs.length === lessonCards.length && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-green-100 border border-green-400 rounded-xl text-center"
                  >
                    <p className="text-green-800 font-bold">Xuất sắc! Bạn đã hoàn thành tất cả các cặp!</p>
                  </motion.div>
                )}
              </div>
            )}

            {chapter2Tab === 2 && (
              <div>
                <h4 className="text-2xl font-bold mb-4" style={{ color: '#D63426' }}>Sự kiện trọng đại</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <p className="text-sm font-bold text-[#D63426]">1919 • TRỞ THÀNH NGUYỄN ÁI QUỐC</p>
                    <p className="mt-2 font-semibold text-gray-900">“Yêu sách của nhân dân An Nam” (18/6/1919)</p>
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
                    <p className="mt-2 font-semibold text-gray-900">Tiếp cận luận điểm về vấn đề dân tộc & thuộc địa</p>
                    <div className="mt-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-[#D63426] p-5 rounded-r">
                      <p className="text-sm italic text-gray-800 leading-relaxed">
                        “Luận cương của Lênin làm cho tôi rất cảm động, phấn khởi, sáng tỏ, tin tưởng biết bao! … Tôi vui mừng đến phát khóc lên.”
                      </p>
                      <p className="text-xs text-[#D63426] font-semibold mt-2">— Hồ Chí Minh, “Con đường dẫn tôi đến chủ nghĩa Lênin” (1960).</p>
                    </div>
                    <p className="mt-4 text-sm text-gray-700">
                      Tham gia Đảng Cộng sản Pháp tại Đại hội Tours (12/1920) — một dấu mốc chính trị quan trọng.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {chapter2Tab === 3 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h4 className="text-2xl font-bold" style={{ color: '#D63426' }}>Cập nhật thông tin</h4>
                  <div className="mt-4 space-y-3 text-sm text-gray-800">
                    <p><span className="font-bold">Tên gọi:</span> Nguyễn Tất Thành → Nguyễn Ái Quốc (1919)</p>
                    <p><span className="font-bold">Ngôn ngữ:</span> Việt • Pháp • Anh (và tiếp xúc các cộng đồng khác)</p>
                    <p><span className="font-bold">Kỹ năng:</span> Viết • diễn thuyết • tổ chức</p>
                    <p><span className="font-bold">Tri thức:</span> Tiếp cận chủ nghĩa Mác–Lênin (bước ngoặt 1920)</p>
                    <p><span className="font-bold">Mục tiêu:</span> Con đường cứu nước gắn với giải phóng người lao động và dân tộc bị áp bức</p>
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
            <h3 className="text-2xl font-bold" style={{ color: '#D63426', fontFamily: 'Arial, sans-serif' }}>Đa phương tiện</h3>
            <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { t: 'Tàu Amiral Latouche-Tréville', s: 'Bến Nhà Rồng / tư liệu ảnh', img: 'https://cly.1cdn.vn/2016/09/01/congly-vn_amiral-latouche-trc3a9ville.jpg' },
                { t: 'Paris đầu thế kỷ XX', s: 'Tư liệu đô thị', img: 'https://kenh14cdn.com/k:thumb_w/600/A3YmnWqkHeph7OwGyu6TwbX57tgTw/Image/2013/11/11B/2-4d629/so-sanh-hinh-anh-ha-noi-va-paris-cuoi-the-ky-19.jpg' },
                { t: 'Hội nghị Versailles 1919', s: 'Tư liệu hội nghị', img: 'https://nghiencuuquocte.org/wp-content/uploads/2019/01/08.jpg' },
                { t: '“Yêu sách…” 1919', s: 'Văn bản/scan', img: 'https://tapchigiaothong.qltns.mediacdn.vn/tapchigiaothong.vn/files/Thuy.duong/2020/05/14/ban-yeu-sach-1436.jpg' },
                { t: 'Phong trào công nhân', s: 'Tư liệu lao động', img: 'https://filehcma3.hcma.vn/Image?path=hv3.tbt/2025/4/26//Picture1.png&w=1200&mode=none' },
                { t: 'Đại hội Tours 1920', s: 'Tư liệu đảng phái', img: 'https://bthcm.hue.gov.vn/Portals/0/Medias/Nam2024/T12/15.Toan-Canh-Dai-Hoi-Tour-Phap-1920.jpg' }
              ].map((it) => (
                <div key={it.t} className="border border-gray-200 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-white hover:shadow-md transition-shadow">
                  <div className="h-32 bg-gray-200 overflow-hidden">
                    <img src={it.img} alt={it.t} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold text-gray-900 line-clamp-2" title={it.t}>{it.t}</p>
                    <p className="text-xs text-gray-500 italic mt-1 line-clamp-1" title={it.s}>Nguồn: {it.s}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-7">
            <h3 className="text-2xl font-bold" style={{ color: '#D63426', fontFamily: 'Arial, sans-serif' }}>Trải nghiệm tương tác</h3>

            <div className="mt-6">
              {showScenarioResult ? (
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm p-8 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-6"
                  >
                    {(() => {
                      const counts = scenarioHistory.reduce((acc, curr) => {
                        acc[curr.type] = (acc[curr.type] || 0) + 1;
                        return acc;
                      }, {});

                      let maxType = 'vision';
                      let maxVal = 0;
                      Object.entries(counts).forEach(([k, v]) => {
                        if (v > maxVal) { maxVal = v; maxType = k; }
                      });

                      let result = { icon: <FaStar />, title: 'Nhà Tư Tưởng', desc: 'Bạn có cái nhìn sâu sắc về thời cuộc.' };
                      if (maxType === 'vision') result = { icon: <FaFire />, title: 'Nhà Cách Mạng Tiên Phong', desc: 'Bạn có tầm nhìn vượt thời đại và dũng cảm dấn thân vào con đường chông gai vì mục tiêu lớn. Giống như Bác, bạn chọn con đường khó khăn nhưng vinh quang.' };
                      if (maxType === 'heart') result = { icon: <FaHeart />, title: 'Nhà Nhân Ái', desc: 'Bạn hành động vì tình yêu thương con người. Đó là nền tảng đạo đức quan trọng, nhưng lịch sử đôi khi cần thêm sự quyết đoán của lý trí.' };
                      if (maxType === 'safe') result = { icon: <FaShieldAlt />, title: 'Người Quan Sát Thận Trọng', desc: 'Bạn ưu tiên sự an toàn và ổn định. Điều này tốt cho cá nhân, nhưng những thay đổi vĩ đại thường đòi hỏi sự mạo hiểm.' };

                      return (
                        <>
                          <div className="text-6xl mb-4">{result.icon}</div>
                          <h4 className="text-2xl font-bold text-[#D63426] mb-2 uppercase">{result.title}</h4>
                          <p className="text-gray-600 italic px-8">{result.desc}</p>
                        </>
                      );
                    })()}
                  </motion.div>

                  <div className="space-y-3 text-left bg-gray-50 p-4 rounded-lg mb-6 max-h-60 overflow-y-auto">
                    <p className="font-bold text-gray-900 text-sm uppercase border-b pb-2 mb-2">Lộ trình của bạn:</p>
                    {scenarioHistory.map((h, i) => (
                      <div key={i} className="flex items-start gap-3 p-2 bg-white rounded border border-gray-100">
                        <span className="text-xl mt-1">{h.icon}</span>
                        <div>
                          <div className="font-bold text-gray-800 text-sm">{h.label}</div>
                          <p className="text-xs text-gray-500 mt-0.5">{h.feedback}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      restartInteractiveGame();
                      trackEvent('quiz_start');
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-[#D63426] to-[#B52A1E] text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all"
                  >
                    Chơi lại
                  </button>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <div className="bg-gray-100 h-2 w-full">
                    <motion.div
                      className="h-full bg-[#D63426]"
                      initial={{ width: 0 }}
                      animate={{ width: `${((scenarioIndex + 1) / interactiveScenarios.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <div className="p-6 md:p-8">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={scenarioIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="mb-8">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-yellow-50 text-[#B52A1E] rounded-full text-xs font-bold uppercase tracking-wide border border-yellow-200">
                              Tình huống {scenarioIndex + 1}/{interactiveScenarios.length}
                            </span>
                          </div>
                          <h5 className="text-2xl font-bold text-gray-900 mb-3">{interactiveScenarios[scenarioIndex].title}</h5>
                          <p className="text-gray-600 text-lg leading-relaxed italic border-l-4 border-gray-200 pl-4 py-1">
                            "{interactiveScenarios[scenarioIndex].desc}"
                          </p>
                          <div className="mt-6 font-bold text-xl text-[#D63426]">
                            {interactiveScenarios[scenarioIndex].question}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          {interactiveScenarios[scenarioIndex].options.map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => handleScenarioChoice(opt)}
                              className="group flex items-center gap-5 text-left p-5 rounded-2xl border-2 border-transparent bg-gray-50 hover:bg-white hover:border-[#D63426] hover:shadow-md transition-all duration-300"
                            >
                              <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-3xl group-hover:scale-110 transition-transform flex-shrink-0">
                                {opt.icon}
                              </div>
                              <div className="flex-grow">
                                <h6 className="font-bold text-gray-900 text-lg group-hover:text-[#D63426] transition-colors">{opt.label}</h6>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 text-[#D63426] transform translate-x-[-10px] group-hover:translate-x-0 transition-all font-bold text-xl">
                                ➔
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Connect - kết nối giai đoạn */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mt-10 mb-20"
        >
        </motion.div>

        {/* --- GIAI ĐOẠN 3: 1920 - 1930 --- */}
        <div id="stage-3" className="mt-10 pt-20 border-t border-[#D63426]/20 bg-gray-50/50">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto px-6 text-center"
          >
            <p className="text-sm font-bold tracking-wider text-[#D63426] mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>
              GIAI ĐOẠN 3 • 1920–1930
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-[#D63426]" style={{ fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif" }}>
              HÌNH THÀNH TƯ TƯỞNG CƠ BẢN
            </h2>
            <p className="text-xl text-gray-600 font-serif italic mb-10">(Từ chủ nghĩa yêu nước đến Mác-Lênin)</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500">
                <h4 className="font-bold text-lg text-blue-800 mb-3">🌍 Bối Cảnh</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Sau khi tìm thấy con đường cứu nước (1920), Nguyễn Ái Quốc hoạt động sôi nổi tại <strong>Pháp, Liên Xô và Trung Quốc</strong>. Người cần cụ thể hóa lý luận Mác-Lênin vào hoàn cảnh thực tế của một nước thuộc địa nửa phong kiến.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-yellow-500">
                <h4 className="font-bold text-lg text-yellow-800 mb-3">✍️ Hoạt Động & Tổ Chức</h4>
                <ul className="text-sm text-gray-700 space-y-2 list-disc pl-4">
                  <li><strong>Báo chí:</strong> Tham gia sáng lập, biên tập và viết bài cho <em>Người cùng khổ (Le Paria)</em>.</li>
                  <li><strong>Tác phẩm:</strong> <em>Bản án chế độ thực dân Pháp</em> (1925), <em>Đường Kách mệnh</em> (1927).</li>
                  <li><strong>Tổ chức:</strong> Thành lập <em>Hội Việt Nam Cách mạng Thanh niên</em> (1925).</li>
                  <li><strong>Hợp nhất:</strong> Chủ trì Hội nghị thành lập <strong>Đảng Cộng sản Việt Nam</strong> (1930).</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-red-500">
                <h4 className="font-bold text-lg text-red-800 mb-3">💡 Tư Tưởng Cốt Lõi</h4>
                <ul className="text-sm text-gray-700 space-y-2 list-disc pl-4">
                  <li>Cách mạng Việt Nam là bộ phận của Cách mạng Thế giới.</li>
                  <li>Khẳng định vai trò lãnh đạo của <strong>Đảng Cộng sản</strong>.</li>
                  <li><strong>Liên minh công - nông</strong> là gốc của cách mạng.</li>
                  <li>Cách mạng giải phóng dân tộc có thể giành thắng lợi trước cách mạng vô sản ở chính quốc.</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>


        {/* --- PHẦN MỚI: GIAI ĐOẠN 3 - HOÀN THIỆN & PHÁT TRIỂN --- */}
        <div id="stages-later" className="mt-20 pt-10 border-t border-[#D63426]/20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto px-6"
          >
            {/* Header Section Stage 4 */}
            <div id="stage-4" className="text-center mb-16 relative pt-20">
              <p className="text-sm font-bold tracking-wider text-[#D63426] mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>
                GIAI ĐOẠN 4 • 1930–1941
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif", color: '#D63426' }}>
                VƯỢT QUA THỬ THÁCH
              </h2>
              <div className="w-24 h-1 bg-[#D63426] mx-auto rounded-full mb-4"></div>
              <p className="text-xl text-gray-600 font-serif italic">
                (Kiên trì giữ vững lập trường)
              </p>
            </div>

            {/* Stage 4: 1930-1941 */}
            <div className="mb-24 relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Image Column */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="relative group rounded-2xl overflow-hidden shadow-2xl border-4 border-white"
              >
                <motion.img
                  // THAY ẢNH HƯƠNG CẢNG (GIAI ĐOẠN 4) TẠI ĐÂY
                  src="https://cdn-images.vtv.vn/zoom/700_438/2020/5/17/chutichhochiminh-1589714154071425304672.jpg"
                  alt="Nguyen Ai Quoc Hong Kong"
                  className="w-full h-[400px] object-cover filter sepia-[0.3] brightness-90 contrast-125 transition-all duration-700"
                  whileHover={{
                    scale: 1.02,
                    filter: "sepia(0) brightness(1) contrast(1)",
                    rotate: 1
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                  <p className="font-bold text-lg">Nguyễn Ái Quốc tại Hương Cảng</p>
                  <p className="text-sm opacity-80 italic">Giai đoạn thử lửa và kiên định lập trường (1930-1941)</p>
                </div>
              </motion.div>

              {/* Content Column */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-5xl font-bold text-gray-200">04</span>
                  <h3 className="text-3xl font-bold text-gray-800">Vượt qua thử thách</h3>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-400">
                  <h4 className="font-bold text-lg text-orange-600 mb-2 flex items-center gap-2">
                    <FaShieldAlt /> Bối cảnh đầy khó khăn
                  </h4>
                  <p className="text-gray-700 text-justify leading-relaxed">
                    Trong phong trào cộng sản quốc tế thời kỳ này có nhiều tranh luận về đường lối, trong đó có cách nhìn về vấn đề dân tộc và thuộc địa. Nguyễn Ái Quốc kiên trì nhấn mạnh nhiệm vụ <strong>giải phóng dân tộc</strong> như một yêu cầu cấp bách của các nước thuộc địa.
                    Người từng bị nhà cầm quyền Anh bắt giam tại Hồng Kông (vụ án Tống Văn Sơ).
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#D63426]">
                  <h4 className="font-bold text-lg text-[#D63426] mb-2 flex items-center gap-2">
                    <FaFire /> Kiên trì giữ vững quan điểm
                  </h4>
                  <p className="text-gray-700 text-justify leading-relaxed">
                    Dù bị phê phán, Người vẫn kiên định với chiến lược: <em>"Cách mạng ở các nước thuộc địa trước hết phải là cuộc cách mạng giải phóng dân tộc."</em>
                    Sự kiên trì của Người đã bảo vệ được "hạt giống" tư tưởng cách mạng đúng đắn cho Việt Nam, tránh tả khuynh gây tổn thất.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Custom Separator */}
            <div className="w-full flex justify-center mb-24 opacity-30">
              <div className="h-px w-1/3 bg-gradient-to-r from-transparent via-[#D63426] to-transparent"></div>
            </div>

            {/* Stage 5: 1941-1969 */}
            <div id="stage-5" className="mb-20 pt-20">
              <div className="text-center mb-12">
                <span className="text-6xl font-bold text-gray-100 absolute left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10">05</span>
                <p className="text-sm font-bold tracking-wider text-[#D63426] mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>
                  GIAI ĐOẠN 5 • 1941–1969
                </p>
                <h3 className="text-3xl font-bold text-gray-800 relative inline-block">
                  Tư tưởng soi đường & Hoàn thiện
                  <span className="block h-1 w-full bg-[#D63426] mt-2 rounded-full transform scale-x-50"></span>
                </h3>
                <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                  Giai đoạn rực rỡ nhất, khi tư tưởng của Người trở thành hiện thực sinh động qua hai cuộc kháng chiến và công cuộc xây dựng đất nước.
                </p>
              </div>

              {/* Modern Cards Layout for 3 Sub-periods */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1 - Updated to 3D Tilt */}
                <ThreeDTiltCard className="h-full">
                  <div className="h-40 bg-cover bg-center" style={{
                    // THAY ẢNH 1941-1945 TẠI ĐÂY
                    backgroundImage: "url('https://scontent.fsgn15-1.fna.fbcdn.net/v/t39.30808-6/540089440_1160215499472713_1968525319033873952_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=f727a1&_nc_ohc=XEoq7DJCAkUQ7kNvwG9ayqn&_nc_oc=Adl4EPRTI165OdQCEGUzdS63LIJcuv8-GNXfYZs6gHDg16DBxXduS-zCL1QG88sapwZbCFZ8EiPLtYyWge3bv3n9&_nc_zt=23&_nc_ht=scontent.fsgn15-1.fna&_nc_gid=8UJH9nFN5972eAsisLk0Zg&oh=00_Afo_q1LeUlbonuz9WOmadsZo8LzjhIPazs5yQalaoxu8DA&oe=6968F9DF')"
                  }}>
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <h4 className="text-white text-2xl font-bold text-center border-b-2 border-[#D4AF37] pb-1 shadow-black drop-shadow-md text-shadow-lg" style={{ transform: "translateZ(30px)", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>1941 – 1945</h4>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col bg-white">
                    <h5 className="text-lg font-bold text-[#D63426] mb-3" style={{ transform: "translateZ(20px)" }}>Giành độc lập dân tộc</h5>
                    <ul className="space-y-2 text-sm text-gray-700 flex-1" style={{ transform: "translateZ(10px)" }}>
                      <li className="flex gap-2">
                        <FaMapMarkerAlt className="text-orange-500 mt-1 shrink-0" />
                        <span>Về nước trực tiếp lãnh đạo (Pác Bó, 1941).</span>
                      </li>
                      <li className="flex gap-2">
                        <FaUserSecret className="text-orange-500 mt-1 shrink-0" />
                        <span>Thành lập Mặt trận Việt Minh, đoàn kết toàn dân.</span>
                      </li>
                      <li className="flex gap-2">
                        <FaStar className="text-orange-500 mt-1 shrink-0" />
                        <span><strong>Tuyên ngôn Độc lập (1945)</strong>: Khai sinh nước VNDCCH.</span>
                      </li>
                    </ul>
                  </div>
                </ThreeDTiltCard>

                {/* Card 2 - Updated to 3D Tilt */}
                <ThreeDTiltCard className="h-full">
                  <div className="h-40 bg-cover bg-center filter brightness-110 sepia-[0.2]" style={{
                    // THAY ẢNH 1945-1954 TẠI ĐÂY
                    backgroundImage: "url('https://bak16.lce.edu.vn/uploads/news/1_2.jpg')"
                  }}>
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <h4 className="text-white text-2xl font-bold text-center border-b-2 border-[#D4AF37] pb-1 shadow-black drop-shadow-md text-shadow-lg" style={{ transform: "translateZ(30px)", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>1945 – 1954</h4>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col bg-white">
                    <h5 className="text-lg font-bold text-[#D63426] mb-3" style={{ transform: "translateZ(20px)" }}>Kháng chiến chống Pháp</h5>
                    <ul className="space-y-2 text-sm text-gray-700 flex-1" style={{ transform: "translateZ(10px)" }}>
                      <li className="flex gap-2">
                        <FaShieldAlt className="text-blue-600 mt-1 shrink-0" />
                        <span>Đường lối <strong>"Vừa kháng chiến, vừa kiến quốc"</strong>.</span>
                      </li>
                      <li className="flex gap-2">
                        <FaFire className="text-red-600 mt-1 shrink-0" />
                        <span>Tư tưởng quân sự: Chiến tranh nhân dân, trường kỳ kháng chiến.</span>
                      </li>
                      <li className="flex gap-2">
                        <FaFlag className="text-red-600 mt-1 shrink-0" />
                        <span>Lấy yếu chống mạnh, lấy ít địch nhiều.</span>
                      </li>
                    </ul>
                  </div>
                </ThreeDTiltCard>

                {/* Card 3 - Updated to 3D Tilt */}
                <ThreeDTiltCard className="h-full">
                  <div className="h-40 bg-cover bg-center filter brightness-110 sepia-[0.2]" style={{
                    // THAY ẢNH 1954-1969 TẠI ĐÂY
                    backgroundImage: "url('https://media.vietnamplus.vn/images/7255a701687d11cb8c6bbc58a6c80785c531738e3787169ce34b631b27454b96293efe9f02a123fb7bd3cd45e79b779c4f9efb0c8972265f49d8f86164867992/bac_ho_3_1.jpg')"
                  }}>
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <h4 className="text-white text-2xl font-bold text-center border-b-2 border-[#D4AF37] pb-1 shadow-black drop-shadow-md text-shadow-lg" style={{ transform: "translateZ(30px)", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>1954 – 1969</h4>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col bg-white">
                    <h5 className="text-lg font-bold text-[#D63426] mb-3" style={{ transform: "translateZ(20px)" }}>Xây dựng CNXH & Thống nhất</h5>
                    <ul className="space-y-2 text-sm text-gray-700 flex-1" style={{ transform: "translateZ(10px)" }}>
                      <li className="flex gap-2">
                        <HiBriefcase className="text-green-600 mt-1 shrink-0" />
                        <span><strong>Chiến lược lưỡng đầu</strong>: Hai miền, hai nhiệm vụ chiến lược.</span>
                      </li>
                      <li className="flex gap-2">
                        <FaBalanceScale className="text-green-600 mt-1 shrink-0" />
                        <span>Xây dựng Đảng cầm quyền: Chống tham ô, lãng phí.</span>
                      </li>
                      <li className="flex gap-2">
                        <FaHeart className="text-pink-500 mt-1 shrink-0" />
                        <span>Đạo đức cách mạng: "Cần, Kiệm, Liêm, Chính".</span>
                      </li>
                      <li className="bg-red-50 p-2 rounded text-xs text-[#D63426] font-bold text-center mt-2" style={{ transform: "translateZ(15px)" }}>
                        "Đoàn kết, đoàn kết, đại đoàn kết.<br />Thành công, thành công, đại thành công."
                      </li>
                    </ul>
                  </div>
                </ThreeDTiltCard>
              </div>
            </div>

            {/* Quote Footer */}
            <div className="text-center pb-20">
              <div className="inline-block p-8 bg-[#D63426] text-white rounded-2xl shadow-2xl max-w-3xl relative">
                <BiSolidQuoteAltLeft className="text-4xl opacity-30 absolute top-4 left-4" />
                <p className="text-xl md:text-2xl font-bold italic mb-4">
                  "Tôi chỉ có một sự ham muốn, ham muốn tột bậc, là làm sao cho nước ta được hoàn toàn độc lập, dân ta được hoàn toàn tự do, đồng bào ai cũng có cơm ăn áo mặc, ai cũng được học hành."
                </p>
                <p className="font-bold opacity-90">— Hồ Chí Minh —</p>
              </div>
            </div>

          </motion.div>
        </div>

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
      </div >
    </div >
  );
};

export default TimelineSection;
