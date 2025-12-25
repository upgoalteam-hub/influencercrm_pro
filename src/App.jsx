import React from "react";
import Routes from "./Routes";
import { AuthProvider } from "./contexts/AuthContext"; // Import AuthProvider

function App() {
  return (
    <AuthProvider> {/* Wrap your entire app with AuthProvider */}
      <Routes />
    </AuthProvider>
  );
}

export default App;