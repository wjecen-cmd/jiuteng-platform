"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Key, CreditCard, Settings, LogOut } from "lucide-react";

export default function UserCenterPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 获取用户信息
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch("/api/user/profile", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (data.code === 200) {
          setUser(data.data);
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("获取用户信息失败:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-purple-600">JT.</span>
              <span className="ml-2 text-sm text-gray-500">用户中心</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 侧边栏 */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-sm p-6">
              <ul className="space-y-2">
                <li>
                  <a href="#" className="flex items-center gap-3 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg font-medium">
                    <User className="w-5 h-5" />
                    个人信息
                  </a>
                </li>
                <li>
                  <a href="#api-keys" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                    <Key className="w-5 h-5" />
                    API Key
                  </a>
                </li>
                <li>
                  <a href="#billing" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                    <CreditCard className="w-5 h-5" />
                    充值记录
                  </a>
                </li>
                <li>
                  <a href="#settings" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                    <Settings className="w-5 h-5" />
                    账户设置
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* 主内容区 */}
          <div className="lg:col-span-3">
            {/* 个人信息卡片 */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">个人信息</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
                  <p className="text-gray-900">{user.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">昵称</label>
                  <p className="text-gray-900">{user.nickname || "未设置"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">用户ID</label>
                  <p className="text-gray-900 text-sm">{user.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">注册时间</label>
                  <p className="text-gray-900 text-sm">
                    {new Date(user.created_at).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </div>
            </div>

            {/* API Key 管理 */}
            <div id="api-keys" className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">API Key</h2>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  创建新 Key
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-gray-500 text-center py-8">暂无 API Key</p>
              </div>
            </div>

            {/* 充值记录 */}
            <div id="billing" className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">充值记录</h2>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-gray-500 text-center py-8">暂无充值记录</p>
              </div>
            </div>

            {/* 账户设置 */}
            <div id="settings" className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">账户设置</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">修改密码</p>
                    <p className="text-sm text-gray-500">建议定期修改密码以保证账户安全</p>
                  </div>
                  <button className="text-purple-600 hover:text-purple-700 font-medium">修改</button>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">注销账户</p>
                      <p className="text-sm text-gray-500">注销后所有数据将被永久删除</p>
                    </div>
                    <button className="text-red-600 hover:text-red-700 font-medium">注销</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}