import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Helmet, HelmetProvider } from 'react-helmet-async';

const root = createRoot(document.getElementById("root")!);

// Only use StrictMode in production to avoid dev hot reload issues
const AppWrapper = () => (
  <HelmetProvider>
    <Helmet>
      <meta charSet="utf-8" />
      <title>Scattered Lights - AI-Powered Inner Healing</title>
      <meta name="description" content="Discover your path to emotional balance, chakra alignment, and inner peace through AI-guided self-discovery." />
    </Helmet>
    <App />
  </HelmetProvider>
);

if (import.meta.env.PROD) {
  root.render(<React.StrictMode><AppWrapper /></React.StrictMode>);
} else {
  root.render(<AppWrapper />);
}
