import { open, close } from "../config/db";
import OracleDB from "oracledb";

export interface Docentes {
    id_docente: number,
    nome: string,
    email: string,
    telefone: string,
    senha: string
}

export async function addDocente(
    nome: string,
    email: string,
    telefone_celular: string,
    senha: string
): Promise<number> {
    const conn = await open();
    try{
        const result = await conn.execute<{ outBinds: { id: number} }>(
            `
            INSERT INTO DOCENTE (NOME, EMAIL, TELEFONE_CELULAR, SENHA)
            VALUES (:nome, :email, :telefone_celular, :senha)
            RETURNING ID_DOCENTE INTO :id
            `,
            { nome, email, telefone_celular, senha, id: {dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER} },
            { autoCommit: true}
        );

        const outBinds = result.outBinds as { id?: number[] } | undefined;

        if (!outBinds || !outBinds.id || outBinds.id.length === 0) {
            throw new Error("Erro ao obter um ID retornado na inserção de Docente.");
        }

        return outBinds.id[0];

    } finally {
        await close(conn);
    }
}

export async function verificarDocente(email: string, senha: string): Promise<boolean> {
    const conn = await open();
    try{
        const result = await conn.execute(
            `SELECT 1 FROM DOCENTE
            WHERE email = :email AND senha = :senha
            FETCH FIRST 1 ROWS ONLY`,
            { email, senha },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );
        const existe: boolean = !!(result.rows && result.rows.length > 0);
        return existe;

    } catch (err) {
        console.error("Erro ao verificar login", err);
        throw err;

    } finally {
        if (conn) {
            await conn.close();
        }
    }
}