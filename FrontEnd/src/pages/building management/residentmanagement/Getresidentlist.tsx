import React from "react";

export default function Getresidentlist() {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      
      {/* TopNav */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-3 bg-slate-50/70 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold">Homelink Admin</span>
          <div className="hidden md:flex items-center bg-surface-container-low px-4 py-1.5 rounded-full border">
            <span className="material-symbols-outlined text-sm">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-sm w-64"
              placeholder="Tìm kiếm cư dân..."
            />
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-50 border-r pt-20 hidden md:flex flex-col p-4">
        <h2 className="text-lg font-bold mb-6">Admin Portal</h2>

        <a className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 rounded-lg">
          <span className="material-symbols-outlined">dashboard</span>
          Dashboard
        </a>

        <a className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg">
          <span className="material-symbols-outlined">group</span>
          Tenants
        </a>
      </aside>

      {/* Main */}
      <main className="md:ml-64 pt-24 px-6 pb-12">

        {/* Header */}
        <div className="flex justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold">Quản lý Cư dân</h1>
            <p className="text-sm text-gray-500">
              Quản lý thông tin cư dân trong hệ thống
            </p>
          </div>

          <button className="bg-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2">
            <span className="material-symbols-outlined">person_add</span>
            Thêm Cư dân
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white p-6 rounded-xl mb-6 flex gap-4">
          <select className="p-2 border rounded">
            <option>Tất cả tòa nhà</option>
            <option>Building A</option>
            <option>Building B</option>
          </select>

          <select className="p-2 border rounded">
            <option>Trạng thái</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-xs uppercase">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Họ tên</th>
                <th className="p-4">Căn hộ</th>
                <th className="p-4">Tòa</th>
                <th className="p-4">Vai trò</th>
                <th className="p-4">Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-t hover:bg-gray-50">
                <td className="p-4">#001</td>
                <td className="p-4 font-semibold">Nguyễn Văn A</td>
                <td className="p-4">A101</td>
                <td className="p-4">Building A</td>
                <td className="p-4 text-blue-600 font-bold">OWNER</td>
                <td className="p-4 text-green-600 font-bold">ACTIVE</td>
              </tr>

              <tr className="border-t hover:bg-gray-50">
                <td className="p-4">#002</td>
                <td className="p-4 font-semibold">Trần Thị B</td>
                <td className="p-4">B1201</td>
                <td className="p-4">Building B</td>
                <td className="p-4">MEMBER</td>
                <td className="p-4 text-green-600 font-bold">ACTIVE</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}