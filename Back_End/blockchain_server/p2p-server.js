const webSocket = require("ws");
const MESSAGE_TYPE = {
  chain: "CHAIN",
  voteTransaction: "TRANSACTION",
  voting: "VOTING",
  clear_transactions: "CLEAR_TRANSACTOIN",
};

class P2pServer {
  constructor(blockchain, voteTransactionPool, votingPool) {
    this.blockchain = blockchain;
    this.voteTransactionPool = voteTransactionPool;
    this.votingPool = votingPool;
    this.sockets = [];
  }

  sendChain(socket) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPE.chain,
        chain: this.blockchain.chain,
      })
    );
  }

  sendVoteTransaction(socket, voteTransaction) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPE.voteTransaction,
        voteTransaction,
      })
    );
  }

  sendVoting(socket, voting) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPE.voting,
        voting,
      })
    );
  }

  broadcastClearTransactionPool() {
    this.sockets.forEach((socket) =>
      socket.send(
        JSON.stringify({
          type: MESSAGE_TYPE.clear_transactions,
        })
      )
    );
  }

  messageHandler(socket) {
    socket.on("message", async (message) => {
      const data = JSON.parse(message);

      switch (data.type) {
        case MESSAGE_TYPE.chain:
          await this.blockchain.replaceChain(data.chain);
          break;
        case MESSAGE_TYPE.voteTransaction:
          this.voteTransactionPool.addPrebuildVT(data.voteTransaction);
          break;
        case MESSAGE_TYPE.voting:
          await this.votingPool.addPrebuildVoting(data.voting);
          break;
        case MESSAGE_TYPE.clear_transactions:
          this.voteTransactionPool.clear();
          break;
        default:
          break;
      }
    });
  }

  syncChain() {
    this.sockets.forEach((socket) => this.sendChain(socket));
  }

  broadcastVoteTransaction(voteTransaction) {
    this.sockets.forEach((socket) =>
      this.sendVoteTransaction(socket, voteTransaction)
    );
  }

  broadcastVoting(voting) {
    this.sockets.forEach((socket) => this.sendVoting(socket, voting));
  }

  connectSocket(socket) {
    this.sockets.push(socket);
    console.log("New Socket connected.");

    this.messageHandler(socket);
    this.sendChain(socket);
  }

  listen(peers, port) {
    const server = new webSocket.Server({ port: port });
    // this server on connection
    server.on("connection", (socket) => this.connectSocket(socket));

    // peer servers on open connection
    peers.forEach((peer) => {
      const socket = new webSocket(peer);
      socket.on("open", () => this.connectSocket(socket));
    });

    console.log(`P2P-Server listening on Port: ${port}`);

    return server;
  }
}
module.exports = P2pServer;
