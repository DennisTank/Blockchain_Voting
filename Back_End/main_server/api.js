const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const BCNodes = require("./models/bc-nodes.js");

const DB = require("./database");
const Mailer = require("./mailer");
const ImgRoute = require("./assets/img-route.js");
const CryptoFun = require("./crypto-fun.js");

class Api {
  constructor() {
    this.db = new DB();
    this.mailer = new Mailer("./mailer/ep.txt");
    this.imgRoute = new ImgRoute();
    this.app = express();
    this.bcNodes = new BCNodes();
  }

  async addVoteIdsToAll(emails, voteId) {
    for (const e of emails) {
      await this.db.addVoteIdAtUser(e, voteId);
    }
  }

  async sendMail(obj) {
    const sent = await Mailer.mail(obj.ep, obj.email, obj.details);
    // will try max 3 times to send the mail if error
    if (!sent && obj.time < 2) {
      obj.time++;
      console.log("Trying again to send the mail in 10secs");
      // 1000 -> 1 sec
      setTimeout(obj.call, 10000, { ...obj });
    }
  }

  async sendMailsToAll(emails, title, startTime, endTime) {
    const addresses = [];
    const st = new Date(startTime).toLocaleString(undefined, {
      timeZone: "Asia/Kolkata",
    });
    const et = new Date(endTime).toLocaleString(undefined, {
      timeZone: "Asia/Kolkata",
    });

    for (const e of emails) {
      const details = {
        title: title,
        st: st,
        et: et,
        secret: CryptoFun.createSecret(),
      };

      await this.sendMail({
        call: this.sendMail,
        ep: this.mailer.ep,
        email: e,
        details: details,
        time: 0,
      });
      const a = CryptoFun.getPublicKeyOfSecret(details.secret);
      addresses.push(a);
    }

    return addresses;
  }

  async setVotingObjAtBC(votingObj) {
    const url = this.bcNodes.getRandUrl();

    const response = await axios.post(`${url.bc_url}/voting`, {
      voting: votingObj,
    });
    if (response.data.success !== true) {
      console.log("An upload for VoteObj to Blockchain server failed.");
    } else {
      console.log("An upload for VoteObj to Blockchain server success.");
    }
  }

  create() {
    this.app.use(bodyParser.json());
    this.app.use(cors());
    this.app.use("/images", express.static("assets/images"));
    /* routes */

    //GET

    this.app.get("/peers", (req, res) => {
      const { httpsUrl, p2pPort } = req.body;
      const list = this.bcNodes.addNew(httpsUrl, p2pPort);
      res.json(list);
    });

    this.app.get("/login", async (req, res) => {
      const { email, password } = req.body;

      const user = await this.db.getUser(undefined, email);

      if (user) {
        if (user.password === password) {
          const u = { ...user };
          delete u.password;
          res.json(u);
          return;
        }
      } else {
        return res.json({
          success: false,
          msg: "Invalid email or password.",
        });
      }
    });

    this.app.get("/user", async (req, res) => {
      const { id } = req.body;

      const user = await this.db.getUser(id, undefined);

      if (user) {
        res.json({
          votings: user.votings,
        });
        return;
      }
      res.json({ votings: [] });
    });

    this.app.get("/voting", async (req, res) => {
      const { voteId } = req.body;

      const voting = await this.db.getVoting(voteId);

      if (voting) {
        const u = { ...voting };

        u.totalVoters = u.emails.length;

        delete u.emails;
        delete u.participants;
        res.json(u);
        return;
      }
      res.json();
    });

    this.app.get("/result", async (req, res) => {
      const { voteId } = req.query;

      const url = this.bcNodes.getRandUrl();

      const response = await axios.get(`${url.bc_url}/votes`, {
        data: { voteId },
      });
      const result = await this.db.addResult(voteId, response.data);
      res.json(result);
    });

    this.app.get("/rand-bc-node", (req, res) => {
      const url = this.bcNodes.getRandUrl();
      res.json(url);
    });

    //POST
    this.app.post("/image", this.imgRoute.UploadProfileImage);

    this.app.post("/sign-in", async (req, res) => {
      const { name, email, password } = req.body;

      const success = await this.db.addUser(name, email, password);
      if (success) {
        const user = { ...success };
        delete user.password;
        res.json(user);
      } else {
        res.json({ success: false, msg: "Something went wrong." });
      }
    });

    this.app.post("/voting/new", async (req, res) => {
      // if formdata than change it
      const { title, startTime, endTime, emails, options } = req.body;

      const vid = await this.db.addVoting(
        title,
        startTime,
        endTime,
        emails,
        options
      );

      res.json({ success: true });

      await this.addVoteIdsToAll(emails, vid).then(async (q) => {
        await this.sendMailsToAll(emails, title, startTime, endTime).then(
          async (v) => {
            await this.db.addParticipants(vid, v);
            const votingObj = {
              id: vid,
              participants: v,
            };
            await this.setVotingObjAtBC(votingObj);
          }
        );
      });
    });

    this.app.post("/did-vote", async (req, res) => {
      const { id, voteId } = req.body;
      await this.db.didVoted(id, voteId);
      res.json({ success: true });
    });
  }
}
module.exports = Api;
