import client from "../db";

const setMeasure = async (data: MeasureUploadRequest) => {
  try {
    const checkQuery = `
      SELECT 1
      FROM measureData
      WHERE measure_type = $1
        AND EXTRACT(YEAR FROM measure_datetime) = EXTRACT(YEAR FROM $2::DATE)
        AND EXTRACT(MONTH FROM measure_datetime) = EXTRACT(MONTH FROM $2::DATE)
    `;

    const checkValues = [data["measure_type"], data["measure_datetime"]];

    const checkResult = await client.query(checkQuery, checkValues);

    if (checkResult.rowCount && checkResult.rowCount > 0) {
      return "Leitura do mês já realizada";
    }
    const insertQuery = `
      INSERT INTO measureData (image_url, measure_datetime, measure_type, customer_code)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;

    const insertValues = [
      data["image"],
      data["measure_datetime"],
      data["measure_type"],
      data["customer_code"],
    ];

    const insertResult = await client.query(insertQuery, insertValues);
    return insertResult.rows[0]["id"];
  } catch (err) {
    console.error("Erro ao inserir dados", err);
  }
};

const checkPatchMeasure = async (data: MeasureConfirmRequest) => {
  try {
    const checkQuery = `
      SELECT
        CASE
            WHEN NOT EXISTS (SELECT 1 FROM measuredata WHERE id = '${data["measure_uuid"]}') THEN '0'
            WHEN EXISTS (SELECT 1 FROM measuredata WHERE id = '${data["measure_uuid"]}' AND has_confirmed IS NULL) THEN '1'
            ELSE '2'
        END AS resultado
      FROM measuredata
      LIMIT 1;
    `;

    const queryResponse = await client.query(checkQuery);
    if (queryResponse.rows[0]["resultado"] == "0") return "404";
    if (queryResponse.rows[0]["resultado"] == "1") return "200";
    if (queryResponse.rows[0]["resultado"] == "2") return "409";
  } catch (err) {
    console.log(err);
  }
};

const checkValueToConfirm = async (data: MeasureConfirmRequest) => {
  try {
    const queryValue = `
        SELECT measure_value from measuredata WHERE id = '${data["measure_uuid"]}'
    `;
    const valueResponse = await client.query(queryValue);
    return valueResponse.rows[0]["measure_value"];
  } catch (err) {
    console.log(err);
  }
};

const defineValue = async (id: string, value: number) => {
  try {
    const query = `
      UPDATE measuredata SET measure_value = ${value} WHERE id = '${id}' 
    `;
    await client.query(query);
  } catch (err) {
    console.log(err);
  }
};

const updateStatusConfirmed = async (id: string, value: boolean) => {
  try {
    const query = `
      UPDATE measuredata SET has_confirmed = TRUE WHERE id = '${id}' 
    `;

    await client.query(query);
  } catch (err) {
    console.log(err);
  }
};

const checkExistCustomer = async (costumer_code: string) => {
  try {
    const query = `
      SELECT EXISTS (SELECT 1 FROM measuredata WHERE customer_code = '${costumer_code}') AS exists;
    `;

    const resQuery = await client.query(query);
    return resQuery.rows[0]["exists"];
  } catch (err) {
    console.log(err);
  }
};

const listMeasure = async (costumer_code: string, measure_type?: string) => {
  try {
    let query = "";
    if (measure_type) {
      query = `
      SELECT
        id,
        measure_datetime,
        measure_type,
        has_confirmed,
        image_url
      FROM
        measuredata
      WHERE
        customer_code = '${costumer_code}'
        and
        measure_type = '${measure_type}'
      ORDER BY
        measure_datetime DESC;
      `;
    } else {
      query = `
    SELECT
      id,
      measure_datetime,
      measure_type,
      has_confirmed,
      image_url
    FROM
      measuredata
    WHERE
      customer_code = '${costumer_code}'
    ORDER BY
      measure_datetime DESC;
    `;
    }
    const result = await client.query(query);
    if (result.rows.length === 0) {
      return {
        error: "Nenhuma medida encontrada para este código de cliente.",
      };
    }

    const measures = result.rows.map((row) => ({
      measure_uuid: row.id,
      measure_datetime: row.measure_datetime,
      measure_type: row.measure_type,
      has_confirmed: row.has_confirmed,
      image_url: row.image_url,
    }));

    const response = {
      customer_code: costumer_code,
      measures: measures,
    };

    return response;
  } catch (err) {
    console.log(err);
  }
};

export {
  setMeasure,
  checkPatchMeasure,
  checkValueToConfirm,
  defineValue,
  updateStatusConfirmed,
  checkExistCustomer,
  listMeasure,
};
