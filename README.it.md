[![eng](https://img.shields.io/badge/lang-eng-red.svg)](https://github.com/dav-bisc/Darriongram-Teleposter/blob/main/README.md)

# Darriongram-Teleposter
Semplice app web per inviare più link di affiliazione Amazon tramite un bot Telegram.

## Requisiti

- Installazione di Docker (ad esempio Docker Desktop).

## Configurazione

Scrivi le seguenti informazioni nel file .env situato nella directory principale:
```
BOT_TOKEN=<Token fornito da Botfather>
CHAT_ID=<ID del canale o della chat dove il bot deve inviare>
ACCESS_KEY=<Fornito nel portale PA di Amazon>
SECRET_KEY=<Fornito nel portale PA di Amazon>
PARTNER_TAG=<Tag partner scelto di Amazon PA>
PARTNER_TYPE=Associates
MARKETPLACE=<Il tuo marketplace Amazon, ad es. 'www.amazon.it'>
REACT_APP_LOCAL_IP_ADDR=<indirizzo ip locale della macchina host>
```

## Avvio

```sh
docker-compose up
```


