import { createContext, ReactNode, useContext, useState } from "react";
import { useRouter } from "next/router";

const TOKEN_KEY = "token";

type AuthContextType = {
  token: string | null;
  handleLoginToken: (token: string) => void;
  handleLogout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  token: null,
  handleLoginToken: () => {},
  handleLogout: () => {},
});

export const useAuthContext = () => useContext(AuthContext);

const getToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
};

export const AuthContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(getToken());
  const handleLoginToken = (_token: string) => {
    localStorage.setItem(TOKEN_KEY, _token);
    setToken(_token);
  };

  const router = useRouter();
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ token, handleLoginToken, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
