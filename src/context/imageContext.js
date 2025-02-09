import React, { createContext, useState, useEffect } from "react";
import correctTree from "../assets/correctTree.jpg";
import correctTriangle from "../assets/correctTriangle.jpg";
import correctWarrior from "../assets/correctWarrior.jpg";
import correctSanskrit from "../assets/correctsanskrit.jpg";
import correctHalfMoon from "../assets/correcthalfmoon.jpg";

export const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  const [correctPoseImages, setCorrectPoseImages] = useState([]);

  useEffect(() => {
    // Convert local images to Base64 once when this provider mounts
    async function convertImages() {
      const convertImportedImagesToBase64 = async (imageUrls) => {
        const promises = imageUrls.map(async (url) => {
          const response = await fetch(url);
          const blob = await response.blob();

          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = () => resolve(reader.result.split(",")[1]); // Remove data:image/png;base64,
          });
        });

        return Promise.all(promises);
      };

      const imageUrls = [
        correctTree,
        correctWarrior,
        correctTriangle,
        correctHalfMoon,
        correctSanskrit,
      ];

      const base64Images = await convertImportedImagesToBase64(imageUrls);
      console.log("Correct Pose Base64 Images:", base64Images);
      setCorrectPoseImages(base64Images);
    }

    convertImages();
  }, []); 

  return (
    <ImageContext.Provider value={{ correctPoseImages }}>
      {children}
    </ImageContext.Provider>
  );
};
