import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { SWRConfig } from "swr";
import { ConfirmContextProvider } from "chakra-confirm";
import { AuthContext, AuthContextProvider } from "../AuthContext";
import { useContext } from "react";

const InnerApp = ({ Component, pageProps }: AppProps) => {
  const { token } = useContext(AuthContext);

  return (
    <SWRConfig
      value={{
        refreshInterval: 3000,
        fetcher: (resource, init) =>
          fetch(resource, {
            ...init,
            headers: {
              ...init?.headers,
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }).then((res) => res.json()),
      }}
    >
      <ChakraProvider>
        <ConfirmContextProvider>
          <Component {...pageProps} />
        </ConfirmContextProvider>
      </ChakraProvider>
    </SWRConfig>
  );
};

function MyApp(props: AppProps) {
  return (
    <AuthContextProvider>
      <InnerApp {...props} />
    </AuthContextProvider>
  );
}

export default MyApp;
