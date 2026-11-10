import { useReducer, useEffect } from "react";
import { api } from "../services/api";

const initialState = {
  appointments: [],
  loading: true,
  error: null,
};

const appointmentsReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, appointments: action.payload };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "ADD_APPOINTMENT":
      return {
        ...state,
        appointments: [...state.appointments, action.payload],
      };
    default:
      return state;
  }
};

export const useAppointments = () => {
  const [state, dispatch] = useReducer(appointmentsReducer, initialState);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const data = await api.getAppointments();
      dispatch({ type: "FETCH_SUCCESS", payload: data });
    } catch (error) {
      dispatch({ type: "FETCH_ERROR", payload: error.message });
    }
  };

  const addAppointment = async (appointmentData) => {
    try {
      const newAppointment = await api.createAppointment(appointmentData);
      dispatch({ type: "ADD_APPOINTMENT", payload: newAppointment });
      return { success: true, data: newAppointment };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return {
    appointments: state.appointments,
    loading: state.loading,
    error: state.error,
    addAppointment,
    refetch: fetchAppointments,
  };
};
