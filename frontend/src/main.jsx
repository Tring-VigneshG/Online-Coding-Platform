import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";
const client = new ApolloClient({
  uri: "http://localhost:4000", 
  cache: new InMemoryCache(),
});
createRoot(document.getElementById('root')).render(
  <ApolloProvider client={client}>
  <StrictMode>
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </StrictMode>
  </ApolloProvider>
  ,
)
