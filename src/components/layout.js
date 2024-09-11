import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, CssBaseline } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';



function Layout({ children }) {
  const [open, setOpen] = React.useState(false);
  const drawerWidth = open ?  180 : 0;

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  return (
    <div style={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" style={{ zIndex: 1201, backgroundColor: 'white' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="primary" // Adjusted for correct icon color
            aria-label="menu"
            onClick={open ? handleDrawerClose : handleDrawerOpen}
            style={{ marginRight: '16px' }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" style={{ color: '#008000' }}>Calintro</Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        onClose={handleDrawerClose}
        style={{ width: drawerWidth, flexShrink: 0 }}
        PaperProps={{ style: { width: drawerWidth, backgroundColor: '#008000' } }}
      >
        <Toolbar />
        <List>
          <ListItem button component={Link} to="/board" onClick={handleDrawerClose}>
            <ListItemText primary="Kanban Board" style={{ color: 'white' }} />
          </ListItem>
        </List>
      </Drawer>
      <main
        style={{
          flexGrow: 1,
          padding: '20px',
          transition: 'margin-left 0.3s ease', // Smooth transition for opening/closing
        }}
      >
        <Toolbar />
        {children}
      </main>
    </div>
  );
}

export default Layout;
