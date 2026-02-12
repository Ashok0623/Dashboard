import React from "react";
import { Container } from "react-bootstrap";
import ENCAdminDashboard from "./components/ENCAdminDashboard";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  const userInfo = {
    name: "Santhu Prakash Rao Poladi",
    designation: "EE",
    office: "O/o:Chief Engineer(Irrigation), Jagitial-Irrigation Circle, Jagitial-Irrigation Division No.6, Vemulawada",
    phone: "+91-9618811282",
    email: "Email Not Updated",
  };

  return (
    <Container fluid className="px-2 py-2" style={{ backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
      <ENCAdminDashboard userInfo={userInfo} />
    </Container>
  );
};

export default App;
