import React from 'react'

export default function GetMaintenanceRequestList() {
  import React, { useState, useEffect, useCallback } from 'react';

const GetMaintenanceRequestList = ({
  requests: initialRequests = [],
  onViewDetails,
  onAssign,
  onUpdateStatus,
  onSearch,
  onFilterChange
}) => {
  // Mock data mặc định nếu không có props requests
  const defaultRequests = [
    {
      id: "5001",
      title: "Hỏng điều hòa",
      description: "Căn hộ 402 báo cáo điều hòa không làm lạnh và phát ra tiếng ồn lạ từ cục nóng. Đã thử khởi động lại nhưng không khắc phục được. Cần kỹ thuật viên kiểm tra gấp trong ngày.",
      priority: "HIGH",
      status: "PENDING",
      createdAt: "2026-03-01 09:00:00",
      unit: "Căn hộ 402",
      isHighlighted: true
    },
    {
      id: "4998",
      title: "Rò rỉ nước nhà vệ sinh",
      description: "Nhà vệ sinh chính bị rò rỉ nước từ bồn cầu, nước chảy ra sàn nhà.",
      priority: "MEDIUM",
      status: "PENDING",
      createdAt: "2026-03-01 08:30:00",
      unit: "Căn hộ 1205",
      isHighlighted: false
    },
    {
      id: "4992",
      title: "Thay bóng đèn hành lang",
      description: "Bóng đèn tại hành lang tầng 8 bị cháy, cần thay mới.",
      priority: "LOW",
      status: "COMPLETED",
      createdAt: "2026-02-28 15:45:00",
      unit: "Khu vực chung",
      isHighlighted: false
    },
    {
      id: "5003",
      title: "Máy giặt bị rung lắc mạnh",
      description: "Máy giặt tại phòng giặt chung kêu to và rung lắc bất thường khi hoạt động.",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      createdAt: "2026-03-02 10:15:00",
      unit: "Phòng giặt chung",
      isHighlighted: false
    },
    {
      id: "5005",
      title: "Khóa cửa căn hộ bị kẹt",
      description: "Khóa cửa vào căn hộ khó xoay, cần tra dầu hoặc thay ổ khóa mới.",
      priority: "HIGH",
      status: "PENDING",
      createdAt: "2026-03-02 14:20:00",
      unit: "Căn hộ 815",
      isHighlighted: false
    }
  ];

  const [requests, setRequests] = useState(initialRequests.length > 0 ? initialRequests : defaultRequests);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [filteredRequests, setFilteredRequests] = useState([]);

  // Helper functions
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'HIGH': return 'bg-error-container text-on-error-container';
      case 'MEDIUM': return 'bg-secondary-fixed text-on-secondary-fixed-variant';
      case 'LOW': return 'bg-surface-container-high text-on-surface-variant';
      default: return 'bg-surface-container-high text-on-surface-variant';
    }
  };

  const getStatusBarColor = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-500';
      case 'IN_PROGRESS': return 'bg-blue-500';
      case 'COMPLETED': return 'bg-emerald-500';
      default: return 'bg-slate-300';
    }
  };

  const getPriorityText = (priority) => {
    switch(priority) {
      case 'HIGH': return 'Ưu tiên: Cao';
      case 'MEDIUM': return 'Ưu tiên: Trung bình';
      case 'LOW': return 'Ưu tiên: Thấp';
      default: return priority;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'PENDING': return 'Chờ xử lý';
      case 'IN_PROGRESS': return 'Đang xử lý';
      case 'COMPLETED': return 'Hoàn thành';
      default: return status;
    }
  };

  // Filter function
  const filterRequests = useCallback(() => {
    let filtered = [...requests];
    
    // Search filter
    if (searchKeyword) {
      filtered = filtered.filter(request => 
        request.id.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        request.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        request.description.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }
    
    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(request => request.priority === priorityFilter);
    }
    
    setFilteredRequests(filtered);
    
    if (onFilterChange) {
      onFilterChange({
        search: searchKeyword,
        status: statusFilter,
        priority: priorityFilter
      });
    }
  }, [requests, searchKeyword, statusFilter, priorityFilter, onFilterChange]);

  useEffect(() => {
    filterRequests();
  }, [filterRequests]);

  // Handlers
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchKeyword(value);
    if (onSearch) onSearch(value);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handlePriorityChange = (e) => {
    setPriorityFilter(e.target.value);
  };

  const handleViewClick = (id) => {
    if (onViewDetails) onViewDetails(id);
  };

  const handleAssignClick = (id) => {
    if (onAssign) onAssign(id);
  };

  const handleUpdateStatusClick = (id) => {
    if (onUpdateStatus) onUpdateStatus(id);
  };

  // Render highlighted request
  const renderHighlightedRequest = (request) => {
    const priorityColor = getPriorityColor(request.priority);
    const priorityText = getPriorityText(request.priority);
    
    return (
      <div className="bg-surface-container-lowest rounded-xl p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-primary/10 transition-colors duration-500"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={`${priorityColor} px-3 py-1 rounded-sm text-[10px] font-bold tracking-widest uppercase`}>
                {priorityText}
              </div>
              <div className="bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-sm text-[10px] font-bold tracking-widest uppercase">
                ID #{request.id}
              </div>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant text-sm">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              {request.createdAt}
            </div>
          </div>
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-on-surface mb-4">{request.title}</h2>
            <p className="text-on-surface-variant max-w-2xl leading-relaxed">
              {request.description}
            </p>
            <p className="text-xs text-on-surface-variant mt-2">📍 {request.unit}</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-outline-variant/15">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
              <div>
                <p className="text-xs font-bold text-outline-variant uppercase tracking-tighter">Trạng thái hiện tại</p>
                <p className="text-on-surface font-semibold">{getStatusText(request.status)} ({request.status})</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                className="bg-surface-container-low text-on-surface px-6 py-3 rounded-full font-bold text-sm hover:bg-surface-container-high transition-colors"
                onClick={() => handleViewClick(request.id)}
              >
                Xem chi tiết
              </button>
              <button 
                className="bg-surface-container-low text-on-surface px-6 py-3 rounded-full font-bold text-sm hover:bg-surface-container-high transition-colors flex items-center gap-2"
                onClick={() => handleAssignClick(request.id)}
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                Phân công
              </button>
              <button 
                className="bg-gradient-to-br from-primary to-primary-container text-white px-6 py-3 rounded-full font-bold text-sm hover:brightness-110 active:scale-95 transition-all"
                onClick={() => handleUpdateStatusClick(request.id)}
              >
                Cập nhật Trạng thái
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render request item
  const renderRequestItem = (request) => {
    const statusBarColor = getStatusBarColor(request.status);
    const priorityColor = getPriorityColor(request.priority);
    const priorityText = getPriorityText(request.priority);
    const opacityClass = request.status === 'COMPLETED' ? 'opacity-70' : '';
    
    return (
      <div className={`bg-surface-container-lowest p-5 rounded-xl flex items-center justify-between group hover:bg-surface-container-low transition-colors duration-200 ${opacityClass}`}>
        <div className="flex items-center gap-6">
          <div className={`w-1.5 h-10 rounded-full ${statusBarColor}`}></div>
          <div>
            <h4 className="font-bold text-on-surface">{request.title}</h4>
            <p className="text-xs text-on-surface-variant">ID #{request.id} • {request.unit} • {request.createdAt}</p>
          </div>
        </div>
        <div className="flex items-center gap-12">
          <div className="hidden md:block">
            <span className={`${priorityColor} px-3 py-1 rounded-sm text-[10px] font-bold uppercase`}>
              {priorityText.split(':')[1] || priorityText}
            </span>
          </div>
          <div className="text-right">
            <button 
              className="text-primary font-bold text-sm hover:underline"
              onClick={() => handleViewClick(request.id)}
            >
              Chi tiết
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Get highlighted request
  const highlightedRequest = filteredRequests.find(r => r.priority === 'HIGH' && r.status === 'PENDING') || filteredRequests[0];
  const otherRequests = filteredRequests.filter(r => r.id !== highlightedRequest?.id);

  return (
    <div className="w-full max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <nav className="flex mb-2 text-xs font-label uppercase tracking-widest text-on-secondary-fixed-variant">
            <span>Azure Serenity</span>
            <span className="mx-2 text-outline-variant opacity-50">/</span>
            <span className="text-primary font-bold">Maintenance</span>
          </nav>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface leading-tight">Quản lý Yêu cầu Bảo trì</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-secondary-fixed px-4 py-2 rounded-full flex items-center gap-2">
            <span className="material-symbols-outlined text-on-secondary-fixed-variant text-sm">auto_awesome</span>
            <span className="text-xs font-bold text-on-secondary-fixed-variant">{requests.filter(r => r.status === 'PENDING').length} YÊU CẦU MỚI</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Section */}
      <div className="bg-surface-container-low rounded-xl p-6 mb-8 flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-grow w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input 
            className="w-full bg-surface-container-lowest border-none rounded-sm pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-primary" 
            placeholder="Tìm kiếm theo ID hoặc tiêu đề..." 
            type="text"
            value={searchKeyword}
            onChange={handleSearch}
          />
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <div className="relative group">
            <select 
              className="appearance-none bg-surface-container-lowest border-none rounded-sm px-4 py-3 pr-10 text-sm text-on-surface-variant focus:ring-1 focus:ring-primary min-w-[140px]"
              value={statusFilter}
              onChange={handleStatusChange}
            >
              <option value="all">Trạng thái: Tất cả</option>
              <option value="PENDING">PENDING</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
          </div>
          <div className="relative group">
            <select 
              className="appearance-none bg-surface-container-lowest border-none rounded-sm px-4 py-3 pr-10 text-sm text-on-surface-variant focus:ring-1 focus:ring-primary min-w-[140px]"
              value={priorityFilter}
              onChange={handlePriorityChange}
            >
              <option value="all">Ưu tiên: Tất cả</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
          </div>
          <button className="bg-surface-container-lowest p-3 rounded-sm flex items-center justify-center text-outline hover:text-primary transition-colors">
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>
      </div>

      {/* Bento Grid / Cards View */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {filteredRequests.length === 0 ? (
          <div className="xl:col-span-3 text-center py-12">
            <span className="material-symbols-outlined text-6xl text-outline">inbox</span>
            <p className="text-on-surface-variant mt-4">Không tìm thấy yêu cầu bảo trì nào</p>
          </div>
        ) : (
          <>
            <div className="xl:col-span-2">
              {highlightedRequest && renderHighlightedRequest(highlightedRequest)}
              <div className="mt-8 space-y-4">
                {otherRequests.map(request => (
                  <React.Fragment key={request.id}>
                    {renderRequestItem(request)}
                  </React.Fragment>
                ))}
              </div>
            </div>
            
            {/* Side Dashboard */}
            <div className="space-y-8">
              {/* AI Insight Card */}
              <div className="bg-secondary-fixed p-8 rounded-xl relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-on-secondary-fixed-variant" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-on-secondary-fixed-variant">Homelink AI Insight</span>
                  </div>
                  <h3 className="text-xl font-bold text-on-secondary-fixed mb-4">Phân tích Hệ thống</h3>
                  <p className="text-sm text-on-secondary-fixed-variant leading-relaxed mb-6">
                    Tần suất yêu cầu bảo trì điều hòa tăng 15% trong tuần này. Chúng tôi đề xuất thực hiện bảo trì định kỳ cho toàn bộ block A để tránh hỏng hóc hàng loạt.
                  </p>
                  <button className="w-full py-3 bg-on-secondary-fixed text-surface-container-lowest rounded-full font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity">
                    Xem Báo Cáo Chi Tiết
                  </button>
                </div>
              </div>
              
              {/* Technician Availability */}
              <div className="bg-surface-container-low p-8 rounded-xl">
                <h3 className="font-bold text-on-surface mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">engineering</span>
                  Kỹ thuật viên Sẵn sàng
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        alt="technician 1" 
                        className="w-10 h-10 rounded-full" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBByS3qnLH2OU7Qtx6CjO2oFjTmNReG-d0pAt24MhU2GlbnnbMwsABt5QmftQ_pua4NtcvGV-GzcgYKOTTkwSXQNDd21MqlV3Kq3KIDKnltYL-tWRmeFH-ojiCoXGJTuWuIPcNCoq9hM5t9DhsBajS4_aaXlvF2WMQigqHLxu7U3fyrFV2nNkxd0zxn2or4H4jwZaRS3l5zf8C4lU-ZQ6aYpa5o2dM2Y_wzqZhje4D9WFVZEhYlGLFwpeqji0p9Ki8ZJZCg7sVApsc"
                      />
                      <div>
                        <p className="text-sm font-bold">Nguyễn Văn An</p>
                        <p className="text-[10px] text-on-surface-variant">Điện lạnh • 4.9/5.0</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        alt="technician 2" 
                        className="w-10 h-10 rounded-full" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKw1G4WC3oXhV5jNmxP-26GvAATph6rfdEcFq4lBgeT5WA6-6hPsREaU5moeya1p1X-Dx8Xf0XzTcu-nVFL8jPlYXfRlNPPw8rzuIu1nOzGfRL_kN58EnMZoeX4QMhQgfGhCM80x8BYBlgO2YlRlCf9liQ-FPQQ_OAOdsU2BT1djsVH-QWhZKA8w8hVO2Y_fchDExe0VapiF7X5PJvOG4mjI6t5p3de6fc25TV8JT0HoJRcdb_SPrGj6hVcx9qMZxX_my3NTJ70cQ"
                      />
                      <div>
                        <p className="text-sm font-bold">Trần Minh Tâm</p>
                        <p className="text-[10px] text-on-surface-variant">Điện nước • 4.8/5.0</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 opacity-50">
                      <img 
                        alt="technician 3" 
                        className="w-10 h-10 rounded-full" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuChjP9v9swW-XwKA6WLeaEUpIcYXzBt5TDeEnCFiJX1b8cmiNAfAuItIzKjdCCrb46X_mfv0_YxwgTNIrnuJRRF8nnn5yiJOlnc0FABytLnmunf86NjIHjAgjWvmJsoL6egwY0IWu2ej8hKx0YAFb5VlS8hDl1bKGBUXxH2nx6DVdHTJPNzONRhHEnXKZsN5mvdkjcrx98bRPrHxj7_0t5n1Xbw9fQzp3hwjOKSVDJT6je8UrU6U1jwwhJQDyTQoefhnKbz17OtTow"
                      />
                      <div>
                        <p className="text-sm font-bold">Lê Quang Vinh</p>
                        <p className="text-[10px] text-on-surface-variant">Xây dựng • 4.7/5.0</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GetMaintenanceRequestList;
}
