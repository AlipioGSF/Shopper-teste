import { Request, Response } from "express";
import {
  addMeasuare,
  measureCheckData,
} from "../application/usecases/measureUseCase";
import { geminiRequest } from "../application/usecases/geminiUseCase";

export const uploadMeasuaremnt = async (req: Request, res: Response) => {
  const data: MeasureRequest = req.body;
  const erros = measureCheckData(data);
  if (erros.length > 0) {
    const erroResponse = erros.reduce((msg, value) => msg + ` ${value}`, "");
    res.status(400).send({
      error_code: "INVALID_DATA",
      error_description: `${erroResponse.trim()}`,
    });
  }
  const response = await addMeasuare(data);

  if (response && response[1] == 409) {
    res.status(409).send({
      error_code: "DOUBLE_REPORT",
      error_description: response[0],
    });
  }
  if (response && response[1] == 200) {
    const geminiResponse = await geminiRequest(data["image"]);
    res.status(200).send({
      image_url: "link",
      mesuare_value: geminiResponse || 0,
      measure_uuid: response[0],
    });
  }
};
