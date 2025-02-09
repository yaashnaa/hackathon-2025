import convertImportedImagesToBase64 from '../components/convert';
export const sendToGemini = async (userImage) => {
    const API_KEY = process.env.REACT_APP_API_KEY;
    const correctPoseBase64 = "YOUR_CORRECT_POSE_IMAGE_BASE64"; // 🔥 Replace with correct pose image Base64
  
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            { text: "Compare these two images. The first image is the correct yoga pose, and the second image is the user’s pose. Give feedback on alignment, balance, and posture corrections." },
            { inline_data: { mime_type: "image/png", data: correctPoseBase64 } },
            { inline_data: { mime_type: "image/png", data: userImage } },
          ],
        },
      ],
    };
  
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );
  
    const data = await response.json();
    console.log("Gemini Feedback:", data);
    return data;
  };
  