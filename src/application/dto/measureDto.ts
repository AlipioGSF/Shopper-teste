interface MeasureRequest {
  image: string;
  customer_code: string;
  measure_datetime: string;
  measure_type: "WATER" | "GAS";
}

interface MeasureResponse {
  image_url: string;
  measure_value: number;
  measure_uuid: string;
}
