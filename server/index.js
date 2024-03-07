const express = require("express");
const cors = require("cors");
const TelegramBot = require("node-telegram-bot-api");
const amazonPaapi = require("amazon-paapi");
const emoji = require("node-emoji");
const axios = require("axios");

const commonParameters = {
  AccessKey: process.env.ACCESS_KEY,
  SecretKey: process.env.SECRET_KEY,
  PartnerTag: process.env.PARTNER_TAG,
  PartnerType: process.env.PARTNER_TYPE,
  Marketplace: process.env.MARKETPLACE,
};

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  return res.send(`ricevuto get`);
});

async function expandAmazonLink(shortenedLink) {
  try {
    const response = await axios.get(shortenedLink);
    const expandedLink = response.request.res.responseUrl;
    return expandedLink;
  } catch (error) {
    console.error("Error expanding Amazon link:", error);
    return error.msg;
  }
}

function extractASIN(link) {
  let regex = RegExp(
    "https://www.amazon.it/([\\w-]+/)?(dp|gp/product)/(\\w+/)?(\\w{10})",
  );
  let regex2 = RegExp("/(?:dp|gp/product)/([A-Z0-9]{10})(?:/|$)");

  let regex3 = RegExp("//(dp|product)/([A-Za-z0-9]+)/");

  m = link.match(regex);
  m2 = link.match(regex2);
  m3 = link.match(regex3);

  if (m && m !== null) {
    return m[4];
  }
  if (m2 && m2 !== null) {
    return m2[1];
  }
  if (m3 && m3 !== null) {
    return m3[1];
  }
  return "";
}
//prodData.ItemsResult.Items[0].Images.Primary.Medium.URL;
function extractImg(prodData, prodNum) {
  if (prodData.ItemsResult.Items[0].Images.Primary.Large) {
    return prodData.ItemsResult.Items[0].Images.Primary.Large.URL;
  } else if (prodData.ItemsResult.Items[0].Images.Primary.Medium) {
    return prodData.ItemsResult.Items[0].Images.Primary.Medium.URL;
  } else if (prodData.ItemsResult.Items[0].Images.Primary.Small) {
    return prodData.ItemsResult.Items[0].Images.Primary.Small.URL;
  } else {
    throw new Error(`Il prodotto ${prodNum} non possiede un'immagine adatta`);
  }
}

function checkProduct(prodData, prodNum) {
  if (
    !prodData ||
    !prodData.ItemsResult ||
    !prodData.ItemsResult.Items[0] ||
    !prodData.ItemsResult.Items[0].Offers ||
    !prodData.ItemsResult.Items[0].Offers.Listings[0] ||
    !prodData.ItemsResult.Items[0].Offers.Listings[0].Price
  ) {
    return {
      result: false,
      msg: `Il link ${prodNum} non è valido, scegliere un link diverso.`,
    };
  } else if (!prodData.ItemsResult.Items[0].Offers.Listings[0].Price.Savings) {
    return {
      result: false,
      msg: `Il link ${prodNum} contiene un prodotto non in offerta, scegliere un link diverso.`,
    };
  } else {
    return { result: true };
  }
}

function shortenString(s, N) {
  if (s.length > N) {
    return s.substring(0, N) + "...";
  } else {
    return s;
  }
}

function makePostMsg(postMsg, data) {
  if (postMsg === "" || postMsg === null || typeof postMsg === "undefined") {
    return `sconto di ${data.ItemsResult.Items[0].Offers.Listings[0].Price.Savings.DisplayAmount}`;
  } else {
    if (postMsg[0].value === 1) {
      return `, sconto di ${data.ItemsResult.Items[0].Offers.Listings[0].Price.Savings.DisplayAmount}`;
    } else if (postMsg[0].value === 2) {
      const savingAmount =
        data.ItemsResult.Items[0].Offers.Listings[0].Price.Savings.Amount;
      const priceAmount =
        data.ItemsResult.Items[0].Offers.Listings[0].Price.Amount;
      const originalAmount = Number(priceAmount) + Number(savingAmount);
      return `invece di ${originalAmount.toFixed(2)} € !`;
    } else if (postMsg[0].value === 3) {
      return " OFFERTISSIMA!";
    }
  }
}

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const handleError = (error, res) => {
  console.error("Error:", error);
  res.status(500).send({ msg: error.message });
};

