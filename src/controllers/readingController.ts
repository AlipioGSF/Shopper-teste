import { Request, Response } from "express";
import { measurementResponse } from "../application/usecases/measureUseCase";

export const measurement = (req: Request, res: Response) => {
  const data: MeasureRequest = req.body;
  const response = measurementResponse(data);

  if (response && response[1] == 400) {
    res.status(400).send(response[0]);
  }
  if (response && response[1] == 409) {
    res.status(409).send(response[0]);
  }
  if (response && response[1] == 200) {
    res.status(200).send(response[0]);
  }
};
