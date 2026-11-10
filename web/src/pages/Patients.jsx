import { useState, useEffect } from "react";
import { api } from "../services/api";
import { PatientCard } from "../components/Patients/PatientCard";
import styles from "./Patients.module.css";

export const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState("Todos");

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const data = await api.getPatients();
      setPatients(data);
    } catch (error) {
      console.error("Erro ao carregar pacientes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk =
      filterRisk === "Todos" || patient.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const riskLevels = ["Todos", "Crítico", "Alto", "Moderado", "Baixo"];

  if (loading) {
    return <div className={styles.loading}>Carregando pacientes...</div>;
  }

  return (
    <div className={styles.patients}>
      <h1 className={styles.title}>Pacientes</h1>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Buscar paciente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />

        <select
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value)}
          className={styles.filterSelect}
        >
          {riskLevels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.patientsGrid}>
        {filteredPatients.map((patient) => (
          <PatientCard key={patient.id} patient={patient} />
        ))}
      </div>
    </div>
  );
};
