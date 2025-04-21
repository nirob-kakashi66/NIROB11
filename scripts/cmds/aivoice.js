const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "aivoice",
    version: "1.0",
    author: "You 🫵🏻",
    countDown: 5,
    role: 0,
    shortDescription: "Text-to-Speech",
    longDescription: "Converts text to speech using the specified model",
    category: "utility",
    guide: "{pn} <model> | <text>"
  },

  onStart: async function ({ api, event, args }) {
    try {
      // Parse input
      const input = args.join(" ").split("|").map(item => item.trim());
      if (input.length < 2) {
        return api.sendMessage("⚠️ Usage: /tts <model> | <text>", event.threadID, event.messageID);
      }

      const model = input[0];
      const text = input[1];

      // Create cache directory if it doesn't exist
      const cacheDir = path.join(__dirname, 'cache');
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      // Generate unique filename
      const filePath = path.join(cacheDir, `tts_${event.senderID}.mp3`);

      // Make API request
      const response = await axios.get(
        `https://fastrestapis.fasturl.cloud/tts/multi?text=${encodeURIComponent(text)}&model=${encodeURIComponent(model)}`, 
        { responseType: 'arraybuffer' }
      );

      // Save file
      fs.writeFileSync(filePath, response.data);

      // Send message with audio
      await api.sendMessage({
        body: `🔊 TTS generated with model: ${model}`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID);

      // Clean up
      fs.unlinkSync(filePath);

    } catch (error) {
      console.error("TTS Error:", error.message);
      api.sendMessage("❌ Failed to generate TTS. Please check the model name and try again.", event.threadID, event.messageID);
    }
  }
};
