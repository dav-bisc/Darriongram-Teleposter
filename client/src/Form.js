// Form.js
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import ScaleLoader from "react-spinners/ScaleLoader";
import { FaRegPaste } from "react-icons/fa6";
const override = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

const Form = () => {
  const [link1, setLink1] = useState("");
  const [link2, setLink2] = useState("");
  const [link3, setLink3] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLink1Change = (event) => {
    setLink1(event.target.value);
  };
  const handleLink2Change = (event) => {
    setLink2(event.target.value);
  };
  const handleLink3Change = (event) => {
    setLink3(event.target.value);
  };
  const handlePaste1 = () => {
    navigator.clipboard.readText().then((copiedLink) => {
      setLink1(copiedLink);
    });
  };
  const handlePaste2 = () => {
    navigator.clipboard.readText().then((copiedLink) => {
      setLink2(copiedLink);
    });
  };
  const handlePaste3 = () => {
    navigator.clipboard.readText().then((copiedLink) => {
      setLink3(copiedLink);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = { link1, link2, link3 };
    const endpoint = "http://127.0.0.1:5000/";

    const response = await fetch(`${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const result = await response.json();
    console.log(result.msg);
    setIsLoading(false);

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
      <form className="main-form bg-blue-500" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="link1" className="font-semibold">
            Primo link
          </label>
          <div className="flex items-center">
            <button
              onClick={handlePaste1}
              className="py-1 px-1 bg-blue-400 text-white rounded-sm mr-2"
              type="button"
            >
              <FaRegPaste />
            </button>
            {/* Reduced padding to px-1 */}
            <input
              type="text"
              id="link1"
              name="link1"
              value={link1}
              required
              maxLength={255}
              onChange={handleLink1Change}
              title="Link del primo prodotto da postare (foto grande)"
              className="w-64 py-1 px-2 rounded border"
            />
            {}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="link2" className="font-semibold">
            Secondo link
          </label>
          <div className="flex items-center">
            <button
              onClick={handlePaste2}
              className="py-1 px-1 bg-blue-400 text-white rounded-sm mr-2"
              type="button"
            >
              <FaRegPaste />
            </button>
            {/* Reduced padding to px-1 */}
            <input
              type="text"
              id="link2"
              name="link2"
              value={link2}
              maxLength={255}
              onChange={handleLink2Change}
              required
              title="Link del secondo prodotto da postare"
              className="w-64 py-1 px-2 rounded border"
            />
          </div>
          {}
        </div>
        <div className="form-group">
          <label htmlFor="link3" className="font-semibold">
            Terzo link
          </label>
          <div className="flex items-center">
            <button
              onClick={handlePaste3}
              className="py-1 px-1 bg-blue-400 text-white rounded-sm mr-2"
              type="button"
            >
              <FaRegPaste />
            </button>
            {/* Reduced padding to px-1 */}
            <input
              type="text"
              id="link3"
              name="link3"
              value={link3}
              maxLength={255}
              onChange={handleLink3Change}
              title="Link del terzo prodotto da postare"
              className="w-64 py-1 px-2 rounded border"
            />
            {}
          </div>
        </div>
        <div className="container mx-auto my-auto flex flex-col items-center justify-center">
          <button
            className="rounded-full border-4 border-white border-solid font-bold w-48 py-2"
            type="submit"
          >
            Invia post
          </button>
          <ScaleLoader
            color={"#ffffff"}
            loading={isLoading}
            cssOverride={override}
            size={150}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      </form>
    </div>
  );
};

export default Form;
