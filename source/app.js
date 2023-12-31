const express = require("express");
const venom = require("venom-bot");

const { questions, response } = require("./responses");

const app = express();
app.use(express.json());

venom
  .create({
    session: "zapgestorapi",
    puppeteerOptions: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-gpu",
    ],
  })
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });

venom
  .create({
    session: "zapgestorassistant",
    puppeteerOptions: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-gpu",
    ],
  })
  .then((client) => startAssistant(client))
  .catch((erro) => {
    console.log("Error Assistant: ", erro);
  });

/**
* API | ZapGestor
*/

function start(client) {
  //users
  app.post("/text", async (req, res) => {
    const body = req.body;

    client.sendText(body.number, body.content).catch((erro) => {
      return res
        .status(500)
        .json({ error: 500, message: "Error when sending", erro: erro });
    });

    return res.status(200).json();
  });

  //groups
  app.get("/groups", async (req, res) => {
    let data = [];

    try {
      const groups = await client.getAllChats().then((chats) => {
        return chats.find((chat) => {
          if (chat.isGroup) {
            data.push({
              group: chat.id._serialized,
              name: chat.name
            });
          }
        });
      });

      return res.status(200).json({ data });
    } catch (e) {
      return res
        .status(404)
        .json({ error: 404, message: e.message });
    }
  });

  app.post("/group/text", async (req, res) => {
    const body = req.body;

    const group = await findGroupByName(client, body.group_name);
    if (!group) {
      return res
        .status(404)
        .json({ error: 404, message: "Not found group name!" });
    }

    client.sendText(group.id._serialized, body.content).catch((erro) => {
      return res
        .status(500)
        .json({ error: 500, message: "Error when sending", erro: erro });
    });

    return res.status(200).json();
  });

  app.post("/group/link", async (req, res) => {
    const body = req.body;

    const group = await findGroupByName(client, body.group_name);
    if (!group) {
      return res
        .status(404)
        .json({ error: 404, message: "Not found group name!" });
    }

    client.sendLinkPreview(
      group.id._serialized,
      body.link,
      body.content
    ).catch((erro) => {
      return res
        .status(500)
        .json({ error: 500, message: "Error when sending", erro: erro });
    });

    return res.status(200).json();
  });

  app.post("/group/image", async (req, res) => {
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
          .status(404)
          .json({ error: 404, message: "Error when sending", erro: erro });
      });

    return res.status(200).json();
  });

  app.post("/group/file", async (req, res) => {
    const body = req.body;

    const group = await findGroupByName(client, body.group_name);
    if (!group) {
      return res
        .status(404)
        .json({ error: 404, message: "Not found group name!" });
    }

    client
      .sendFile(
        group.id._serialized,
        body.file_path,
        "file-send",
        body.content
      )
      .catch((erro) => {
        return res
          .status(404)
          .json({ error: 404, message: "Error when sending", erro: erro });
      });

    return res.status(200).json();
  });

  app.post("/group/voice", async (req, res) => {
    const body = req.body;

    const group = await findGroupByName(client, body.group_name);
    if (!group) {
      return res
        .status(404)
        .json({ error: 404, message: "Not found group name!" });
    }

    client
      .sendVoice(
        group.id._serialized,
        body.voice_path
      )
      .catch((erro) => {
        return res
          .status(404)
          .json({ error: 404, message: "Error when sending", erro: erro });
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

/**
 * Assistant | ZapGestor
 */
function startAssistant(client) {
  //users
  app.post("/assistant/text", async (req, res) => {
    const body = req.body;

    client.sendText(body.number, body.content).catch((erro) => {
      return res
        .status(500)
        .json({ error: 500, message: "Erro ao enviar a mensagem", erro: erro });
    });

    return res.status(200).json();
  });

  app.post("/assistant/image", async (req, res) => {
    const body = req.body;

    client
      .sendImage(
        body.number,
        body.image_path,
        "image-send",
        body.content
      )
      .catch((erro) => {
        return res
          .status(404)
          .json({ error: 404, message: "Errp ap enviar Imagem", erro: erro });
      });

    return res.status(200).json();
  });

  app.post("/assistant/file", async (req, res) => {
    const body = req.body;

    client
      .sendFile(
        body.number,
        body.file_path,
        "file-send",
        body.content
      )
      .catch((erro) => {
        return res
          .status(404)
          .json({ error: 404, message: "Error when sending", erro: erro });
      });

    return res.status(200).json();
  });

  app.post("/assitant/voice", async (req, res) => {
    const body = req.body;

    client
      .sendVoice(
        body.number,
        body.voice_path
      )
      .catch((erro) => {
        return res
          .status(404)
          .json({ error: 404, message: "Error when sending", erro: erro });
      });

    return res.status(200).json();
  });

  client.onMessage((message) => {
    const feedbacks = questions.feedbacks.human;
    if (feedbacks.includes(message.body.toLowerCase()) && message.isGroupMsg === false) {
      client.reply(message.from, response(questions.feedbacks.assistant), message.id)
        .catch((erro) => { console.error('Error when sending: ', erro); });
    }
  });
}

app.listen(3000, () => console.log("Server rodando em :3000"));
