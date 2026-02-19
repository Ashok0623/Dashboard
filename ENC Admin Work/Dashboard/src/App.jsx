import React from "react";
import { Container } from "react-bootstrap";
import ENCAdminDashboard from "./components/ENCAdminDashboard";
import AnimatedBackground from "./components/AnimatedBackground";

const DEFAULT_USER_INFO = {
  name: "Santhu Prakash Rao Poladi",
  designation: "EE",
  office:
    "O/o:Chief Engineer(Irrigation), Jagitial-Irrigation Circle, Jagitial-Irrigation Division No.6, Vemulawada",
  phone: "+91-9618811282",
  email: "Email Not Updated",
};

const App = () => {
  return (
    <div className="app-bg-wrap">
      <AnimatedBackground />
      <Container fluid className="app-shell px-2 py-2">
        <ENCAdminDashboard userInfo={DEFAULT_USER_INFO} />
      </Container>
    </div>
  );
};

export default App;
