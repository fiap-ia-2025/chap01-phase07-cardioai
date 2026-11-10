import styles from "./PatientCard.module.css";

export const PatientCard = ({ patient }) => {
  const getRiskColor = (risk) => {
    const colors = {
      Crítico: "#e74c3c",
      Alto: "#f39c12",
      Moderado: "#3498db",
      Baixo: "#2ecc71",
    };
    return colors[risk] || "#95a5a6";
  };

  return (
    <div
      className={styles.card}
      style={{ borderLeftColor: getRiskColor(patient.riskLevel) }}
    >
      <div className={styles.header}>
        <h3 className={styles.name}>{patient.name}</h3>
        <span
          className={styles.riskBadge}
          style={{ backgroundColor: getRiskColor(patient.riskLevel) }}
        >
          {patient.riskLevel}
        </span>
      </div>

      <div className={styles.info}>
        <p>📊 Idade: {patient.age} anos</p>
        <p>⚥ Gênero: {patient.gender}</p>
        <p>📅 Última consulta: {patient.lastVisit}</p>
      </div>

      <div className={styles.diagnosis}>
        <strong>Diagnóstico:</strong>
        <span>{patient.lastDiagnosis}</span>
      </div>

      <div className={styles.contact}>
        <button
          className={styles.contactBtn}
          onClick={() => alert(`Email: ${patient.email}`)}
        >
          📧 Email
        </button>
        <button
          className={styles.contactBtn}
          onClick={() => alert(`Telefone: ${patient.phone}`)}
        >
          📞 Ligar
        </button>
      </div>
    </div>
  );
};
