import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { SWRConfig } from "swr";
import { ConfirmContextProvider } from "chakra-confirm";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SWRConfig
      value={{
        refreshInterval: 3000,
        fetcher: (resource, init) =>
          fetch(resource, init).then((res) => res.json()),
      }}
    >
      <ChakraProvider>
        <ConfirmContextProvider>
          <Component {...pageProps} />
        </ConfirmContextProvider>
      </ChakraProvider>
    </SWRConfig>
  );
}

export default MyApp;
