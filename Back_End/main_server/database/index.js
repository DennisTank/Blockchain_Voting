const { v1: uuidV1 } = require("uuid");
const Users = require("cakebase")("./database/users.json");
const Votings = require("cakebase")("./database/votings.json");

const User = require("../models/user.js");
const Voting = require("../models/voting.js");
const Option = require("../models/option.js");

class DB {
  id() {
    return uuidV1();
  }

  async getUser(id, email) {
    let user;
    if (id) {
      user = await Users.get((u) => u.id === id);
    } else if (email) {
      user = await Users.get((u) => u.email === email);
    }
    if (user.length !== 0) {
      return user[0];
    }
  }

  async getVoting(voteId) {
    const voting = await Votings.get((v) => v.id === voteId);
    if (voting.length !== 0) {
      return voting[0];
    }
    console.log("Voting Id not exists");
  }

  async addUser(name, email, password) {
    const existing = await this.getUser(undefined, email);

    if (!existing) {
      const user = new User(this.id(), name, email, password);
      await Users.set(user);
      console.log("User added");
      return user;
    } else {
      console.log("User exist");
    }
  }

  async addVoteIdAtUser(email, voteId) {
    const user = await this.getUser(undefined, email);
    if (!user) {
      console.log("User not exists");
      return;
    }

    const vId = user.votings.find((v) => v.id === voteId);

    if (!vId) {
      user.votings.push({
        id: voteId,
        didVote: false,
      });
      await Users.update((i) => i.id === user.id, user);
      console.log("voteID added");
    } else {
      console.log("voteID exists");
    }
  }

  async didVoted(uid, voteId) {
    const user = await this.getUser(uid, undefined);
    if (!user) {
      console.log("User not exists");
      return;
    }
    user.votings.forEach((v) => {
      if (v.id === voteId) {
        v.didVote = true;
      }
    });
    await Users.update((i) => i.id === user.id, user);
    console.log("One Did Vote!");
  }

  async addVoting(title, startTime, endTime, emails, options) {
    const optList = this.createOptionList(options);
    const voting = new Voting(
      this.id(),
      title,
      startTime,
      endTime,
      emails,
      optList
    );
    await Votings.set(voting);
    return voting.id;
  }

  async addParticipants(voteId, addresses) {
    const voting = await this.getVoting(voteId);
    if (!voting) {
      console.log("Voting does not exists");
      return;
    }
    voting.participants = [...addresses];
    await Votings.update((i) => i.id === voting.id, voting);
  }

  async addResult(voteId, votes) {
    const voting = await this.getVoting(voteId);
    if (!voting) {
      console.log("Voting does not exists");
      return { success: false };
    }
    const result = [];
    for (const i of voting.options) {
      result.push({ id: i.id, count: 0 });
    }
    for (const v of votes) {
      result.forEach((e, i) => {
        if (e.id === v.optionid) {
          result[i].count = result[i].count + 1;
        }
      });
    }
    voting.result = [...result];
    await Votings.update((i) => i.id === voting.id, voting);
    return { success: true };
  }

  createOptionList(options) {
    const arr = [];
    options.forEach((o) => {
      const opt = new Option(this.id(), o.imgUrl, o.description);
      arr.push(opt);
    });
    return arr;
  }
}
module.exports = DB;
