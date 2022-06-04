import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import axios from "axios";

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

export const useGetTokenState = () => {
  const [token, setToken] = useState<string | null>(getToken());
  return { token, setToken };
};

export const AuthContextProvider: React.FC<{
  children: ReactNode;
  tokenState: ReturnType<typeof useGetTokenState>;
}> = ({ children, tokenState }) => {
  const { token, setToken } = tokenState;
  const handleLoginToken = (_token: string) => {
    localStorage.setItem(TOKEN_KEY, _token);
    setToken(_token);
  };

  const { asPath, push } = useRouter();
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    push("/");
  };

  const { data, error } = useSWR(token ? "/api/auth/me" : null);
  useEffect(() => {
    if (asPath == "/" || asPath == "/register") {
      if (token) {
        push("/users");
      }

      return;
    }

    const tokenMissing = !token;
    const apiWrong = !data && error;

    if (tokenMissing || apiWrong) {
      push("/");
    }
  }, [asPath, push, token, error, data]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }

    axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_ENDPOINT || "";
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, handleLoginToken, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
