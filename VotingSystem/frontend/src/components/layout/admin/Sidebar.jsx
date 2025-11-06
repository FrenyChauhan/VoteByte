import { NavLink } from "react-router-dom";
import { BarChart3, ListChecks, Users, ClipboardCheck } from "lucide-react";

const Sidebar = () => {
  const menuItems = [
    { name: "Stats", icon: BarChart3, path: "/admin/dashboard/stats" },
    { name: "Vote Rooms", icon: ListChecks, path: "/admin/dashboard/voterooms" },
    { name: "Host Room Requests", icon: ClipboardCheck, path: "/admin/dashboard/hostroomrequests" },
    { name: "Host Verify Requests", icon: Users, path: "/admin/dashboard/hostverifyrequests" },
    { name: "Candidate Approvals", icon: ClipboardCheck, path: "/admin/dashboard/candidate-approvals" },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="p-4 text-2xl font-bold border-b border-gray-700">Admin</div>
      <nav className="flex-1 p-3 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isActive ? "bg-gray-700" : "hover:bg-gray-800"
              }`
            }
          >
            <item.icon size={20} />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
