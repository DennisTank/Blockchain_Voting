// requirement check
const Config = require("./config.js");
const config = Config.GetConfig();
//
const getPort = require("get-port-sync");
const axios = require("axios");

const APIServer = require("./api-server.js");
const P2pServer = require("./p2p-server.js");

const BlockChain = require("./components/blockchain.js");
const VotingPool = require("./components/voting-pool.js");
const VoteTransactionPool = require("./components/vote-transaction-pool.js");
const Miner = require("./components/miner.js");

const HTTP_PORT = process.env.HTTP_PORT || getPort();
const P2P_PORT = process.env.P2P_PORT || getPort();

const MainUrl = config.MainUrl;

const bc = new BlockChain();
const vp = new VotingPool();
const vtp = new VoteTransactionPool();
const p2p = new P2pServer(bc, vtp, vp);
const miner = new Miner(bc, vp, vtp, p2p);
const api = new APIServer(bc, vp, vtp, p2p, miner);

// start the server
const serverObj = {
  tunnel: null,
  http: null,
  p2p: null,
};

const Start = async () => {
  try {
    const res = await axios.get(`${MainUrl}/peers`, {
      data: {
        httpsUrl: `http://localhost:${HTTP_PORT}`,
        p2pPort: P2P_PORT,
      },
    });
    let peers = res.data;

    api.create();
    serverObj.http = api.app.listen(HTTP_PORT, () => {
      console.log(`API-Server listening on Port: ${HTTP_PORT}`);
    });

    serverObj.p2p = p2p.listen(peers, P2P_PORT);
  } catch (error) {
    console.log(error);
  }
};

(async () => {
  await bc.loadData();
  await vp.loadData();
})().then(() => {
  Start();
});

// Exit cleanup
process.on("exit", () => {
  console.log("Exiting");
});
process.on("SIGINT", async () => {
  console.log("Closing API_Server");
  await serverObj.http.close();

  console.log("Closing P2P-Server");
  await serverObj.p2p.close();
});
process.on("uncaughtException", async (e) => {
  console.log("Uncaught Exception ...");
  console.log(e.stack);

  console.log("Closing API_Server");
  await serverObj.http.close();

  console.log("Closing P2P-Server");
  await serverObj.p2p.close();

  process.exit();
});
