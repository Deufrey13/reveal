import React, {useEffect, useState} from 'react'
import {Redirect, Link} from 'react-router-dom';

import colors from '../helpers/colors'

export default function Navbar() {
  const [userExists, setUserExists] = useState(true)
  useEffect(()=>{
    const school_id = window.localStorage.getItem('school_id')
      if(!school_id){
          setUserExists(false)
      }
  }, [])

  if(!userExists) return <Redirect to='/'/>
  return (
    <>
      <div style={styles.navbar}>
        <Link to="/"><img src="/reveal.png" style={styles.logo} alt="Reveal" /></Link>
        <div style={{display:"flex"}}>
          <Link to="/template-management" style={styles.link}><img src="/list-solid.svg" alt="list-icon"/> Liste des templates</Link>
          <Link to="/diploma-list" style={styles.link}><img src="/list-solid.svg" alt="list-icon"/> Liste des diplômés</Link>
          <Link to="/settings/account" style={styles.link}><img src="/settings.svg" alt="list-icon"/> Settings</Link>
        </div>
      </div>
      <div style={styles.navbarPadding}></div>
    </>
  )
}

const styles = {
  navbar:{
    position: "fixed",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100vw",
    padding: 30,
    backgroundColor: "white",
    borderBottom: `1px solid ${colors.gray}`
  },
  logo:{
    height: 50
  },
  link:{
    margin: 20,
    marginTop: 0,
    marginBottom: 0,
  },
  navbarPadding:{
    width: "100vw",
    height: 110
  }
}
