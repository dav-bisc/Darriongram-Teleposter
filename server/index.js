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
  if (prodData.ItemsResult.Items[0].Images.Primary.Small) {
    return prodData.ItemsResult.Items[0].Images.Primary.Small.URL;
  } else if (prodData.ItemsResult.Items[0].Images.Primary.Medium) {
    return prodData.ItemsResult.Items[0].Images.Primary.Medium.URL;
  } else if (prodData.ItemsResult.Items[0].Images.Primary.Large) {
    return prodData.ItemsResult.Items[0].Images.Primary.Large.URL;
  } else {
    throw new Error(`Il prodotto ${prodNum} non possiede un'immagine adatta`);
  }
}

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

app.post("/", (req, res) => {
  const asin1 = extractASIN(req.body.link1);

  let asin2 = "";
  if (req.body.link2 != "") {
    asin2 = extractASIN(req.body.link2);
  }

  let asin3 = "";
  if (req.body.link3 != "") {
    asin3 = extractASIN(req.body.link3);
  }
  const requestParameters1 = {
    ItemIds: [asin1],
    ItemIdType: "ASIN",
    Condition: "New",
    Resources: [
      "Images.Primary.Medium",
      "ItemInfo.Title",
      "Offers.Listings.Price",
    ],
  };

  const requestParameters2 = {
    ItemIds: [asin2],
    ItemIdType: "ASIN",
    Condition: "New",
    Resources: [
      "Images.Primary.Medium",
      "ItemInfo.Title",
      "Offers.Listings.Price",
    ],
  };

  const requestParameters3 = {
    ItemIds: [asin3],
    ItemIdType: "ASIN",
    Condition: "New",
    Resources: [
      "Images.Primary.Medium",
      "ItemInfo.Title",
      "Offers.Listings.Price",
    ],
  };

  amazonPaapi
    .GetItems(commonParameters, requestParameters1)
    .then((data) => {
      //console.log(data.ItemsResult.Items[0].Offers.Listings[0].Price.Savings)
      if (data.ItemsResult.Items[0].Offers.Listings[0].Price.Savings) {
        if (
          data &&
          data.ItemsResult &&
          data.ItemsResult.Items[0] &&
          data.ItemsResult.Items[0].Offers &&
          data.ItemsResult.Items[0].Offers.Listings[0] &&
          data.ItemsResult.Items[0].Offers.Listings[0].Price
        ) {
          amazonPaapi
            .GetItems(commonParameters, requestParameters2)
            .then((data2) => {
              if (data2.ItemsResult.Items[0].Offers.Listings[0].Price.Savings) {
                if (
                  data2 &&
                  data2.ItemsResult &&
                  data2.ItemsResult.Items[0] &&
                  data2.ItemsResult.Items[0].Offers &&
                  data2.ItemsResult.Items[0].Offers.Listings[0] &&
                  data2.ItemsResult.Items[0].Offers.Listings[0].Price
                ) {
                  amazonPaapi
                    .GetItems(commonParameters, requestParameters3)
                    .then((data3) => {
                      if (
                        data3.ItemsResult.Items[0].Offers.Listings[0].Price
                          .Savings
                      ) {
                        if (
                          data3 &&
                          data3.ItemsResult &&
                          data3.ItemsResult.Items[0] &&
                          data3.ItemsResult.Items[0].Offers &&
                          data3.ItemsResult.Items[0].Offers.Listings[0] &&
                          data3.ItemsResult.Items[0].Offers.Listings[0].Price
                        ) {
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
                                                  *${emoji.get("bomb")} ${data.ItemsResult.Items[0].ItemInfo.Title.DisplayValue}*\n *${data.ItemsResult.Items[0].Offers.Listings[0].Price.DisplayAmount}* , sconto di ${data.ItemsResult.Items[0].Offers.Listings[0].Price.Savings.DisplayAmount} ${emoji.get("rocket")} \n **[LINK](${data.ItemsResult.Items[0].DetailPageURL})\n *${emoji.get("bomb")}** ${data2.ItemsResult.Items[0].ItemInfo.Title.DisplayValue}*\n *${data2.ItemsResult.Items[0].Offers.Listings[0].Price.DisplayAmount}*, sconto di ${data2.ItemsResult.Items[0].Offers.Listings[0].Price.Savings.DisplayAmount} ${emoji.get("rocket")}\n **[LINK](${data2.ItemsResult.Items[0].DetailPageURL})**\n  *${emoji.get("bomb")} ${data3.ItemsResult.Items[0].ItemInfo.Title.DisplayValue}*\n *${data3.ItemsResult.Items[0].Offers.Listings[0].Price.DisplayAmount}*, sconto di ${data3.ItemsResult.Items[0].Offers.Listings[0].Price.Savings.DisplayAmount} ${emoji.get("rocket")}\n **[LINK](${data3.ItemsResult.Items[0].DetailPageURL})** 
                                              `
                                : undefined,
                            parse_mode: "Markdown",
                          }));
                          bot
                            .sendMediaGroup(process.env.CHAT_ID, media)
                            .catch((error) => {
                              console.error("Error:", error);
                              res.status(500).send({ msg: error.message });
                            });
                          return res.status(200).send({ msg: "ricevuto" });
                        } else {
                          throw new Error(
                            "Link 3 non valido, selezionare un altro prodotto",
                          );
                        }
                      } else {
                        throw new Error(
                          "Link 3 contiene un prodotto non in offerta, selezionare un altro prodotto.",
                        );
                      }
                    })
                    .catch((error) => {
                      console.error("Error:", error);
                      res.status(500).send({ msg: error.message });
                    });
                } else {
                  throw new Error(
                    "Link 2 non valido, selezionare un altro prodotto",
                  );
                }
              } else {
                throw new Error(
                  "Link 2 contiene un prodotto non in offerta, selezionare un altro prodotto.",
                );
              }
            })
            .catch((error) => {
              console.error("Error:", error);
              res.status(500).send({ msg: error.message });
            });
        } else {
          throw new Error("Link 1 non valido, selezionare un altro prodotto");
        }
      } else {
        throw new Error(
          "Link 1 contiene un prodotto non in offerta, selezionare un altro prodotto.",
        );
      }
    })
    .catch((error) => {
      console.error(error.message);
      res.status(500).send({ msg: error.message });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
