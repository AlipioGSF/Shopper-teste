import client from "../db";

const setMeasure = async (data: MeasureRequest) => {
  try {
    // Verifica se o registro já existe
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

    // Insere o novo registro
    const insertQuery = `
      INSERT INTO measureData (image, measure_datetime, measure_type, customer_code)
      VALUES (decode($1, 'base64'), $2, $3, $4)
      RETURNING id;
    `;

    const insertValues = [
      data["image"],
      data["measure_datetime"],
      data["measure_type"],
      data["customer_code"],
    ];

    const insertResult = await client.query(insertQuery, insertValues);
    console.log(insertResult.rows[0]["id"]);
    return insertResult.rows[0]["id"];
  } catch (err) {
    console.error("Erro ao inserir dados", err);
  }
};

const getDate = async (month: number, year: number) => {
  try {
    const query = `
    SELECT 
      EXTRACT(MONTH FROM measure_datetime) AS mes, 
      EXTRACT(YEAR FROM measure_datetime) AS ano
    FROM 
      meseare_data
    WHERE 
      EXTRACT(MONTH FROM measure_datetime) = ${month}  AND
      EXTRACT(YEAR FROM measure_datetime) = ${year}
    GROUP BY 
      EXTRACT(MONTH FROM measure_datetime), 
      EXTRACT(YEAR FROM measure_datetime),
    RETURNING id;
      `;

    const response = await client.query(query);
    console.log("rows");
    console.log(response.rows);
    return response;
  } catch (e) {
    console.log("ERRO NO GET");
  } finally {
    console.log("fim");
    await client.end();
  }
};

export { getDate, setMeasure };
