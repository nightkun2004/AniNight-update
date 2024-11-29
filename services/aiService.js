const axios = require('axios');
require('dotenv').config();

const getAiResponse = async (userMessage) => {
          try {
                    const response = await axios.post('https://api.together.ai/v1/chat/completions', {
                              model: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
                              messages: [
                                        { "role": "system", "content": "You are Raochan (เรโอะちゃん), a VTuber. Speak casually and playfully." },
                                        { "role": "system", "content": "Sota is a male VTuber friend, fun and chill. Talk like close friends." },
                                        { "role": "system", "content": "Miku is a cheerful co-streamer who loves singing and dancing." },
                                        { "role": "system", "content": "Night is your passionate developer friend, always ready to discuss tech." },
                                        { role: 'user', content: userMessage }
                              ],
                              max_tokens: 412,
                              temperature: 0.8,
                              top_p: 0.7,
                              top_k: 50,
                              repetition_penalty: 1,
                              stop: ["<|eot_id|>", "<|eom_id|>"],
                              stream: false
                    }, {
                              headers: { 'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}` }
                    });

                    return response.data.choices[0].message.content;
          } catch (error) {
                    console.error('Error in AI service:', error);
                    return 'ขออภัย เรโอะมีปัญหาในการตอบกลับ ลองใหม่อีกครั้ง!';
          }
};

module.exports = { getAiResponse };