import React, { useState } from 'react';
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

/**
 * Sidebar de la aplicacion
 * @param {*} openSidebar Variable que controla si el sidebar esta abierto o cerrado 
 * @returns {JSX.Element} Sidebar
 */
function SidebarComponent({ openSidebar }) {
    return (
      <Sidebar collapsed={openSidebar}>
            <Menu>
                <MenuItem component={<Link to="/" />} icon={<HomeIcon />}> Dashboard</MenuItem>
                <MenuItem component={<Link to="/login" />} icon={<CalendarTodayIcon />}> Calendar By Classroom</MenuItem>
                <MenuItem icon={<CalendarTodayIcon />}> Calendar By Teacher</MenuItem>
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