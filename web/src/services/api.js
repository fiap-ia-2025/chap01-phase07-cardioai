import { mockPatients, mockAppointments } from "./mockData";

export const api = {
  getPatients: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [...mockPatients];
  },

  getAppointments: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [...mockAppointments];
  },

  createAppointment: async (appointmentData) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const newAppointment = {
      id: mockAppointments.length + 1,
      ...appointmentData,
      status: "Pendente",
    };
    mockAppointments.push(newAppointment);
    return newAppointment;
  },

};
