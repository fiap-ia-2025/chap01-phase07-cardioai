import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppointments } from "../hooks/useAppointments";
import { diagnoses } from "../services/mockData";
import styles from "./NewAppointment.module.css";

export const NewAppointment = () => {
  const navigate = useNavigate();
  const { addAppointment } = useAppointments();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: "",
    date: "",
    time: "",
    diagnosis: diagnoses[0],
    notes: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await addAppointment({
      ...formData,
      patientId: Date.now(),
    });

    if (result.success) {
      alert("Consulta agendada com sucesso!");
      navigate("/appointments");
    } else {
      alert("Erro ao agendar consulta");
    }

    setLoading(false);
  };

  return (
    <div className={styles.newAppointment}>
      <h1 className={styles.title}>Nova Consulta</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Nome do Paciente</label>
          <input
            type="text"
            name="patientName"
            value={formData.patientName}
            onChange={handleChange}
            required
            placeholder="Nome completo"
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Data</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Horário</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Diagnóstico Principal</label>
          <select
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            required
          >
            {diagnoses.map((diagnosis) => (
              <option key={diagnosis} value={diagnosis}>
                {diagnosis}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Observações</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            placeholder="Observações adicionais..."
          />
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => navigate("/appointments")}
            className={styles.cancelBtn}
          >
            Cancelar
          </button>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Agendando..." : "Agendar Consulta"}
          </button>
        </div>
      </form>
    </div>
  );
};
