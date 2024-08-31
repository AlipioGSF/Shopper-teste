import { getDate, setMeasure } from "../../model/measureModel";
import { geminiRequest } from "./geminiUseCase";

const measureErrors = {
  image: (check: boolean) => (check ? "" : "Erro na imagem inserida"),
  datetime: (check: boolean) => (check ? "" : "Erro na data inserida"),
  type: (check: boolean) => (check ? "" : "Erro no tipo inserido"),
  customer_code: (check: boolean) =>
    check ? "" : "Erro np código do client inserida",
};

function isValidBase64(base64: string): boolean {
  const base64Regex =
    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

  return base64.length % 4 === 0 && base64Regex.test(base64);
}

function isValidDateTime(dateTimeString: string): boolean {
  const date = new Date(dateTimeString);
  return !isNaN(date.getTime());
}

function isValidMeasureType(type: string) {
  return type == "WATER" || type == "GAS";
}

function isValidCustomerCode(customer_code: string) {
  return typeof customer_code == "string" && customer_code.length > 0;
}

const measureCheckData = (data: MeasureRequest) => {
  const err: string[] = [];
  err.push(measureErrors["image"](isValidBase64(data["image"])));
  err.push(
    measureErrors["datetime"](isValidDateTime(data["measure_datetime"]))
  );
  err.push(
    measureErrors["customer_code"](isValidCustomerCode(data["customer_code"]))
  );
  err.push(measureErrors["type"](isValidMeasureType(data["measure_type"])));

  const errorMessages = err.filter((msg) => msg != "");

  return errorMessages;
};

const addMeasuare = async (data: MeasureRequest) => {
  const res = await setMeasure(data).then((data) => data);
  if (res.includes("Leitura")) {
    return [res, 409];
  }
  return [res, 200];
};

export { measureCheckData, addMeasuare };
