// components/AuthenticatedLayout.tsx
import { useAuth } from "@/context/AuthProvider"; // Changed from UserContext to AuthProvider
import Avatar from "@/components/Avatar";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth(); // Using useAuth instead of useUser

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        {/* ... rest of your header code ... */}
      </header>
      {children}
    </div>
  );
}