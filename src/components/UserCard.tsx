import React from "react";
import Avatar from "@/components/Avatar";

function UserCard({ user }: { user: { first_name: string; last_name?: string; avatar_url?: string | null } }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar src={user.avatar_url ?? null} size={42} />
      <div>
        <div className="font-semibold">
          {user.first_name} {user.last_name ?? ""}
        </div>
        <div className="text-xs text-gray-500">0 Credits</div>
      </div>
    </div>
  );
}

export default UserCard;
