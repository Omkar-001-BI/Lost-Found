import React, { useState } from 'react'
import { setConstraint } from "../constraints";
import { BsFillCaretDownFill } from 'react-icons/bs'
import { Button, Menu, MenuItem, Stack, AppBar, Toolbar, IconButton, Typography, Avatar, Badge, Popover, Drawer, List, ListItem, ListItemText, Divider, Box } from '@mui/material'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import api from '../api/axios';

function Navbar() {
  const token = window.localStorage.getItem("token");
  const user = JSON.parse(window.localStorage.getItem('user'));
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState(null)
    const open = Boolean(anchorEl)

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const notifOpen = Boolean(notifAnchorEl);

  // User menu state
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const userMenuOpen = Boolean(userMenuAnchor);

  // Mobile drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch notifications when bell is clicked
  const handleNotifClick = (event) => {
    setNotifAnchorEl(event.currentTarget);
    if (user?._id) {
      api.get(`/notifications/${user._id}`)
        .then(res => {
          setNotifications(res.data.notifications || []);
          setUnreadCount((res.data.notifications || []).filter(n => !n.isRead).length);
          // Mark all as read
          (res.data.notifications || []).forEach(n => {
            if (!n.isRead) {
              api.put(`/notifications/${n._id}/read`);
            }
          });
        });
    }
  };
  const handleNotifClose = () => {
    setNotifAnchorEl(null);
    setUnreadCount(0);
  };

  // Optionally, fetch unread count on mount
  React.useEffect(() => {
    if (user?._id) {
      api.get(`/notifications/${user._id}`)
        .then(res => {
          setUnreadCount((res.data.notifications || []).filter(n => !n.isRead).length);
        });
    }
  }, [user?._id]);

  const handleUserMenuOpen = (event) => setUserMenuAnchor(event.currentTarget);
  const handleUserMenuClose = () => setUserMenuAnchor(null);

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  const buttonStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'none',
    color: 'black',
    '&:hover': {
        color: 'primary.main',
        backgroundColor: 'transparent',
        transition: 'none',
    },
    '&:focus': {
        color: 'primary.main',
        backgroundColor: 'transparent',
    },
}

  const signout = () => {
    // constraint.LOGGED_IN = false;
    setConstraint(false);

    console.log("Signed out !");
    localStorage.clear();
    window.location.href="/log-in";
  };

  // Navigation links
  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Lost Items', to: '/lostitems' },
    { label: 'Found Items', to: '/founditems' },
    { label: 'Post Item', to: '/postitem' },
    { label: 'My Listings', to: '/mylistings' },
    { label: 'My Messages', to: '/my-messages' },
  ];

  return (
    <AppBar position="sticky" color="inherit" elevation={2} sx={{ mb: 2 }}>
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 3, md: 5 } }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <img src='https://i.ibb.co/G2851XX/Main-Logo-1.png' alt="logo" style={{ height: 40 }} />
            <Typography variant="h6" color="primary" fontWeight={700} sx={{ display: { xs: 'none', sm: 'block' } }}>Lost & Found</Typography>
          </Stack>
        </Link>
        {/* Desktop Nav */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
          {token && navLinks.map(link => (
            <Button
              key={link.to}
              component={Link}
              to={link.to}
              color={location.pathname === link.to ? 'primary' : 'inherit'}
              variant={location.pathname === link.to ? 'contained' : 'text'}
              sx={{ fontWeight: 500, borderRadius: 2 }}
            >
              {link.label}
            </Button>
          ))}
          {!token && (
            <>
              <Button component={Link} to="/log-in" color="primary" variant="outlined" sx={{ ml: 2 }}>
                Login
              </Button>
              <Button component={Link} to="/sign-up" color="secondary" variant="contained" sx={{ ml: 2 }}>
                Signup
              </Button>
            </>
          )}
          {token && (
            <Button onClick={signout} color="error" variant="outlined" sx={{ ml: 2 }}>
              Logout
            </Button>
          )}
          {/* Notification Bell */}
          {token && (
            <IconButton color="inherit" onClick={handleNotifClick} sx={{ ml: 1 }}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          )}
          {/* User Avatar & Menu */}
          {token && user && (
            <>
              <IconButton onClick={handleUserMenuOpen} sx={{ ml: 1 }}>
                <Avatar src={user.img} alt={user.nickname || user.fullname || 'U'} />
              </IconButton>
              <Menu
                anchorEl={userMenuAnchor}
                open={userMenuOpen}
                onClose={handleUserMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem component={Link} to="/mylistings" onClick={handleUserMenuClose}>My Listings</MenuItem>
                <MenuItem component={Link} to="/my-messages" onClick={handleUserMenuClose}>My Messages</MenuItem>
                <Divider />
                <MenuItem onClick={signout}>Logout</MenuItem>
              </Menu>
            </>
          )}
        </Stack>
        {/* Mobile Nav */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
          <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerToggle}>
            <Box sx={{ width: 250, p: 2 }}>
              <Stack spacing={2}>
                {token && navLinks.map(link => (
                  <Button
                    key={link.to}
                    component={Link}
                    to={link.to}
                    color={location.pathname === link.to ? 'primary' : 'inherit'}
                    variant={location.pathname === link.to ? 'contained' : 'text'}
                    sx={{ fontWeight: 500, borderRadius: 2 }}
                    onClick={handleDrawerToggle}
                  >
                    {link.label}
                  </Button>
                ))}
                {!token && (
                  <>
                    <Button component={Link} to="/log-in" color="primary" variant="outlined">Login</Button>
                    <Button component={Link} to="/sign-up" color="secondary" variant="contained">Signup</Button>
                  </>
                )}
                {token && (
                  <Button onClick={signout} color="error" variant="outlined">Logout</Button>
                )}
              </Stack>
            </Box>
          </Drawer>
        </Box>
        {/* Notification Popover */}
        <Popover
          open={notifOpen}
          anchorEl={notifAnchorEl}
          onClose={handleNotifClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { minWidth: 300, maxWidth: 400 } }}
        >
          <Stack p={2} spacing={1}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Notifications</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  size="small"
                  color="primary"
                  variant="outlined"
                  component={Link}
                  to="/notifications-history"
                  onClick={handleNotifClose}
                >
                  View All
                </Button>
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  disabled={notifications.length === 0}
                  onClick={async () => {
                    if (user?._id) {
                      await api.delete(`/notifications/user/${user._id}`);
                      setNotifications([]);
                      setUnreadCount(0);
                      handleNotifClose();
                    }
                  }}
                >
                  Clear All
                </Button>
              </Stack>
            </Stack>
            {notifications.length === 0 && <Typography>No notifications.</Typography>}
            {notifications.map(n => (
              <Stack key={n._id} direction="row" spacing={1} alignItems="center" sx={{ background: n.isRead ? '#f5f5f5' : '#e3f2fd', borderRadius: 1, p: 1 }}>
                <Stack flex={1}>
                  <Typography fontSize="15px">{n.message}</Typography>
                  <Typography variant="caption" color="text.secondary">{new Date(n.createdAt).toLocaleString()}</Typography>
                </Stack>
                {n.itemId && n.itemName && n.itemType && (
                  <Button size="small" component={Link} to={`/${n.itemName}?cid=${n.itemId}&type=${n.itemType}/false&highlightComment=true`} onClick={handleNotifClose}>
                    View Comment
                  </Button>
                )}
              </Stack>
            ))}
          </Stack>
        </Popover>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
