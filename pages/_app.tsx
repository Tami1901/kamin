import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { ConfirmContextProvider } from "chakra-confirm";
import { SWRConfig } from "swr";

import { AuthContextProvider, useGetTokenState } from "../AuthContext";

export const getResourceUrl = (resource: string) => {
  if (resource.startsWith("http")) {
    return resource;
  }

  if (!resource.startsWith("/")) {
    resource = `/${resource}`;
  }

  return `${process.env.NEXT_PUBLIC_API_ENDPOINT}${resource}`;
};

function MyApp({ Component, pageProps }: AppProps) {
  const tokenState = useGetTokenState();

  return (
    <SWRConfig
      value={{
        // refreshInterval: 3000,
        fetcher: (resource, init) =>
          fetch(getResourceUrl(resource), {
            ...init,
            mode: "no-cors",
            headers: {
              ...init?.headers,
              ...(tokenState.token
                ? { Authorization: `Bearer ${tokenState.token}` }
                : {}),
            },
          }).then((res) => res.json()),
      }}
    >
      <AuthContextProvider tokenState={tokenState}>
        <ChakraProvider>
          <ConfirmContextProvider>
            <Component {...pageProps} />
          </ConfirmContextProvider>
        </ChakraProvider>
      </AuthContextProvider>
    </SWRConfig>
  );
}

export default MyApp;
