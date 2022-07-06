class BCN {
  constructor(httpsUrl, p2pPort) {
    this.httpsUrl = httpsUrl;
    this.p2pPort = p2pPort;
  }
  P2P() {
    return `ws://localhost:${this.p2pPort}`;
  }
}

class BCNodes {
  constructor() {
    this.pool = [];
    this.counter = 0;
  }

  counterToIndex() {
    if (this.pool.length === 0) {
      return -1;
    } else {
      this.counter = (this.counter + 1) % this.pool.length;
      return this.counter;
    }
  }

  getRandUrl() {
    const index = this.counterToIndex();

    if (index > -1) {
      return { bc_url: this.pool[0].httpsUrl };
    }
    return { bc_url: "" };
  }

  getNode(p2pPort) {
    return this.pool.find((i) => i.p2pPort === p2pPort);
  }

  getP2PExcept(p2pPort) {
    const arr = [];
    this.pool.forEach((i) => {
      if (i.p2pPort !== p2pPort) arr.push(i.P2P());
    });
    return arr;
  }

  addNew(httpsUrl, p2pPort) {
    const exist = this.getNode(p2pPort);

    if (!exist) {
      const bcn = new BCN(httpsUrl, p2pPort);
      this.pool.push(bcn);
      console.log("New Blockchain server added.");
    }
    return this.getP2PExcept(p2pPort);
  }
}
module.exports = BCNodes;
