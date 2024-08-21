import React from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { Link, useLocation } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import LightModeIcon from '@mui/icons-material/LightMode';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ListIcon from '@mui/icons-material/List';
import HomeIcon from '@mui/icons-material/Home';
import FolderIcon from '@mui/icons-material/Folder';
import { Chip } from '@mui/material';
import styled from 'styled-components';

const CustomMenuItem = styled(MenuItem)`
  position: relative;
  
  &.ps-active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 5px;
    background-color: #1976d2;
  }

  &.ps-active {
    color: #1976d2;
    .pro-icon-wrapper {
      color: #1976d2;
    }
  }

  &:hover {
    color: #1976d2;
    .pro-icon-wrapper {
      color: #1976d2;

    }
    .ps-menu-label {
      transform: translateX(10px);
    }
  }

  .ps-menu-label {
    transition: transform 0.3s ease, color 0.3s ease;
  }
`;

/**
 * Sidebar de la aplicacion
 * @param {*} openSidebar Variable que controla si el sidebar esta abierto o cerrado 
 * @returns {JSX.Element} Sidebar
 */
function SidebarComponent({ openSidebar }) {
  const location = useLocation();

  return (
    <Sidebar collapsed={openSidebar}>
      <Menu>
        <CustomMenuItem active={location.pathname === '/dashboard'} component={<Link to="/dashboard" />} icon={<HomeIcon />}> Dashboard</CustomMenuItem>
        <CustomMenuItem active={location.pathname === '/calendar'} component={<Link to="/calendar" />} icon={<CalendarTodayIcon />}> Calendar <Chip label="By classroom" color="primary" size="small" /></CustomMenuItem>
        <CustomMenuItem active={location.pathname === '/calendarByTeacher'} component={<Link to="/calendarByTeacher" />} icon={<CalendarTodayIcon />}> Calendar <Chip label="By teacher" color="primary" size="small" /></CustomMenuItem>
        <CustomMenuItem active={location.pathname === '/myCalendar'} component={<Link to="/myCalendar" />} icon={<CalendarTodayIcon />}> Calendar <Chip label="My calendar" color="primary" size="small" /></CustomMenuItem>
        <CustomMenuItem active={location.pathname.includes('/user')} component={<Link to="/user" />} icon={<PersonOutlineIcon />}> Users</CustomMenuItem>
        <CustomMenuItem active={location.pathname.includes('/teacher')} component={<Link to="/teacher" />} icon={<PersonOutlineIcon />}> Teachers</CustomMenuItem>
        <SubMenu label="Events" icon={<TaskAltIcon />}>
          <CustomMenuItem active={location.pathname === '/newEvent'} component={<Link to="/newEvent" />}>Add Events</CustomMenuItem>
          <CustomMenuItem active={location.pathname === '/event'} component={<Link to="/event" />}>Suspend Events</CustomMenuItem>
          <CustomMenuItem active={location.pathname.includes('/eventType')} component={<Link to="/eventType" />}>Event Types</CustomMenuItem>
        </SubMenu>
        <SubMenu label="Organization" icon={<FolderIcon />}>
          <CustomMenuItem active={location.pathname.includes('/department')} component={<Link to="/department" />}>Departments</CustomMenuItem>
          <CustomMenuItem active={location.pathname.includes('/classroom')} component={<Link to="/classroom" />}>Classrooms</CustomMenuItem>
          <CustomMenuItem active={location.pathname.includes('/company')} component={<Link to="/company" />}>Companies</CustomMenuItem>
        </SubMenu>
        <CustomMenuItem icon={<LightModeIcon />}> Holidays</CustomMenuItem>
        <CustomMenuItem active={location.pathname === '/techingHours'} component={<Link to="/teachingHours" />} icon={<AccessTimeIcon />}> Teaching hours</CustomMenuItem>
        <SubMenu label="Logs" icon={<ListIcon />}>
          <CustomMenuItem active={location.pathname.includes('/logs')} component={<Link to="/logs" />}> History logs</CustomMenuItem>
          <CustomMenuItem active={location.pathname.includes('/event-logs')} component={<Link to="/event-logs" />}> Event logs</CustomMenuItem>
        </SubMenu>
      </Menu>
    </Sidebar>
  )

}

export default SidebarComponent;