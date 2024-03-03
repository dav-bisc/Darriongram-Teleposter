const express = require("express");
const cors = require("cors");
const TelegramBot = require("node-telegram-bot-api");
const amazonPaapi = require("amazon-paapi");
const emoji = require("node-emoji");

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
  console.log(req.body);
  return res.send(`ricevuto get`);
});

function extractASIN(link) {
  let regex = RegExp(
    "https://www.amazon.it/([\\w-]+/)?(dp|gp/product)/(\\w+/)?(\\w{10})",
  );
  m = link.match(regex);
  if (m) {
    return m[4];
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

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const handleError = (error, res) => {
  console.error("Error:", error);
  res.status(500).send({ msg: error.message });
};

app.post("/", (req, res) => {
  const asin1 = extractASIN(req.body.link1);
  if (asin1 === "") {
    return res.status(400).send({
      msg: "Impossibile recuperare ASIN link1, usare un altro link.",
    });
  }
  let asin2 = "";
  if (req.body.link2 != "") {
    asin2 = extractASIN(req.body.link2);
    if (asin2 === "") {
      return res.status(400).send({
        msg: "Impossibile recuperare ASIN link2, usare un altro link.",
      });
    }
  }
  let asin3 = "";
  if (req.body.link3 != "") {
    asin3 = extractASIN(req.body.link3);
    if (asin3 === "") {
      return res.status(400).send({
        msg: "Impossibile recuperare ASIN link3, usare un altro link.",
      });
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
        amazonPaapi
          .GetItems(commonParameters, requestParameters2)
          .then((data2) => {
            if (!checkProduct(data2, 2).result) {
              throw new Error(checkProduct(data2, 2).msg);
            } else {
              if (req.body.link3 === "") {
                const img1 = extractImg(data, 1);
                const img2 = extractImg(data2, 2);

                const imageURLs = [img1, img2];

                const media = imageURLs.map((imageURL, index) => ({
                  type: "photo",
                  media: imageURL,
                  caption:
                    index === 0
                      ? `
                                    *${emoji.get("bomb")} ${data.ItemsResult.Items[0].ItemInfo.Title.DisplayValue}*\n *${data.ItemsResult.Items[0].Offers.Listings[0].Price.DisplayAmount}* , sconto di ${data.ItemsResult.Items[0].Offers.Listings[0].Price.Savings.DisplayAmount} ${emoji.get("rocket")} \n **[LINK AMAZON](${data.ItemsResult.Items[0].DetailPageURL})\n\n *${emoji.get("bomb")}** ${data2.ItemsResult.Items[0].ItemInfo.Title.DisplayValue}*\n *${data2.ItemsResult.Items[0].Offers.Listings[0].Price.DisplayAmount}*, sconto di ${data2.ItemsResult.Items[0].Offers.Listings[0].Price.Savings.DisplayAmount} ${emoji.get("rocket")}\n **[LINK AMAZON](${data2.ItemsResult.Items[0].DetailPageURL})**
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

                      const imageURLs = [img1, img2, img3];

                      const media = imageURLs.map((imageURL, index) => ({
                        type: "photo",
                        media: imageURL,
                        caption:
                          index === 0
                            ? `
                                        *${emoji.get("bomb")} ${data.ItemsResult.Items[0].ItemInfo.Title.DisplayValue}*\n *${data.ItemsResult.Items[0].Offers.Listings[0].Price.DisplayAmount}* , sconto di ${data.ItemsResult.Items[0].Offers.Listings[0].Price.Savings.DisplayAmount} ${emoji.get("rocket")} \n **[LINK AMAZON](${data.ItemsResult.Items[0].DetailPageURL})\n\n *${emoji.get("bomb")}** ${data2.ItemsResult.Items[0].ItemInfo.Title.DisplayValue}*\n *${data2.ItemsResult.Items[0].Offers.Listings[0].Price.DisplayAmount}*, sconto di ${data2.ItemsResult.Items[0].Offers.Listings[0].Price.Savings.DisplayAmount} ${emoji.get("rocket")}\n **[LINK AMAZON](${data2.ItemsResult.Items[0].DetailPageURL})**\n\n  *${emoji.get("bomb")} ${data3.ItemsResult.Items[0].ItemInfo.Title.DisplayValue}*\n *${data3.ItemsResult.Items[0].Offers.Listings[0].Price.DisplayAmount}*, sconto di ${data3.ItemsResult.Items[0].Offers.Listings[0].Price.Savings.DisplayAmount} ${emoji.get("rocket")}\n **[LINK AMAZON](${data3.ItemsResult.Items[0].DetailPageURL})**
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
