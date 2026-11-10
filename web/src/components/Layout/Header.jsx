import { useAuth } from "../../contexts/AuthContext";
import styles from "./Header.module.css";

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <h1>❤️ CardioIA</h1>
        <span className={styles.subtitle}>
          Portal de Diagnóstico Cardiovascular
        </span>
      </div>
      <div className={styles.userInfo}>
        <span className={styles.doctorName}>{user?.name}</span>
        <span className={styles.crm}>CRM: {user?.crm}</span>
        <button onClick={logout} className={styles.logoutBtn}>
          Sair
        </button>
      </div>
    </header>
  );
};
