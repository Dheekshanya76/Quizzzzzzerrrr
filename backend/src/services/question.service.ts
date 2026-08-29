import { pool } from "../db/index.js";

export async function deleteQuestion(id: string): Promise<boolean> {
  const result = await pool.query(
    "DELETE FROM questions WHERE id = $1 RETURNING id",
    [id]
  );

  return result.rowCount === 1;
}
