import { Link } from "react-router-dom";
import { useAppointments } from "../hooks/useAppointments";
import styles from "./Appointments.module.css";

export const Appointments = () => {
  const { appointments, loading } = useAppointments();

  if (loading) {
    return <div className={styles.loading}>Carregando consultas...</div>;
  }

  return (
    <div className={styles.appointments}>
      <div className={styles.header}>
        <h1 className={styles.title}>Consultas Agendadas</h1>
        <Link to="/new-appointment" className={styles.newAppointmentBtn}>
          + Nova Consulta
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className={styles.noAppointments}>Nenhuma consulta agendada</div>
      ) : (
        <div className={styles.appointmentsList}>
          {appointments.map((appointment) => (
            <div key={appointment.id} className={styles.appointmentCard}>
              <div className={styles.appointmentInfo}>
                <h3 className={styles.patientName}>
                  {appointment.patientName}
                </h3>
                <div className={styles.appointmentDetails}>
                  <span className={styles.detail}>📅 {appointment.date}</span>
                  <span className={styles.detail}>🕐 {appointment.time}</span>
                  <span className={styles.detail}>
                    🏥 {appointment.diagnosis}
                  </span>
                </div>
                {appointment.notes && (
                  <p className={styles.notes}>📝 {appointment.notes}</p>
                )}
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
      )}
    </div>
  );
};
