import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { School, CheckCircle, Users, Computer, BookOpen, RefreshCw } from 'lucide-react';

export default function ProgressReport() {
  const [data, setData] = useState({
    totalRegistered: 0,
    approvedInstall: 0,
    installed: 0,
    moreThan10PC: 0,
    install36: 0,
    install72: 0,
    install108: 0,
    totalTeachers: 0,
    teachersInstalled: 0
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('');

  const SHEET_ID = '1XRwutbGBYRj_gclLjcWc5E4sbP5nKdbehJfb8heWr-g';
  const SHEET_NAME = 'Sheet1';

  const fetchDataFromSheets = async () => {
    setLoading(true);
    try {
      const ranges = [
        'N4', // Số trường gv đăng ký (18/192)
        'N5', // Con lại (174/192)
        'N9', // Số lượng đã cài (17/192)
        'N10', // Trường có số lượng máy > 10 (17 trường)
        'N12', // Số trường đk cài 36 tiết (2)
        'N13'  // Số trường đk cài 72 tiết (16)
      ];

      const rangeString = ranges.join(',');
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}&range=${rangeString}`;
      
      const response = await fetch(url);
      const text = await response.text();
      const json = JSON.parse(text.substring(47).slice(0, -2));
      
      const values = json.table.rows.map(row => {
        const cellValue = row.c[0]?.v || '0';
        return typeof cellValue === 'string' ? parseInt(cellValue.split('/')[0]) || 0 : cellValue;
      });

      setData({
        totalRegistered: 192, // Tổng số (từ mẫu số)
        approvedInstall: values[0] || 0, // 18/192
        installed: values[2] || 0, // 17/192
        moreThan10PC: values[3] || 0, // 17 trường
        install36: values[4] || 0, // 2
        install72: values[5] || 0, // 16
        install108: 0, // Chưa có trong sheet
        totalTeachers: values[0] || 0, // Lấy từ số GV đăng ký
        teachersInstalled: values[2] || 0 // Lấy từ số đã cài
      });

      setLastUpdate(new Date().toLocaleString('vi-VN'));
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
      alert('Không thể lấy dữ liệu từ Google Sheets.\n\nVui lòng:\n1. Vào File → Chia sẻ → Xuất bản lên web\n2. Hoặc: Chia sẻ → Mọi người có link đều có thể xem');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFromSheets();
  }, []);

  const teachersRemaining = data.totalTeachers - data.teachersInstalled;
  const installProgress = data.totalRegistered > 0 ? ((data.installed / data.totalRegistered) * 100).toFixed(1) : 0;
  const teacherProgress = data.totalTeachers > 0 ? ((data.teachersInstalled / data.totalTeachers) * 100).toFixed(1) : 0;

  const chartData = [
    { name: '36 tiết', value: data.install36, color: '#B4E7FF' },
    { name: '72 tiết', value: data.install72, color: '#C1F2C7' },
    { name: '108 tiết', value: data.install108, color: '#FFE599' }
  ];

  const schoolData = [
    { name: 'Tổng số trường', value: data.totalRegistered },
    { name: 'GV đăng ký', value: data.approvedInstall },
    { name: 'Đã cài đặt', value: data.installed }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-indigo-900 flex items-center gap-3">
                <BookOpen className="w-8 h-8" />
                BÁO CÁO TIẾN ĐỘ CÀI PHẦN MỀM KỸ NĂNG SỐNG
              </h1>
              <p className="text-gray-600 mt-2">Dữ liệu tự động từ Google Sheets</p>
              {lastUpdate && (
                <p className="text-sm text-gray-500 mt-1">Cập nhật lần cuối: {lastUpdate}</p>
              )}
            </div>
            <button
              onClick={fetchDataFromSheets}
              disabled={loading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Đang tải...' : 'Làm mới dữ liệu'}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            icon={<School className="w-6 h-6" />}
            title="Tổng số trường"
            value={data.totalRegistered}
            color="blue"
          />
          <StatCard 
            icon={<CheckCircle className="w-6 h-6" />}
            title="GV đăng ký"
            value={data.approvedInstall}
            subtitle={`${data.totalRegistered - data.approvedInstall} còn lại`}
            color="green"
          />
          <StatCard 
            icon={<CheckCircle className="w-6 h-6" />}
            title="Đã cài đặt"
            value={data.installed}
            subtitle={`${installProgress}%`}
            color="indigo"
          />
          <StatCard 
            icon={<Computer className="w-6 h-6" />}
            title="Máy > 10"
            value={data.moreThan10PC}
            subtitle="trường"
            color="purple"
          />
        </div>

        {/* Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <ProgressCard 
            title="Tiến độ cài đặt"
            value={`${installProgress}%`}
            subtitle={`${data.installed}/${data.totalRegistered} trường`}
            progress={parseFloat(installProgress)}
            color="blue"
          />
          <ProgressCard 
            title="Giáo viên đã cài"
            value={`${teacherProgress}%`}
            subtitle={`${data.teachersInstalled}/${data.totalTeachers} GV`}
            progress={parseFloat(teacherProgress)}
            color="green"
          />
          <ProgressCard 
            title="Còn lại"
            value={teachersRemaining}
            subtitle="giáo viên chưa cài"
            progress={0}
            color="orange"
          />
        </div>

        {/* Số tiết cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg shadow-lg p-6 border-2 border-blue-300">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-6 h-6 text-blue-700" />
              <h3 className="text-lg font-bold text-blue-900">36 tiết</h3>
            </div>
            <p className="text-4xl font-bold text-blue-900">{data.install36}</p>
            <p className="text-sm text-blue-700 mt-1">trường đăng ký</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg shadow-lg p-6 border-2 border-green-300">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-6 h-6 text-green-700" />
              <h3 className="text-lg font-bold text-green-900">72 tiết</h3>
            </div>
            <p className="text-4xl font-bold text-green-900">{data.install72}</p>
            <p className="text-sm text-green-700 mt-1">trường đăng ký</p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg shadow-lg p-6 border-2 border-yellow-300">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-6 h-6 text-yellow-700" />
              <h3 className="text-lg font-bold text-yellow-900">108 tiết</h3>
            </div>
            <p className="text-4xl font-bold text-yellow-900">{data.install108}</p>
            <p className="text-sm text-yellow-700 mt-1">trường đăng ký</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Thống kê tổng quan</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={schoolData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Phân bổ số tiết đăng ký</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, color }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    indigo: 'from-indigo-500 to-indigo-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-lg shadow-lg p-5 text-white`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="text-sm font-semibold opacity-90">{title}</h3>
      </div>
      <p className="text-3xl font-bold mb-1">{value}</p>
      {subtitle && <p className="text-sm opacity-80">{subtitle}</p>}
    </div>
  );
}

function ProgressCard({ title, value, subtitle, progress, color }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-lg shadow-lg p-6 text-white`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-4xl font-bold mb-1">{value}</p>
      <p className="text-sm opacity-90 mb-3">{subtitle}</p>
      {progress > 0 && (
        <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}