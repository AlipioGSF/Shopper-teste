import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

function base64ToImage(base64String: string, filePath: string) {
  console.log(`${process.env.GEMINI_KEY}`);
  const buffer = Buffer.from(base64String, "base64");

  fs.writeFile(filePath, buffer, (err) => {
    if (err) {
      console.error("Erro ao salvar a imagem:", err);
    } else {
      console.log("Imagem salva com sucesso em:", filePath);
    }
  });
}

const geminiRequest = async (imgBase64: string) => {
  const removeImage = () => {
    return new Promise<void>((resolve, reject) => {
      fs.unlink("image.jpg", (err) => {
        if (err) {
          console.error("Erro ao excluir imagem");
          reject(err);
        } else {
          console.log("Imagem excluída com sucesso");
          resolve();
        }
      });
    });
  };
  await removeImage();

  base64ToImage(imgBase64, "image.jpg");

  const fileManager = new GoogleAIFileManager(`${process.env.GEMINI_KEY}`);

  try {
    const uploadResponse = await fileManager.uploadFile("image.jpg", {
      mimeType: "image/jpeg",
      displayName: "Jetpack drawing",
    });

    console.log(
      `Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`
    );

    const getResponse = await fileManager.getFile(uploadResponse.file.name);

    console.log(
      `Retrieved file ${getResponse.displayName} as ${getResponse.uri}`
    );

    const genAI = new GoogleGenerativeAI(`${process.env.GEMINI_KEY}`);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      {
        text: "Qual o consumo apresentado na imagem? me retorne apenas o valor numérico inteiro",
      },
    ]);

    const value = Number(result.response.text());
    console.log(`Value extracted: ${value}`);
    return value;
  } catch (error) {
    console.error("Error occurred:", error);
  }
};

export { geminiRequest };
