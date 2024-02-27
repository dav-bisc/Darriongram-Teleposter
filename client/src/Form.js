// Form.js
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const Form = () => {
  const [link1, setLink1] = useState("");
  const [link2, setLink2] = useState("");
  const [link3, setLink3] = useState("");


  const handleLink1Change = (event) => {
    setLink1(event.target.value);
  };
  const handleLink2Change = (event) => {
    setLink2(event.target.value);
  };
  const handleLink3Change = (event) => {
    setLink3(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = {link1, link2, link3 };
    const response = await fetch(`http://127.0.0.1:5000/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const result = await response.json();
    console.log(result.msg);

    if (result.msg === "ricevuto") {
      toast.success("Postato con successo su Telegram!");
    } else {
      toast.error(result.msg);
    }
  };

  return (
    <div className="form-container">
      <div>
        <Toaster />
      </div>
      <form className="main-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="link1">Primo link:</label>
          <input
            type="text"
            id="link1"
            name="link1"
            required
            maxLength={255}
            onChange={handleLink1Change}
            title="Link del primo prodotto da postare (foto grande)"
          />
        </div>
        <div className="form-group">
          <label htmlFor="link2">Secondo link:</label>
          <input
            type="text"
            id="link2"
            name="link2"
            maxLength={255}
            onChange={handleLink2Change}
            title="Link del secondo prodotto da postare"
          />
        </div>
        <div className="form-group">
          <label htmlFor="link3">Terzo link:</label>
          <input
            type="text"
            id="link3"
            name="link3"
            maxLength={255}
            onChange={handleLink3Change}
            title="Link del terzo prodotto da postare"
          />
        </div>
        <button type="submit">Invia post</button>
      </form>
    </div>
  );
};

export default Form;
