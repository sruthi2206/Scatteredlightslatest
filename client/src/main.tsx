import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Helmet, HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <Helmet>
      <meta charSet="utf-8" />
      <title>Scattered Lights - AI-Powered Inner Healing</title>
      <meta name="description" content="Discover your path to emotional balance, chakra alignment, and inner peace through AI-guided self-discovery." />
    </Helmet>
    <App />
  </HelmetProvider>
);
