import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

export const Sidebar = () => {
  const menuItems = [
    { path: "/leituras", label: "Leituras", icon: "💓" },
    { path: "/patients", label: "Pacientes", icon: "👥" },
    { path: "/appointments", label: "Consultas", icon: "📅" },
    { path: "/new-appointment", label: "Nova Consulta", icon: "➕" },
    { path: "/chat", label: "Assistente", icon: "💬" },
  ];

  return (
    <nav className={styles.sidebar}>
      <ul className={styles.menu}>
        {menuItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              <span className={styles.icon}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
