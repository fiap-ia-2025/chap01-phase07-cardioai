import { useState, useEffect } from "react";
import { api } from "../services/api";
import { StatsCard } from "../components/Dashboard/StatsCard";
import { RecentAppointments } from "../components/Dashboard/RecentAppointments";
import styles from "./Dashboard.module.css";

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Carregando dashboard...</div>;
  }

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Dashboard</h1>

      <div className={styles.statsGrid}>
        <StatsCard
          title="Total de Pacientes"
          value={stats?.totalPatients}
          icon="👥"
          color="#3498db"
        />
        <StatsCard
          title="Consultas Agendadas"
          value={stats?.totalAppointments}
          icon="📅"
          color="#2ecc71"
        />
        <StatsCard
          title="Casos Críticos"
          value={stats?.criticalCases}
          icon="🔴"
          color="#e74c3c"
        />
        <StatsCard
          title="Alto Risco"
          value={stats?.highRiskCases}
          icon="🟡"
          color="#f39c12"
        />
      </div>

      <div className={styles.section}>
        <h2>Consultas de Hoje</h2>
        <RecentAppointments />
      </div>
    </div>
  );
};
