import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "@/context/AuthProvider";
import Avatar from "@/components/Avatar";

export default function DashboardLayout() {
  const { user, signOut } = useAuth();

  return (
    <div className="dashboard-wrapper flex">
      <Sidebar />
      <div className="main flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          {/* LEFT : titre */}
          

          {/* RIGHT : user info */}
          {/* Bloc user fixé en bas à droite */}
{user && (
  <div className="fixed bottom-6 right-6 flex items-center gap-3 bg-green-50 rounded-full py-2 px-4 border border-green-100 shadow-lg">
    <Avatar
      src={(user as any).avatar_url ?? null}
      size={40}
      className="avatar rounded-full"
    />
    <span className="text-sm font-medium text-green-800 whitespace-nowrap">
      {user.first_name} {user.last_name ?? ""}
    </span>
    <button
      onClick={signOut}
      className="btn-primary flex items-center gap-2"
    >
      Sign Out
    </button>
  </div>
)}

        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
