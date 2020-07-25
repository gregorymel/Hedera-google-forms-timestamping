const cors = require("cors");
import express from "express";
import bodyParser from "body-parser";
import { readFileSync } from "fs";
import { createHash } from "crypto";

const gf = require("./index");


import { HederaConsensusService } from "./ConsensusService";

const config = require("../configs/config.json");
const cridentials = readFileSync("credentials.json").toString();

const consensusService = new HederaConsensusService(
    config.hedera.operatorPrivateKey,
    config.hedera.operatorAccount,
    config.hedera.mirrorNodeAddress);

const formIdToTopicMap: Map<string, string> = new Map();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.json());

app.post("/google_form", async (req, res) => {
    const url = req.body["url"];
    const re = new RegExp("/d/(.*)/edit");
    const match = url.match(re);
    if (match && match[1]) {
        const formId = match[1];
        console.log("formId", formId);
        gf.authorize(JSON.parse(cridentials), gf.callAppsScript, url);

        const topicId = await consensusService.createTopic();
        console.log("topicId", topicId);
        formIdToTopicMap.set(formId, topicId);
        res.status(200).send(topicId);
    } else {
        res.status(404).send("Error");
    }
});

app.post("/response", async (req, res) => {
    console.log(req.body);
    const formId = req.body[0];
    const data = req.body[1];

    const hash = createHash("sha256").update(JSON.stringify(data)).digest("base64");
    console.log("hash", hash);

    const topicId = formIdToTopicMap.get(formId);
    if (topicId) {
        await consensusService.sendMessage(topicId, hash);
    }

    res.status(200).send("OK");
});

app.listen(port, () => {
    // if (err) {
    //     return console.log("something bad happened", err);
    // }
    console.log(`server is listening on ${port}`);
});