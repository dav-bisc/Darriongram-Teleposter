[![eng](https://img.shields.io/badge/lang-it-yellow.svg)](https://github.com/dav-bisc/Darriongram-Teleposter/blob/main/README.md)

# Darriongram-Teleposter
Simple web app to post multiple Amazon affiliate links through a Telegram bot.

## Requirements

- Docker installation (e.g. Docker Desktop).

## Configuration

Write the following information in the .env file located inside the root directory:
```
BOT_TOKEN=<Token provided by Botfather>
CHAT_ID=<ID of the channel or chat where the bot is supposed to post>
ACCESS_KEY=<Provided in Amazon's PA portal>
SECRET_KEY=<Provided in Amazon's PA portal>
PARTNER_TAG=<Amazon's PA chosen partner tag>
PARTNER_TYPE=Associates
MARKETPLACE=<Your amazon market place, e.g. 'www.amazon.it'>
```

## Startup

```sh
docker-compose up
```


