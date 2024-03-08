import React from "react";
import "./Header.css"; // Import CSS file for additional styles
import packageJson from "../package.json";

const Header = () => {
  return (
    <header className="header text-center bg-blue-500 p-4 text-white">
      <h1 className="text-3xl font-bold animated-gradient">
        Darriongram Teleposter
      </h1>
      <h5 className="text-sm mt-3">Ver. {packageJson.version}</h5>
    </header>
  );
};

export default Header;
