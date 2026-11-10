import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("fakeJWT");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    if (email === "medico@cardioia.com" && password === "123456") {
      const fakeToken = `fake-jwt-${Date.now()}`;
      const userData = {
        id: 1,
        name: "Dr. Carlos Silva",
        email: email,
        role: "cardiologista",
        crm: "12345-SP",
      };

      localStorage.setItem("fakeJWT", fakeToken);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    }
    return { success: false, error: "Credenciais inválidas" };
  };

  const logout = () => {
    localStorage.removeItem("fakeJWT");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
