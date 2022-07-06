class Voting {
  constructor(id, title, startTime, endTime, emails, options) {
    this.id = id;
    this.title = title;
    this.startTime = startTime;
    this.endTime = endTime;
    this.emails = emails;
    this.participants = [];
    this.options = options;
    this.result = [];
  }
}
module.exports = Voting;
