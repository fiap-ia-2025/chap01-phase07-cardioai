import { useState, useEffect } from "react";
import { api } from "../../services/api";
import styles from "./RecentAppointments.module.css";

export const RecentAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await api.getAppointments();
      // Pega apenas as consultas de hoje
      const today = new Date().toISOString().split("T")[0];
      const todayAppointments = data.filter((apt) => apt.date === today);
      setAppointments(todayAppointments);
    } catch (error) {
      console.error("Erro ao carregar consultas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.empty}>Carregando consultas...</div>;
  }

  if (appointments.length === 0) {
    return <div className={styles.empty}>Nenhuma consulta para hoje</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.appointmentsList}>
        {appointments.map((appointment) => (
          <div key={appointment.id} className={styles.appointmentItem}>
            <div className={styles.patientInfo}>
              <span className={styles.patientName}>
                {appointment.patientName}
              </span>
              <span className={styles.timeInfo}>{appointment.time}</span>
              <span className={styles.diagnosis}>{appointment.diagnosis}</span>
            </div>
            <div
              className={`${styles.status} ${
                styles[appointment.status.toLowerCase()]
              }`}
            >
              {appointment.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
