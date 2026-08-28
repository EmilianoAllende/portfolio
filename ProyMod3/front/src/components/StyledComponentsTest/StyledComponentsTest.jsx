import { useState } from "react";
import { ThemeProvider } from "styled-components";
import { Box } from "./styled";

const light = {
  bgColor: "#ffffff",
  color: "#000000",
};

const dark = {
  bgColor: "#000000",
  color: "#ffffff",
};

const Home = () => {
  const [theme, setTheme] = useState(light);

  const changeMode = () => {
    theme.color === "#000000" ? setTheme(dark) : setTheme(light);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box>
        <button onClick={changeMode}>MODE</button>
        <h1>Home</h1>
      </Box>
    </ThemeProvider>
  );
};

export default Home;
