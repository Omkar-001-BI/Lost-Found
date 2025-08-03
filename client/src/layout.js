import React from "react";
import { Stack } from '@mui/material'
import Navbar from "./Components/Navbar.js";
import Footer from "./Components/footer.js";

function Layout(props) {
  return (
    <Stack
      spacing={0}
      width="100%"
      minHeight="100vh"
      display="flex"
      flexDirection="column"
    >
      <Navbar />
      <Stack flex={1} width="100%">
        {props.children}
      </Stack>
      <Footer />
    </Stack>
  );
}

export default Layout;
