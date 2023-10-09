const express = require("express");
const venom = require("venom-bot");

const app = express();
app.use(express.json());

venom
  .create({
    session: "zapgestorapi", //name of session
  })
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });

function start(client) {
  app.post("/sendImageGroup", async (req, res) => {
    const body = req.body;

    const group = await findGroupByName(client, body.group_name);
    if (!group) {
      return res
        .status(404)
        .json({ error: 404, message: "Not found group name!" });
    }

    client
      .sendImage(
        group.id._serialized,
        body.image_path,
        "image-send",
        body.content
      )
      .catch((erro) => {
        return res
          .status(500)
          .json({ error: 500, message: "Error when sending", erro: erro });
      });

    return res.status(200).json();
  });

  app.post("/sendText", async (req, res) => {
    const body = req.body;

    client.sendText(body.number, body.content).catch((erro) => {
      return res
        .status(500)
        .json({ error: 500, message: "Error when sending", erro: erro });
    });

    return res.status(200).json();
  });
}

//Função responsavel por pegar informaçoes do grupo pesquisado
async function findGroupByName(client, groupName) {
  const group = await client.getAllChats().then((chats) => {
    return chats.find((chat) => {
      if (chat.isGroup && chat.name === groupName) {
        return chat;
      }
    });
  });

  return group;
}

app.listen(3000, () => console.log("Server rodando em :3000"));
