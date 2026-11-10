import styles from "./StatsCard.module.css";

export const StatsCard = ({ title, value, icon, color }) => {
  return (
    <div className={styles.card} style={{ borderTopColor: color }}>
      <div className={styles.icon} style={{ color }}>
        {icon}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.value}>{value || 0}</p>
      </div>
    </div>
  );
};
