import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import client from "../apolloClient.js";
createRoot(document.getElementById("root")).render(
  <ApolloProvider client={client}>
    <StrictMode>

        <App />

    </StrictMode>
  </ApolloProvider>
);
