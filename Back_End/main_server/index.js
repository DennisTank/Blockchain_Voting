const localtunnel = require("localtunnel");
const getPortSync = require("get-port-sync");

const Api = require("./api.js");

const HTTP_PORT = process.env.HTTP_PORT || getPortSync();
const api = new Api();

const serverObj = {
  tunnel: null,
  api: null,
};

(async () => {
  // serverObj.tunnel = await localtunnel({ port: HTTP_PORT });
  // console.log(`URL: ${serverObj.tunnel.url}`);

  api.create();
  serverObj.api = api.app.listen(HTTP_PORT, () => {
    console.log(`API-Server listening on Port: ${HTTP_PORT}`);
  });
})();

// Exit cleanup
process.on("exit", () => {
  console.log("Exiting");
});
process.on("SIGINT", async () => {
  // console.log("Closing localtunnel");
  // await serverObj.tunnel.close();

  console.log("Closing API_Server");
  await serverObj.api.close();
});
process.on("uncaughtException", async (e) => {
  console.log("Uncaught Exception ...");
  console.log(e.stack);

  // console.log("Closing localtunnel");
  // await serverObj.tunnel.close();

  console.log("Closing API_Server");
  await serverObj.api.close();

  process.exit();
});
