import React from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { Link } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import LightModeIcon from '@mui/icons-material/LightMode';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ListIcon from '@mui/icons-material/List';
import HomeIcon from '@mui/icons-material/Home';
import FolderIcon from '@mui/icons-material/Folder';
import { Chip } from '@mui/material';

/**
 * Sidebar de la aplicacion
 * @param {*} openSidebar Variable que controla si el sidebar esta abierto o cerrado 
 * @returns {JSX.Element} Sidebar
 */
function SidebarComponent({ openSidebar }) {
    return (
      <Sidebar collapsed={openSidebar}>
            <Menu>
                <MenuItem component={<Link to="/dashboard" />} icon={<HomeIcon />}> Dashboard</MenuItem>
                <MenuItem component={<Link to="/calendar" />} icon={<CalendarTodayIcon />}> Calendar <Chip label="By classroom" color="primary" size="small" /></MenuItem>
                <MenuItem component={<Link to="/calendarByTeacher" />} icon={<CalendarTodayIcon />}> Calendar <Chip label="By teacher" color="primary" size="small"/></MenuItem>
                <MenuItem component={<Link to="/myCalendar" />} icon={<CalendarTodayIcon />}> Calendar <Chip label="My calendar" color="primary" size="small"/></MenuItem>
                <MenuItem icon={<PersonOutlineIcon />}> Users</MenuItem>
                <MenuItem icon={<PersonOutlineIcon />}> Teachers</MenuItem>
                <MenuItem icon={<TaskAltIcon />}> Events</MenuItem>
                <MenuItem icon={<FolderIcon />}> Organizations</MenuItem>
                <MenuItem icon={<LightModeIcon />}> Holidays</MenuItem>
                <MenuItem icon={<AccessTimeIcon />}> Teaching hours</MenuItem>
                <MenuItem icon={<ListIcon />}> Logs</MenuItem>
            </Menu>
      </Sidebar>
    )
}

export default SidebarComponent;