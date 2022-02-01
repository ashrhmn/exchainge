import "../styles/globals.css";
import type { AppProps } from "next/app";
import NavBar from "../components/NavBar";
import { DAppProvider } from "@usedapp/core";

function MyApp({ Component, pageProps }: AppProps) {
  const config = {
    multicallAddresses: {
      1337: "0xD72833fd732FFA84AEd54A76443B3426980CfbfC",
    },
  };
  return (
    <DAppProvider config={config}>
      <NavBar />
      <Component {...pageProps} />
    </DAppProvider>
  );
}

export default MyApp;
