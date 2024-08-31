import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";

async function base64ToImage(
  base64String: string,
  filePath: string
): Promise<void> {
  const buffer = Buffer.from(base64String, "base64");
  await fs.promises.writeFile(filePath, buffer);
  console.log("Imagem salva com sucesso em:", filePath);
}

async function removeImage(filePath: string): Promise<void> {
  try {
    await fs.promises.unlink(filePath);
    console.log("Imagem excluída com sucesso");
  } catch (err: any) {
    if (err.code !== "ENOENT") {
      console.error("Erro ao excluir imagem:", err);
      throw err;
    }
  }
}

async function uploadImage(filePath: string): Promise<string> {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));

  try {
    const response = await axios.post("https://file.io", form, {
      headers: {
        ...form.getHeaders(),
      },
    });
    return response.data.link;
  } catch (error: any) {
    throw new Error("Erro ao subir a imagem: " + error.message);
  }
}

const geminiRequest = async (imgBase64: string) => {
  const filePath = "image.jpg";
  await removeImage(filePath);
  await base64ToImage(imgBase64, filePath);
  const link = await uploadImage(filePath);

  const fileManager = new GoogleAIFileManager(`${process.env.GEMINI_KEY}`);

  try {
    const uploadResponse = await fileManager.uploadFile(filePath, {
      mimeType: "image/jpeg",
      displayName: "Jetpack drawing",
    });

    await fileManager.getFile(uploadResponse.file.name);

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
    return [value, link];
  } catch (error) {
    console.error("Error occurred:", error);
    throw error;
  }
};

export { geminiRequest };
