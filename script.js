const chatbot = document.querySelector('.chatbot-icon-container');
        const chatbox = document.getElementById('chatbox');
        const chatInput = document.getElementById('chatInput');
        const chatBody = document.getElementById('chatbox-body');
        const sendBtn = document.getElementById('sendBtn');

        chatbot.addEventListener('click', () => {
            chatbox.classList.toggle('show-chatbox');
            chatbot.classList.toggle("flipped");
        });

        sendBtn.addEventListener('click', sendMessage);

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
let conversationNotes = JSON.parse(localStorage.getItem("conversationNotes")) || [];
let conversationHistory = JSON.parse(localStorage.getItem("conversationHistory")) || [];

async function AiChatBot(p) {
    // সর্বশেষ 10টি conversation সংগ্রহ করা
    if (conversationHistory.length >= 10) {
        conversationHistory.shift(); // পুরনো conversation মুছে ফেলা
    }
    conversationHistory.push(p);
    localStorage.setItem("conversationHistory", JSON.stringify(conversationHistory));

    const notesText = conversationNotes.length ? `Previous key points: ${conversationNotes.join(", ")}.` : "";
    const historyText = conversationHistory.length ? `Recent conversations: ${conversationHistory.join(" || ")}.` : "";

    const prompt = `You are a customer support chatbot named Pappu. Your job is to answer the user clearly and extract important key points from their messages.
Your key points should include: 
- User's name (if shared) 
- Contact details (email, phone number) 
- Location/address (if mentioned) 
- Interests or preferences 
- Important requirements or concerns 
- Any other personal details the user shares.
**IMPORTANT:**  
- Do NOT repeat key points that are already mentioned in the previous notes.  
- Only extract **new information** and add them to the notes.  
- If there is **no new information**, return "notes": [].
- When generating a note, it will first check if the note already exists, if it does, it will not generate the same note again. If the user provides any unique data that is not in the note, only then will it generate the note, otherwise it will keep the note empty.  
notes: ${notesText} 
${historyText} 
The user says: "${p}". 

Respond in JSON format with:  
{ 
  "reply": "Your response to the user",  
  "notes": ["Extracted key points from the message"]  
}`;

    try {
        const response = await fetch("https://backend.buildpicoapps.com/aero/run/llm-api?pk=v1-Z0FBQUFBQm5IZkJDMlNyYUVUTjIyZVN3UWFNX3BFTU85SWpCM2NUMUk3T2dxejhLSzBhNWNMMXNzZlp3c09BSTR6YW1Sc1BmdGNTVk1GY0liT1RoWDZZX1lNZlZ0Z1dqd3c9PQ==", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt })
        });

        const data = await response.json();
        const parsedData = JSON.parse(data.text);

        if (Array.isArray(parsedData.notes)) {
            parsedData.notes.forEach(note => {
                if (!conversationNotes.includes(note)) {
                    conversationNotes.push(note);
                }
            });
            localStorage.setItem("conversationNotes", JSON.stringify(conversationNotes));
        }

        return parsedData.reply;
    } catch (error) {
        console.error("Error:", error);
        return { reply: "দুঃখিত, কিছু সমস্যা হয়েছে!", notes: [] };
    }
}

        async function sendMessage() {
            const msg = chatInput.value.trim();
            if (!msg) return;
            appendMessage('user', msg);
            chatInput.value = '';

            // AI থেকে রেসপন্স নাও
            const botResponse = await AiChatBot(msg);
            appendMessage('bot', botResponse);
        }

        function appendMessage(sender, msg) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
            messageDiv.textContent = msg;
            chatBody.appendChild(messageDiv);
            chatBody.scrollTop = chatBody.scrollHeight;
        }
