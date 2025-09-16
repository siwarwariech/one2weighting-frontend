/* ───────── src/components/Sidebar.tsx ───────── */
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, Home, FilePlus } from "lucide-react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <a href="/" className="sidebar-logo">one&nbsp;to&nbsp;weighting</a>

      <button className="icon-btn primary md:hidden" onClick={() => setOpen(!open)}>
        <Menu size={18} />
      </button>

      <nav className="nav-group">
        <NavLink to="/dashboard" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          <Home size={18} /> <span>Dashboard</span>
        </NavLink>

        <NavLink
           to="/dashboard/project/new"   
               className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
             >
            <FilePlus size={18} />
             <span>New Project</span>
        </NavLink>
      </nav>
      
    </aside>
  );
}
