import React from "react";

const Footer = () => {
  return (
    <footer className="footer text-center bg-blue-500 p-4 text-white">
      <p>Davide Biscardi</p>
      <p>
        Contatti: <a className="text-red-800" href="mailto:davide.biscardi@proton.me">Email</a>{" "}
        <a className="text-red-800" href="https://t.me/Urgulius">Telegram</a>
      </p>
    </footer>
  );
};

export default Footer;
