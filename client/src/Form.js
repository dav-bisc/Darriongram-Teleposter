// Form.js
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import ScaleLoader from "react-spinners/ScaleLoader";
import { FaRegPaste } from "react-icons/fa6";
import Select from "react-dropdown-select";
const override = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

const Form = () => {
  const [link1, setLink1] = useState("");
  const [link2, setLink2] = useState("");
  const [link3, setLink3] = useState("");
  const [postMsg1, setPostMsg1] = useState("");
  const [postMsg2, setPostMsg2] = useState("");
  const [postMsg3, setPostMsg3] = useState("");
  const [titleLength1, setTitleLength1] = useState("breve");
  const [titleLength2, setTitleLength2] = useState("breve");
  const [titleLength3, setTitleLength3] = useState("breve");
  const [isLoading, setIsLoading] = useState(false);
  const msgOptions = [
    { value: 1, label: "Sconto di ..." },
    { value: 2, label: "passa da ... a ..." },
    { value: 3, label: "OFFERTISSIMA!" },
  ];
  const handleLink1Change = (event) => {
    setLink1(event.target.value);
  };
  const handleLink2Change = (event) => {
    setLink2(event.target.value);
  };
  const handleLink3Change = (event) => {
    setLink3(event.target.value);
  };
  const handlePaste1 = (e) => {
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

  const handleTitleLengthChange1 = (event) => {
    setTitleLength1(event.target.value);
  };
  const handleTitleLengthChange2 = (event) => {
    setTitleLength2(event.target.value);
  };
  const handleTitleLengthChange3 = (event) => {
    setTitleLength3(event.target.value);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = {
      link1,
      link2,
      link3,
      postMsg1,
      postMsg2,
      postMsg3,
      titleLength1,
      titleLength2,
      titleLength3,
    };
    const endpoint = `http://${process.env.REACT_APP_LOCAL_IP_ADDR}:5000`;

    const response = await fetch(`${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const result = await response.json();
    setIsLoading(false);

    if (result.msg === "ricevuto") {
      toast.success("Postato con successo su Telegram!");
    } else {
      toast.error(result.msg);
    }
  };

  return (
    <div className="bg-cover bg-center bg-money-boxes justify-center content-center flex items-center">
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
              onTouchStart={handlePaste1}
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
          </div>
          {}
        </div>
        <label className="font-semibold">Stile messaggio 1</label>
        <Select
          className="font-semibold"
          placeholder="Stile messaggio 1"
          values={msgOptions}
          options={msgOptions}
          onChange={(val) => setPostMsg1(val)}
        />
        <div className="flex">
          <label className="mt-1 mr-4 font-semibold">
            <input
              type="radio"
              value="breve"
              checked={titleLength1 === "breve"}
              className="form-radio h-4 w-4 mr-2"
              onChange={handleTitleLengthChange1}
            />
            Titolo breve
          </label>
          <label className="mt-1 font-semibold">
            <input
              type="radio"
              value="lungo"
              checked={titleLength1 === "lungo"}
              className="form-radio h-4 w-4 mr-2"
              onChange={handleTitleLengthChange1}
            />
            Titolo lungo
          </label>
        </div>
        <div class="border-b border-gray-300 p-3 my-3"></div>
        <div className="form-group">
          <label htmlFor="link2" className="font-semibold">
            Secondo link
          </label>
          <div className="flex items-center">
            <button
              onClick={handlePaste2}
              onTouchStart={handlePaste2}
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
              title="Link del secondo prodotto da postare"
              className="w-64 py-1 px-2 rounded border"
            />
          </div>
        </div>
        <label className="font-semibold">Stile messaggio 2</label>
        <Select
          className="font-semibold"
          placeholder="Stile messaggio 2"
          values={msgOptions}
          options={msgOptions}
          onChange={(val) => setPostMsg2(val)}
        />
        <div className="flex">
          <label className="mt-1 mr-4 font-semibold">
            <input
              type="radio"
              value="breve"
              checked={titleLength2 === "breve"}
              className="form-radio h-4 w-4 mr-2"
              onChange={handleTitleLengthChange2}
            />
            Titolo breve
          </label>
          <label className="mt-1 font-semibold">
            <input
              type="radio"
              value="lungo"
              checked={titleLength2 === "lungo"}
              className="form-radio h-4 w-4 mr-2"
              onChange={handleTitleLengthChange2}
            />
            Titolo lungo
          </label>
        </div>
        <div class="border-b border-gray-300 p-3 my-3"></div>

        <div className="form-group">
          <label htmlFor="link3" className="font-semibold">
            Terzo link
          </label>
          <div className="flex items-center">
            <button
              onClick={handlePaste3}
              onTouchStart={handlePaste3}
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
        <label className="font-semibold">Stile messaggio 3</label>
        <Select
          className="font-semibold"
          placeholder="Stile messaggio 3"
          values={msgOptions}
          options={msgOptions}
          onChange={(val) => setPostMsg3(val)}
        />
        <div className="flex">
          <label className="mt-1 mr-4 font-semibold">
            <input
              type="radio"
              value="breve"
              checked={titleLength3 === "breve"}
              className="form-radio h-4 w-4 mr-2"
              onChange={handleTitleLengthChange3}
            />
            Titolo breve
          </label>
          <label className="mt-1 font-semibold">
            <input
              type="radio"
              value="lungo"
              checked={titleLength3 === "lungo"}
              className="form-radio h-4 w-4 mr-2"
              onChange={handleTitleLengthChange3}
            />
            Titolo lungo
          </label>
        </div>
        <div className="container mx-auto my-auto flex flex-col items-center justify-center">
          <button
            className="rounded-full border-4 border-white border-solid font-bold w-48 py-2 mt-3"
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
