import { geminiTest } from "./geminiUseCase";

const currentData: MeasureRequest[] = [];

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
  return (
    isValidBase64(data["image"]) &&
    isValidDateTime(data["measure_datetime"]) &&
    isValidCustomerCode(data["customer_code"]) &&
    isValidMeasureType(data["measure_type"].toUpperCase())
  );
};

const checkDoubleDate = (date: string) => {
  let response: boolean = false;
  currentData?.map((mesuareData) => {
    const currDate = new Date(date);
    const measureDate = new Date(mesuareData.measure_datetime);
    const a = `${currDate.getMonth()}-${currDate.getFullYear()}`;
    const b = `${measureDate.getMonth()}-${measureDate.getFullYear()}`;

    if (a == b) {
      response = true;
      return response;
    } else {
      response = false;
    }
  });
  console.log(response);
  return response;
};

const geminiAnalysis = (imageBase64: string) => {
  geminiTest(imageBase64);
};

const measurementResponse = (data: MeasureRequest) => {
  if (measureCheckData(data)) {
    if (checkDoubleDate(data.measure_datetime)) {
      return [
        {
          error_code: "DOUBLE_REPORT",
          error_description: "Leitura do mês já realizada",
        },
        409,
      ];
    }
  }

  const geminiResponse = geminiAnalysis(data.image);

  if (!measureCheckData(data)) {
    return [
      {
        error_code: "INVALID_DATA",
        error_description:
          "Os dados fornecidos no corpo da requisição são inválidos",
      },
      400,
    ];
  }

  currentData.push(data);
  return ["success", 200];
};

export { measurementResponse };
