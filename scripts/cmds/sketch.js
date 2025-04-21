const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "sketch",
    aliases: [''],
    author: "refat--",
    version: "3.0",
    cooldowns: 15,
    role: 0,
    shortDescription: "Transform images",
    longDescription: "Convert images to art styles",
    category: "image",
    guide: {
      en: "{p}art [style] (reply to image)\nStyles: ink, bgline, color, gouache, manga, pencil, anime, lineart, simple, doodle, intricate"
    }
  },

  onStart: async function ({ message, event, args }) {
    try {
      // Get image from reply or attachment
      const imageUrl = event.messageReply?.attachments[0]?.url || event.attachments[0]?.url;
      if (!imageUrl) return message.reply("❌ Please reply to or attach an image");

      // Style selection
      const styleMap = {
        ink: "Ink Sketch",
        bgline: "BG Line",
        color: "Color Rough",
        gouache: "Gouache",
        manga: "Manga Sketch",
        pencil: "Pencil Sketch",
        anime: "Anime Sketch",
        lineart: "Line Art",
        simple: "Simplex",
        doodle: "Doodle",
        intricate: "Intricate Line"
      };
      
      const styleInput = args[0]?.toLowerCase() || "pencil";
      const style = styleMap[styleInput] || "Pencil Sketch";

      message.reply(`🔄 Creating ${style} art...`);

      // FastAPI request
      const apiUrl = `https://fastrestapis.fasturl.cloud/imgedit/tosketch?imageUrl=${encodeURIComponent(imageUrl)}&style=${encodeURIComponent(style)}`;
      
      const response = await axios.get(apiUrl, {
        responseType: "arraybuffer",
        timeout: 30000,
        headers: {
          'User-Agent': 'GoatBot-V2-Artify'
        }
      });

      // Save and send result
      const tempPath = path.join(__dirname, "cache", `art_${Date.now()}.jpg`);
      fs.writeFileSync(tempPath, response.data);
      
      message.reply({
        body: `🎨 ${style} Art Complete!`,
        attachment: fs.createReadStream(tempPath)
      }, () => fs.unlinkSync(tempPath));

    } catch (error) {
      console.error("Art Command Error:", error);
      message.reply(`❌ Failed to process image. ${error.response?.status === 429 ? "Server busy, try later" : "Please check the image and try again"}`);
    }
  }
};
