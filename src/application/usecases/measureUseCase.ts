import {
  checkExistCustomer,
  checkPatchMeasure,
  checkValueToConfirm,
  defineValue,
  listMeasure,
  setMeasure,
  updateStatusConfirmed,
} from "../../model/measureModel";

const measureErrors = {
  image: (check: boolean) => (check ? "" : "Erro na imagem inserida"),
  datetime: (check: boolean) => (check ? "" : "Erro na data inserida"),
  type: (check: boolean) => (check ? "" : "“Tipo de medição não permitida"),
  customer_code: (check: boolean) =>
    check ? "" : "Erro np código do client inserida",
  uuid: (check: boolean) => (check ? "" : "Erro no formato uuid"),
  confirmed_value: (check: boolean) =>
    check ? "" : "Erro no valor a ser confirmado",
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

export function isValidMeasureType(type: string): boolean {
  return type == "WATER" || type == "GAS";
}

function isValidCustomerCode(customer_code: string): boolean {
  return typeof customer_code == "string" && customer_code.length > 0;
}

function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

function isValidInteger(value: number): boolean {
  const integerRegex = /^-?\d+$/;
  return integerRegex.test(String(value));
}

const measureCheckData = (data: MeasureUploadRequest): string[] => {
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

const measureConfirmCheckData = (data: MeasureConfirmRequest): string[] => {
  const err: string[] = [];
  err.push(measureErrors["uuid"](isValidUUID(data["measure_uuid"])));
  err.push(
    measureErrors["confirmed_value"](isValidInteger(data["confirmed_value"]))
  );

  const errorMessages = err.filter((msg) => msg != "");

  return errorMessages;
};

const customerCheck = async (
  costumer_code: MeasureUploadRequest["customer_code"]
) => {
  const isValibleCustomer = await checkExistCustomer(costumer_code);
  return isValibleCustomer;
};

const addMeasure = async (data: MeasureUploadRequest) => {
  const res = await setMeasure(data).then((data) => data);
  if (res.includes("Leitura")) {
    return [res, 409];
  }
  return [res, 200];
};

const addValueToMeasure = async (measureID: string, measureValue: number) => {
  await defineValue(measureID, measureValue);
};

const confirmMeasure = async (data: MeasureConfirmRequest) => {
  const res = await checkPatchMeasure(data);
  return res;
};

const checkMeasureValue = async (data: MeasureConfirmRequest) => {
  const res = await checkValueToConfirm(data);
  return res;
};

const updateStatus = async (id: string, value: boolean) => [
  await updateStatusConfirmed(id, value),
];

const getCustomerMeasureList = async (
  customer_code: string,
  measure_type?: string
) => {
  if (measure_type) {
    const response = await listMeasure(customer_code, measure_type).then(
      (data) => data
    );
    return response;
  }
  const response = await listMeasure(customer_code).then((data) => data);
  return response;
};

export {
  measureCheckData,
  measureConfirmCheckData,
  addMeasure,
  confirmMeasure,
  addValueToMeasure,
  checkMeasureValue,
  updateStatus,
  customerCheck,
  getCustomerMeasureList,
};
