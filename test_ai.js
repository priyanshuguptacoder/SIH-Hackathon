const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('https://sih-hackathon-4pw7.onrender.com/ai/chat', {
      message: 'What are the rules?',
      industryId: null // We will try a dummy industry ID if needed, but wait, the fallback uses no filters.
    });
    console.log("Unfiltered response:", res.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
test();
