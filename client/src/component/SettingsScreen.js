import React from "react";
import { Row, Col, Divider, List } from "antd";
import Navbar from "./Navbar";
import MyAccountScreen from "./MyAccountScreen";
import MyCollaboratorsScreen from "./MyCollaboratorsScreen";
// import { Layout } from "antd";
import { Link, useParams, useHistory } from "react-router-dom"
import MySchoolScreen from "./MySchoolScreen";

const user = JSON.parse(window.localStorage.getItem('user'));

export default function SettingsScreen() {
  const { tab } = useParams();
  let history = useHistory();

  const disconnect = () => {
    window.localStorage.removeItem('school_id')
    window.localStorage.removeItem('user')
    history.push("/");
  }
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar></Navbar>
      <Row style={{ flexGrow: 2 }}>
        <Col span={5} style={{ height: "100%", marginLeft: "2%" }}>
          <List>
            <List.Item><Link to="/settings/account">Mon compte</Link></List.Item>
            {user.role === 'gérant' && <List.Item><Link to="/settings/collaborators">Mes collaborateurs</Link></List.Item>}
            <List.Item><Link to="/settings/etablissement">Mon établissement</Link></List.Item>
          </List>
          <div style={{position: "absolute", bottom: 20, color: "red", cursor: "pointer"}} onClick={disconnect}>Déconnexion</div>
        </Col>
        <Divider type="vertical" style={{ height: "100%" }} />
        <Col span={18} style={{ height: "100%" }}>
          {tab === 'account' && <MyAccountScreen />}
          {tab === 'collaborators' && <MyCollaboratorsScreen />}
          {tab === 'etablissement' && <MySchoolScreen />}
        </Col>
      </Row>
    </div>
  );
}
