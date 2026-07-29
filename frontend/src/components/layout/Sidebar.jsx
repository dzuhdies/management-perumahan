import { NavLink } from "react-router-dom";

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
  },
  {
    name: "Rumah",
    path: "/rumah",
  },
  {
    name: "Penghuni",
    path: "/penghuni",
  },
  {
    name: "Tagihan",
    path: "/tagihan",
  },
  {
    name: "Jenis Iuran",
    path: "/jenis-iuran",
  },
  {
    name: "Pengeluaran",
    path: "/pengeluaran",
  },
  {
    name: "Laporan",
    path: "/laporan",
  },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">

        <div>
          <h1>RT Management</h1>
          <p>Kelola Perumahan</p>
        </div>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? "sidebar-link sidebar-link-active"
                : "sidebar-link"
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
