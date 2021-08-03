import React, { useEffect, useState } from "react";
import { List, Button, Input, message } from "antd";

const user = JSON.parse(window.localStorage.getItem("user"));

export default function MyAccountScreen() {
  const [edit, setEdit] = useState(false);
  const [firstname, setFirstname] = useState(user.firstname);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState(user.password);
  const [schoolName, setSchoolName] = useState('');

  useEffect(() => {
    fetch(`/get-school/?school_id=${user.school_id}`)
      .then((res) => res.json())
      .then((data) => {
        if(data.result){
          setSchoolName(data.school.name)
        }else{
          message.error(data.msg)
        }
      });
  }, []);

  const onValidate = () => {
    setEdit(false);
    fetch(`/users/edit-user/${user._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `firstname=${firstname}&email=${email}&password=${password}`,
    });
  };

  return (
    <div>
      <List style={{ marginRight: "2%", marginLeft: "2%" }}>
        <List.Item style={styles.listItem}>
          Firstname:{" "}
          {edit ? (
            <Input
              placeholder={firstname}
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
            />
          ) : (
            firstname
          )}
        </List.Item>
        <List.Item style={styles.listItem}>
          Email:{" "}
          {edit ? (
            <Input
              placeholder={email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          ) : (
            email
          )}
        </List.Item>
        <List.Item style={styles.listItem}>
          Password:{" "}
          {edit ? (
            <Input
              placeholder={password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          ) : (
            password
          )}
        </List.Item>
        <List.Item style={styles.listItem}>
          School name: {schoolName}
        </List.Item>
        {edit ? (
          <Button onClick={onValidate}>Validate</Button>
        ) : (
          <Button onClick={() => setEdit(true)}>Edit</Button>
        )}
      </List>
    </div>
  );
}

const styles = {
  content: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: "100%",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
  },
};
