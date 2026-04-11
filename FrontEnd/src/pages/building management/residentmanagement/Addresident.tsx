import React from "react";

export default function Addresident() {
  return (
    <div className="bg-surface text-on-surface antialiased">
      {/* Main Content */}
      <main className="pl-72 pt-20 min-h-screen">
        <div className="max-w-5xl mx-auto px-10 py-12">
          {/* Header */}
          <header className="mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">
              Thêm Cư dân mới
            </h1>
            <p className="text-on-surface-variant max-w-2xl">
              Cung cấp thông tin chi tiết để khởi tạo hồ sơ cư dân.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl p-10 shadow">
                <form className="space-y-8">
                  {/* Name */}
                  <div>
                    <label className="block text-sm mb-2">Họ và tên</label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      className="w-full px-4 py-3 rounded-xl border"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm mb-2">Email</label>
                    <input
                      type="email"
                      placeholder="example@email.com"
                      className="w-full px-4 py-3 rounded-xl border"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm mb-2">Số điện thoại</label>
                    <input
                      type="tel"
                      placeholder="0901234567"
                      className="w-full px-4 py-3 rounded-xl border"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white rounded-xl"
                  >
                    Thêm Cư dân
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <aside>
              <div className="bg-white rounded-3xl p-6 shadow">
                <h3 className="font-bold mb-2">ID: 3</h3>
                <p className="text-sm text-gray-500">
                  ID sẽ được tạo tự động.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

