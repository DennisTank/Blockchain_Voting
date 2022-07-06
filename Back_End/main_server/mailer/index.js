const nodemail = require("nodemailer");
const fs = require("fs");

class Mailer {
  constructor(path) {
    this.ep = null;
    this.getEP(path);
  }
  getEP(path) {
    console.log("loaded data");
    let data;
    try {
      // ep.txt format-> email,password
      const raw = fs.readFileSync(path, "utf8");
      data = raw.split(",");
    } catch (err) {
      console.log(err);
    }
    this.ep = {
      email: data[0],
      pass: data[1],
    };
  }

  static async mail(ep, email, details) {
    let result;

    try {
      await nodemail
        .createTransport({
          service: "gmail",
          auth: {
            user: ep.email,
            pass: ep.pass,
          },
        })
        .sendMail({
          from: ep.mail,
          to: email,
          subject: "VOTING DETAILS",
          text: `Dear Voter,\nYour SECRET for the voting of "${details.title}" which starts at ${details.st} and ends at ${details.et} is:\n${details.secret}`,
        });

      result = true;
    } catch (error) {
      console.log(error);
      console.log("Invalid email Or something went wrong");

      result = false;
    }
    return result;
  }
}
module.exports = Mailer;
