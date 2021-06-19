import Discord from "discord.js";
import dotenv from "dotenv";
import getQuote from "./quote.js";
import db from "quick.db";

dotenv.config();
const client = new Discord.Client();

db.set("quotesdb.responding", "true");

const sadWords = ["sad", "unhappy", "depressed", "angry"];
const starterEncouragements = [
  "Cheer up!",
  "Hang in there.",
  "You are a great person",
];

try {
  const encouragements = db.get("quotesdb.quotes");
  if (encouragements == null || encouragements.length < 1) {
    starterEncouragements.map((starter) => db.push("quotesdb.quotes", starter));
    const responding = db.get("quotesdb.responding");
    if (responding == null) {
      db.set("quotesdb.responding", "true");
    }
  }
} catch (err) {
  console.log(err);
}

function updateEncouragements(encouragingMessage) {
  try {
    return db.push("quotesdb.quotes", encouragingMessage);
  } catch (error) {
    console.log(error);
  }
}

function deletEncouragement(index) {
  const encouragements = db.get("quotesdb.quotes");
  if (encouragements.length > index) {
    encouragements.splice(index, 1);
    db.set("quotesdb.quotes", encouragements);
  }
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", (msg) => {
  
  if (msg.author.bot) return;

  if (msg.content === "$inspire") {
    getQuote().then((quote) => msg.channel.send(quote));
  }

  const responding = db.get("quotesdb.responding");

  if (responding === "true") {
    if (sadWords.some((word) => msg.content.includes(word))) {
      const encouragements = db.get("quotesdb.quotes");
      const encouragement =
        encouragements[Math.floor(Math.random() * encouragements.length)];
      msg.reply(encouragement);
    }

    if (msg.content.startsWith("$new")) {
      let encouragingMessage = msg.content.split("$new ")[1];
      if (updateEncouragements(encouragingMessage))
        msg.channel.send("New encouraging message added");
      else msg.channel.send("Failed to add New encouraging message");
    }

    if (msg.content.startsWith("$del")) {
      let index = parseInt(msg.content.split("$del ")[1]);
      deletEncouragement(index);
      msg.channel.send("Encouraging message deleted");
    }

    if (msg.content.startsWith("$list")) {
      const encouragementsAll = JSON.stringify(db.get("quotesdb.quotes"));
      msg.channel.send(encouragementsAll);
    }
  }

  if (msg.content.startsWith("$res")){
    let value = msg.content.split("$res ")[1];
    if(value.toLocaleLowerCase() ==='true'){
        db.set("quotesdb.responding", "true");
        msg.reply("Bot is responding");
    }
    else{
        db.set("quotesdb.responding", "false");
        msg.reply("Responding is off");
    }
  }

});

client.login(process.env.TOKEN);
