const fs = require("fs");
const readline = require("readline-sync");

class Config {
  static GetConfig() {
    let config;

    try {
      console.log("reading config.json");
      config = JSON.parse(fs.readFileSync("config.json"));
    } catch (error) {
      console.log(error, "\n");
      if (readline.keyIn("Press any key to exit...")) {
        process.exit();
      }
    }
    return config;
  }
}
module.exports = Config;
