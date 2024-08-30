import client from "../db";

const setMeasure = async (data: MeasureRequest) => {
  try {
    const query = `
    INSERT INTO measureData (image, measure_datetime, measure_value, customer_code)
    VALUES ($1, $2, $3, $4)`;

    const values = [
      data["image"], // Dados binários para a coluna image
      data["measure_datetime"], // Dados para a coluna measure_datetime
      data["measure_type"], // Dados para a coluna measure_value
      data["customer_code"], // Dados para a coluna customer_code
    ];

    await client.query(query, values);
    console.log("Dados inseridos com sucesso");
  } catch (err) {
    console.error("Erro ao inserir dados", err);
  } finally {
    // Feche a conexão com o banco de dados
    await client.end();
  }
};
