async function test() {
  try {
    const response = await fetch('https://sih-hackathon-4pw7.onrender.com/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'What are the rules?' })
    });
    const data = await response.json();
    console.log("Unfiltered response:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
