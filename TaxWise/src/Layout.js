import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard, 
  Upload, 
  Calculator, 
  TrendingUp, 
  FileText,
  Menu,
  X
} from "lucide-react";
import { User } from "@/entities/User";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Upload Center",
    url: createPageUrl("Upload"),
    icon: Upload, 
  },
  {
    title: "Tax Optimizer",
    url: createPageUrl("TaxCalculator"),
    icon: Calculator,
  },
  {
    title: "CIBIL Advisor", 
    url: createPageUrl("CibilAnalyzer"),
    icon: TrendingUp,
  },
  {
    title: "Reports",
    url: createPageUrl("Reports"),
    icon: FileText,
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (e) {
        // Not logged in
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <style>{`
        :root {
          --oneui-bg: #f8f9fa;
          --oneui-card-bg: #ffffff;
          --oneui-primary: #007bff;
          --oneui-text-primary: #212529;
          --oneui-text-secondary: #6c757d;
          --oneui-radius-lg: 1.5rem; /* 24px */
          --oneui-radius-md: 0.75rem; /* 12px */
          --oneui-radius-sm: 0.5rem;  /* 8px */
        }
        
        .oneui-card {
          background-color: var(--oneui-card-bg);
          border-radius: var(--oneui-radius-lg);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          border: 1px solid rgba(0,0,0,0.05);
        }
        
        .oneui-button {
          border-radius: var(--oneui-radius-md);
          font-weight: 600;
          padding: 0.75rem 1.5rem;
          transition: all 0.2s ease-in-out;
          background-color: var(--oneui-primary);
          color: white;
        }

        .oneui-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 123, 255, 0.3);
        }

        .oneui-button-secondary {
          background-color: #e9ecef;
          color: var(--oneui-text-primary);
        }

        .oneui-button-secondary:hover {
           box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
        }

        .oneui-input {
          background-color: #f1f3f5;
          border: 2px solid transparent;
          border-radius: var(--oneui-radius-md);
          padding: 0.75rem 1rem;
          font-weight: 500;
        }

        .oneui-input:focus {
          background-color: var(--oneui-card-bg);
          border-color: var(--oneui-primary);
          outline: none;
        }
      `}</style>

      {/* Mobile Header */}
      <div className="lg:hidden bg-white sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-gray-800">{currentPageName}</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-lg transform transition-transform lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-6 flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              T
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">TaxWise</h2>
              <p className="text-sm text-gray-500">Finance Manager</p>
            </div>
          </div>
          
          <nav className="p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${
                    location.pathname === item.url 
                      ? `bg-blue-100 text-blue-600` 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            {user && (
               <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-100">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600">
                    {user.full_name?.[0].toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800 truncate">{user.full_name || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
               </div>
            )}
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen lg:ml-0 bg-slate-50">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}