app.post("/", async (req, res) => {
  let asin1 = "";
  try {
    const link1 =
      req.body.link1.length < 32
        ? await expandAmazonLink(req.body.link1)
        : req.body.link1;
    asin1 = extractASIN(link1);
    if (asin1 === "") {
      return res.status(400).send({
        msg: "Impossibile recuperare ASIN link1, usare un altro link.",
      });
    }
  } catch (e) {
    return res
      .status(400)
      .send({ msg: "Errore nell'espansione del link abbreviato" });
  }


  let asin2 = "";
  if (req.body.link2 != "") {
    try {
      const link2 =
        req.body.link2.length < 32
          ? await expandAmazonLink(req.body.link2)
          : req.body.link2;

      asin2 = extractASIN(link2);
      if (asin2 === "") {
        return res.status(400).send({
          msg: "Impossibile recuperare ASIN link2, usare un altro link.",
        });
      }
    } catch (e) {
      return res
        .status(400)
        .send({ msg: "Errore nell'espansione del link abbreviato" });
    }
  }

  let asin3 = "";
  if (req.body.link3 != "") {
    try {
      const link3 =
        req.body.link3.length < 32
          ? await expandAmazonLink(req.body.link3)
          : req.body.link3;

      asin3 = extractASIN(link3);
      if (asin3 === "") {
        return res.status(400).send({
          msg: "Impossibile recuperare ASIN link3, usare un altro link.",
        });
      }
    } catch (e) {
      return res
        .status(400)
        .send({ msg: "Errore nell'espansione del link abbreviato" });
    }
  }

  const requestParameters1 = {
    ItemIds: [asin1],
    ItemIdType: "ASIN",
    Condition: "New",
    Resources: [
      "Images.Primary.Large",
      "ItemInfo.Title",
      "Offers.Listings.Price",
    ],
  };

  const requestParameters2 =
    req.body.link2 === ""
      ? null
      : {
          ItemIds: [asin2],
          ItemIdType: "ASIN",
          Condition: "New",
          Resources: [
            "Images.Primary.Large",
            "ItemInfo.Title",
            "Offers.Listings.Price",
          ],
        };

  const requestParameters3 =
    req.body.link3 === ""
      ? null
      : {
          ItemIds: [asin3],
          ItemIdType: "ASIN",
          Condition: "New",
          Resources: [
            "Images.Primary.Large",
            "ItemInfo.Title",
            "Offers.Listings.Price",
          ],
        };

  amazonPaapi
    .GetItems(commonParameters, requestParameters1)
    .then((data) => {
      if (!checkProduct(data, 1).result) {
        throw new Error(checkProduct(data, 1).msg);
      } else {
        if (req.body.link2 === "") {
          const postMsg = makePostMsg(req.body.postMsg1, data);
          const img1 = extractImg(data, 1);
          const title1 = shortenString(
            data.ItemsResult.Items[0].ItemInfo.Title.DisplayValue,
            48,
          );
          const caption = `*${emoji.get("bomb")} ${title1}*\n *${data.ItemsResult.Items[0].Offers.Listings[0].Price.DisplayAmount}* ${postMsg} ${emoji.get("rocket")} \n **[LINK AMAZON](${data.ItemsResult.Items[0].DetailPageURL})`;
          bot
            .sendPhoto(process.env.CHAT_ID, img1, {
              parse_mode: "Markdown",
              caption: `${caption}`,
            })
            .catch((error) => {
              handleError(error, res);
            });
          return res.status(200).send({ msg: "ricevuto" });
        }
        amazonPaapi
          .GetItems(commonParameters, requestParameters2)
          .then((data2) => {
            if (!checkProduct(data2, 2).result) {
              throw new Error(checkProduct(data2, 2).msg);
            } else {
              if (req.body.link3 === "") {
                const img1 = extractImg(data, 1);
                const img2 = extractImg(data2, 2);

                const title1 = shortenString(
                  data.ItemsResult.Items[0].ItemInfo.Title.DisplayValue,
                  48,
                );
                const title2 = shortenString(
                  data2.ItemsResult.Items[0].ItemInfo.Title.DisplayValue,
                  48,
                );

                const postMsg = makePostMsg(req.body.postMsg1, data);
                const postMsg2 = makePostMsg(req.body.postMsg2, data2);
                const imageURLs = [img1, img2];

                const media = imageURLs.map((imageURL, index) => ({
                  type: "photo",
                  media: imageURL,
                  caption:
                    index === 0
                      ? `
                                    *${emoji.get("bomb")} ${title1}*\n *${data.ItemsResult.Items[0].Offers.Listings[0].Price.DisplayAmount}* ${postMsg} ${emoji.get("rocket")} \n **[LINK AMAZON](${data.ItemsResult.Items[0].DetailPageURL})\n\n *${emoji.get("bomb")}** ${title2}*\n *${data2.ItemsResult.Items[0].Offers.Listings[0].Price.DisplayAmount}* ${postMsg2} ${emoji.get("rocket")}\n **[LINK AMAZON](${data2.ItemsResult.Items[0].DetailPageURL})**
                                `
                      : undefined,
                  parse_mode: "Markdown",
                }));
                bot
                  .sendMediaGroup(process.env.CHAT_ID, media)
                  .catch((error) => {
                    handleError(error, res);
                  });
                return res.status(200).send({ msg: "ricevuto" });
              } else {
                amazonPaapi
                  .GetItems(commonParameters, requestParameters3)
                  .then((data3) => {
                    if (!checkProduct(data3, 3).result) {
                      throw new Error(checkProduct(data3, 3).msg);
                    } else {
                      const img1 = extractImg(data, 1);
                      const img2 = extractImg(data2, 2);
                      const img3 = extractImg(data3, 3);

                      const title1 = shortenString(
                        data.ItemsResult.Items[0].ItemInfo.Title.DisplayValue,
                        48,
                      );
                      const title2 = shortenString(
                        data2.ItemsResult.Items[0].ItemInfo.Title.DisplayValue,
                        48,
                      );
                      const title3 = shortenString(
                        data3.ItemsResult.Items[0].ItemInfo.Title.DisplayValue,
                        48,
                      );

                      const postMsg = makePostMsg(req.body.postMsg1, data);
                      const postMsg2 = makePostMsg(req.body.postMsg2, data2);
                      const postMsg3 = makePostMsg(req.body.postMsg3, data3);

                      const imageURLs = [img1, img2, img3];

                      const media = imageURLs.map((imageURL, index) => ({
                        type: "photo",
                        media: imageURL,
                        caption:
                          index === 0
                            ? `
                                        *${emoji.get("bomb")} ${title1}*\n *${data.ItemsResult.Items[0].Offers.Listings[0].Price.DisplayAmount}* ${postMsg} ${emoji.get("rocket")} \n **[LINK AMAZON](${data.ItemsResult.Items[0].DetailPageURL})\n\n *${emoji.get("bomb")}** ${title2}*\n *${data2.ItemsResult.Items[0].Offers.Listings[0].Price.DisplayAmount}* ${postMsg2} ${emoji.get("rocket")}\n **[LINK AMAZON](${data2.ItemsResult.Items[0].DetailPageURL})**\n\n  *${emoji.get("bomb")} ${title3}*\n *${data3.ItemsResult.Items[0].Offers.Listings[0].Price.DisplayAmount}* ${postMsg3} ${emoji.get("rocket")}\n **[LINK AMAZON](${data3.ItemsResult.Items[0].DetailPageURL})**
                                    `
                            : undefined,
                        parse_mode: "Markdown",
                      }));
                      bot
                        .sendMediaGroup(process.env.CHAT_ID, media)
                        .catch((error) => {
                          handleError(error, res);
                        });
                      return res.status(200).send({ msg: "ricevuto" });
                    }
                  })
                  .catch((error) => {
                    handleError(error, res);
                  });
              }
            }
          })
          .catch((error) => {
            handleError(error, res);
          });
      }
    })
    .catch((error) => {
      handleError(error, res);
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
