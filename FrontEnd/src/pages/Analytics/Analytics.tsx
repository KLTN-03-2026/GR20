import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import http from 'src/utils/http';

export default function Analytics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [expiringContracts, setExpiringContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, buildingsRes, contractsRes] = await Promise.all([
          http.get('/api/apartments/stats'),
          http.get('/api/buildings'),
          http.get('/api/contracts?status=ACTIVE'),
        ]);

        setStats(statsRes.data?.data);
        setBuildings(buildingsRes.data?.data || []);

        // Lọc hợp đồng sắp hết hạn trong 30 ngày
        const contracts = contractsRes.data?.data || [];
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiring = contracts.filter((c: any) => {
          const endDate = new Date(c.endDate);
          return endDate <= thirtyDaysFromNow && endDate >= new Date();
        });
        setExpiringContracts(expiring);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Tính ngày còn lại
  const getDaysRemaining = (endDate: string): number => {
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="ml-64 pt-24 flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="material-symbols-outlined animate-spin">sync</span>
          <span className="text-sm">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-64 pt-24 px-8 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-2"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Quay lại
            </button>
            <h1 className="text-3xl font-bold text-slate-900">Phân tích & Báo cáo</h1>
            <p className="text-sm text-slate-500 mt-1">
              Tổng quan về tình trạng căn hộ và hợp đồng
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
            Làm mới
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Tỉ lệ lấp đầy */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-600">apartment</span>
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase">Tỉ lệ lấp đầy</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats?.occupancyRate || 0}%</p>
            <p className="text-xs text-emerald-600 mt-1">
              {stats?.occupiedApartments || 0}/{stats?.totalApartments || 0} căn đã cho thuê
            </p>
          </div>

          {/* Tổng căn hộ */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600">home_work</span>
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase">Tổng căn hộ</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats?.totalApartments || 0}</p>
            <p className="text-xs text-slate-400 mt-1">{buildings.length} tòa nhà</p>
          </div>

          {/* Sắp hết hạn */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-600">warning</span>
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase">Sắp hết hạn</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats?.expiringContracts || 0}</p>
            <p className="text-xs text-amber-600 mt-1">Trong 30 ngày tới</p>
          </div>

          {/* Còn trống */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-600">home</span>
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase">Còn trống</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {(stats?.totalApartments || 0) - (stats?.occupiedApartments || 0)}
            </p>
            <p className="text-xs text-purple-600 mt-1">Sẵn sàng cho thuê</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Occupancy by Building */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 mb-4">
              Tỉ lệ lấp đầy theo tòa nhà
            </h3>
            <div className="space-y-4">
              {buildings.length > 0 ? buildings.map((building: any) => {
                const rate = building.totalApartments > 0
                  ? Math.round((building.occupiedApartments || 0) / building.totalApartments * 100)
                  : 0;
                return (
                  <div key={building.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">{building.name}</span>
                      <span className="font-semibold text-slate-800">{rate}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${rate}%` }}
                      ></div>
                    </div>
                  </div>
                );
              }) : (
                <p className="text-sm text-slate-400 text-center py-4">Chưa có dữ liệu tòa nhà</p>
              )}
            </div>
          </div>

          {/* Expiring Contracts */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 mb-4">
              Hợp đồng sắp hết hạn ({expiringContracts.length})
            </h3>
            <div className="space-y-3">
              {expiringContracts.length > 0 ? expiringContracts.map((contract: any) => {
                const daysLeft = getDaysRemaining(contract.endDate);
                return (
                  <div key={contract.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{contract.apartmentCode}</p>
                      <p className="text-xs text-slate-400">{contract.residentName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      daysLeft <= 7 ? 'bg-red-100 text-red-700' :
                      daysLeft <= 15 ? 'bg-orange-100 text-orange-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {daysLeft <= 0 ? 'Hôm nay' : `Còn ${daysLeft} ngày`}
                    </span>
                  </div>
                );
              }) : (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-3xl text-slate-200 mb-2">check_circle</span>
                  <p className="text-sm text-slate-400">Không có hợp đồng sắp hết hạn</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}