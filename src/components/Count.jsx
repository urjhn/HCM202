import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaEye, FaCube, FaGamepad, FaRobot, FaTimes, FaChartLine } from 'react-icons/fa';
import { getAllStats } from '../utils/tracking';

const Count = ({ onClose }) => {
    const [stats, setStats] = useState({ visits: 0, views3d: 0, quizStarts: 0, aiQueries: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const data = await getAllStats();
            setStats(data);
            setLoading(false);
        };
        fetchStats();
    }, []);

    // Data Calculation
    const total = stats.visits + stats.views3d + stats.quizStarts + stats.aiQueries;
    const safeTotal = total === 0 ? 1 : total; // Avoid div by zero

    const pVisits = Math.round((stats.visits / safeTotal) * 100);
    const p3D = Math.round((stats.views3d / safeTotal) * 100);
    const pQuiz = Math.round((stats.quizStarts / safeTotal) * 100);
    const pAI = Math.round((stats.aiQueries / safeTotal) * 100);

    // Conic Gradient for Pie Chart
    // visits -> 3d -> quiz -> ai
    const degVisits = (stats.visits / safeTotal) * 100;
    const deg3D = degVisits + (stats.views3d / safeTotal) * 100;
    const degQuiz = deg3D + (stats.quizStarts / safeTotal) * 100;

    const pieStyle = {
        background: `conic-gradient(
        #3B82F6 0% ${degVisits}%, 
        #A855F7 ${degVisits}% ${deg3D}%, 
        #F97316 ${deg3D}% ${degQuiz}%, 
        #22C55E ${degQuiz}% 100%
      )`
    };

    // Data for Bar Chart
    const barData = [
        { label: 'Truy cập', val: stats.visits, color: 'bg-blue-500', max: Math.max(stats.visits, stats.views3d, stats.quizStarts, stats.aiQueries) },
        { label: '3D View', val: stats.views3d, color: 'bg-purple-500', max: Math.max(stats.visits, stats.views3d, stats.quizStarts, stats.aiQueries) },
        { label: 'Game', val: stats.quizStarts, color: 'bg-orange-500', max: Math.max(stats.visits, stats.views3d, stats.quizStarts, stats.aiQueries) },
        { label: 'AI Chat', val: stats.aiQueries, color: 'bg-green-500', max: Math.max(stats.visits, stats.views3d, stats.quizStarts, stats.aiQueries) },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-[#F8F9FA] dark:bg-gray-900 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
            >
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h2>
                        <p className="text-gray-500 text-sm">Thống kê hoạt động người dùng theo thời gian thực (Real-time)</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <FaTimes className="text-xl text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto max-h-[80vh]">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard title="Tổng Lượt Truy Cập" value={stats.visits} icon={<FaEye className="text-blue-500" />} color="bg-blue-50 text-blue-600" trend={`${pVisits}%`} />
                        <StatCard title="Lượt Xem 3D" value={stats.views3d} icon={<FaCube className="text-purple-500" />} color="bg-purple-50 text-purple-600" trend={`${p3D}%`} />
                        <StatCard title="Lượt Chơi Quiz" value={stats.quizStarts} icon={<FaGamepad className="text-orange-500" />} color="bg-orange-50 text-orange-600" trend={`${pQuiz}%`} />
                        <StatCard title="AI Queries" value={stats.aiQueries} icon={<FaRobot className="text-green-500" />} color="bg-green-50 text-green-600" trend={`${pAI}%`} />
                    </div>

                    {/* Charts Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Real Comparison Chart */}
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                                <FaChartLine /> So sánh Tương tác (Số liệu thực)
                            </h3>
                            <div className="space-y-6">
                                {barData.map((item, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{item.label}</span>
                                            <span className="text-gray-500">{item.val.toLocaleString()}</span>
                                        </div>
                                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.max > 0 ? (item.val / item.max) * 100 : 0}%` }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                                className={`h-full ${item.color} rounded-full relative`}
                                            >
                                                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/20"></div>
                                            </motion.div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pie Chart / Distribution */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6 w-full text-left">
                                Phân bố hoạt động
                            </h3>

                            <div className="relative w-48 h-48 rounded-full shadow-inner" style={pieStyle}>
                                <div className="absolute inset-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center flex-col shadow-sm">
                                    <span className="text-3xl font-bold text-gray-800 dark:text-white">{total.toLocaleString()}</span>
                                    <span className="text-xs text-gray-400">Total</span>
                                </div>
                            </div>

                            <div className="w-full mt-6 space-y-3">
                                <LegendItem color="bg-blue-500" label="Lướt Web" value={`${pVisits}%`} />
                                <LegendItem color="bg-purple-500" label="Xem 3D" value={`${p3D}%`} />
                                <LegendItem color="bg-orange-500" label="Chơi Game" value={`${pQuiz}%`} />
                                <LegendItem color="bg-green-500" label="Chat AI" value={`${pAI}%`} />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const StatCard = ({ title, value, icon, color, trend }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
    >
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${color}`}>
                {icon}
            </div>
            <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-1 rounded-full">
                {trend}
            </span>
        </div>
        <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-white font-mono">
            {value.toLocaleString()}
        </p>
    </motion.div>
);

const LegendItem = ({ color, label, value }) => (
    <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`}></div>
            <span className="text-gray-600 dark:text-gray-400">{label}</span>
        </div>
        <span className="font-bold text-gray-800 dark:text-white">{value}</span>
    </div>
);

export default Count;
