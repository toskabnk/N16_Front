import React, { useState } from 'react';
import { StyledFlexFull, StyledFlexFullRow } from './styles/StyledContainers'
import SidebarComponent from './components/Sidebar'
import Routes from './routes/Routes';
import HeaderBar from './components/HeaderBar';
import { useSelector } from 'react-redux';

function App() {
  //Variables
  const [collapsed, setCollapsed] = useState(false);

  //Obtener datos del store para saber si el usuario esta autenticado
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)

  return (
    <StyledFlexFull height='100%'>
      {/* Barra de navegacion superior */}
      <HeaderBar
        isAuthenticated={isAuthenticated}
        collapsed={collapsed}
        setCollapsed={setCollapsed}/>
      <StyledFlexFullRow>
        {/* Muestra la barra lateral si esta logueado*/}
        {isAuthenticated ? 
          <SidebarComponent
            openSidebar={collapsed}/> 
        : null}
        <Routes/>  
      </StyledFlexFullRow>
    </StyledFlexFull>
  )
}

export default App
