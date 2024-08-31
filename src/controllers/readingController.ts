import { Request, Response } from "express";
import {
  addMeasure,
  addValueToMeasure,
  checkMeasureValue,
  confirmMeasure,
  customerCheck,
  getCustomerMeasureList,
  measureCheckData,
  measureConfirmCheckData,
  updateStatus,
} from "../application/usecases/measureUseCase";
import { geminiRequest } from "../application/usecases/geminiUseCase";

export const uploadMeasuremnt = async (req: Request, res: Response) => {
  const data: MeasureUploadRequest = req.body;
  const erros = measureCheckData(data);
  if (erros.length > 0) {
    const erroResponse = erros.reduce((msg, value) => msg + ` ${value}`, "");
    res.status(400).send({
      error_code: "INVALID_DATA",
      error_description: `${erroResponse.trim()}`,
    });
  }
  const geminiResponse = await geminiRequest(data["image"]);
  const response = await addMeasure({
    image: String(geminiResponse[1]),
    customer_code: data["customer_code"],
    measure_datetime: data["measure_datetime"],
    measure_type: data["measure_type"],
  });

  if (response && response[1] == 409) {
    res.status(409).send({
      error_code: "DOUBLE_REPORT",
      error_description: response[0],
    });
  }
  if (response && response[1] == 200) {
    await addValueToMeasure(response[0], Number(geminiResponse[0]));
    res.status(200).send({
      image_url: geminiResponse ? geminiResponse[1] : null,
      mesuare_value: geminiResponse ? geminiResponse[0] : 0,
      measure_uuid: response[0],
    });
  }
};

export const confirmMeasurement = async (req: Request, res: Response) => {
  const data: MeasureConfirmRequest = req.body;
  const erros = measureConfirmCheckData(data);
  if (erros.length > 0) {
    const erroResponse = erros.reduce((msg, value) => msg + ` ${value}`, "");
    res.status(400).send({
      error_code: "INVALID_DATA",
      error_description: `${erroResponse.trim()}`,
    });
  }

  const checkStatusCode = await confirmMeasure(data).then((data) => data);
  if (checkStatusCode == "404") {
    res.status(404).send({
      error_code: "MEASURE_NOT_FOUND",
      error_description: "Leitura do mês já realizada",
    });
  }
  if (checkStatusCode == "409") {
    res.status(409).send({
      error_code: "CONFIRMATION_DUPLICATE",
      error_description: "Leitura do mês já realizada",
    });
  }
  if (checkStatusCode == "200") {
    const response = await checkMeasureValue(data);
    updateStatus(data["measure_uuid"], true);
    const success = Number(response) == data["confirmed_value"];
    res.status(200).send({
      success: success,
    });
  }
};

export const getCustomerMeasuries = async (req: Request, res: Response) => {
  const customerCode = req.params["customer_code"];
  const measureType = req.query["measure_type"];
  if (measureType && measureType != "WATER" && measureType != "GAS") {
    res.status(400).send({
      error_code: "INVALID_TYPE",
      error_description: "Tipo de medição não permitida",
    });
  }
  const customer = await customerCheck(customerCode);
  if (!customer) {
    res.status(404).send({
      error_code: "MEASURES_NOT_FOUND",
      error_description: "Nenhuma leitura encontrada",
    });
  }
  const measureList = measureType
    ? await getCustomerMeasureList(customerCode, String(measureType))
    : await getCustomerMeasureList(customerCode);
  if (measureList && "error" in measureList) {
    res.status(404).send({
      error_code: "MEASURES_NOT_FOUND",
      error_description: "Nenhuma leitura encontrada",
    });
  } else {
    res.status(200).send(measureList);
  }
};
