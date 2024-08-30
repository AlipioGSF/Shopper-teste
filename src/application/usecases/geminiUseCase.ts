require("dotenv").config();
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import { Guid } from "guid-typescript";

function base64ToImage(base64String: string, filePath: string) {
  const buffer = Buffer.from(base64String, "base64");

  fs.writeFile(filePath, buffer, (err) => {
    if (err) {
      console.error("Erro ao salvar a imagem:", err);
    } else {
      console.log("Imagem salva com sucesso em:", filePath);
    }
  });
}

const geminiTest = async (imgBase64: string) => {
  let response = undefined;

  fs.unlink("image.jpg", (err) => {
    if (err) {
      console.error("Erro ao excluir imagem");
      return;
    }
    console.log("imagem excluída com sucesso");
  });

  base64ToImage(imgBase64, "image.jpg");

  // Initialize GoogleAIFileManager with your API_KEY.
  const fileManager = new GoogleAIFileManager(
    "AIzaSyAJ3JT3r_PSDsEPFUyYIQgWOljtxLduiMI"
  );

  setTimeout(async () => {
    // Upload the file and specify a display name.
    const uploadResponse = await fileManager.uploadFile("image.jpg", {
      mimeType: "image/jpeg",
      displayName: "Jetpack drawing",
    });

    // View the response.
    console.log(
      `Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`
    );

    // Get the previously uploaded file's metadata.
    const getResponse = await fileManager.getFile(uploadResponse.file.name);

    // View the response.
    console.log(
      `Retrieved file ${getResponse.displayName} as ${getResponse.uri}`
    );

    // Initialize GoogleGenerativeAI with your API_KEY.
    const genAI = new GoogleGenerativeAI(
      "AIzaSyAJ3JT3r_PSDsEPFUyYIQgWOljtxLduiMI"
    );

    const model = genAI.getGenerativeModel({
      // Choose a Gemini model.
      model: "gemini-1.5-flash",
    });

    // Upload file ...

    // Generate content using text and the URI reference for the uploaded file.
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      {
        text: "Qual o consumo apresentada na imagem? me retorne apenas o valor numérico inteiro",
      },
    ]);

    console.log(Number(result.response.text()));
    console.log(result.response.text());
  }, 50);
};

export { geminiTest };
