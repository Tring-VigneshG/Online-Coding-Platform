import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import App from './App.jsx'
const client = new ApolloClient({
  uri: "http://localhost:4000", 
  cache: new InMemoryCache(),
});
createRoot(document.getElementById('root')).render(
  <ApolloProvider client={client}>
  <StrictMode>
    <App />
  </StrictMode>
  </ApolloProvider>
  ,
)
