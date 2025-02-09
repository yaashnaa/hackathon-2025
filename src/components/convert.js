import correctPoseImage from "../assets/correct_pose.png";

const convertImportedImageToBase64 = async () => {
  const response = await fetch(correctPoseImage);
  const blob = await response.blob();

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result.split(",")[1]); // Remove Base64 header
  });
};

// 🔥 Example Usage
convertImportedImageToBase64().then((base64) => {
  console.log("Base64 Image:", base64);
});
