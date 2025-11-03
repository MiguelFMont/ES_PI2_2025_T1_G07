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
export async function verificarCadastroDocente(email: string): Promise<{ nome: string, email: string } | null> {
    const conn = await open();
    try{
        const result = await conn.execute(
            `SELECT NOME, EMAIL FROM DOCENTE  
            WHERE EMAIL = :email
            FETCH FIRST 1 ROWS ONLY`,
            //     ^^^^  ^^^^^ BUSCA ESSES DADOS NO BANCO
            { email },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );
        
        if (result.rows && result.rows.length > 0) {
            const docente = result.rows[0] as { NOME: string, EMAIL: string };
            return {
                nome: docente.NOME,
                email: docente.EMAIL
            };
        }
        
        return null;
    } finally {
        if (conn) {
            await close(conn);
        }
    }
}

export async function verificarLoginDocente(email: string, senha: string): Promise<{ nome: string, email: string } | null> {
    const conn = await open();
    try{
        const result = await conn.execute(
            `SELECT NOME, EMAIL FROM DOCENTE  
            WHERE EMAIL = :email AND SENHA = :senha
            FETCH FIRST 1 ROWS ONLY`,
            //     ^^^^  ^^^^^ BUSCA ESSES DADOS NO BANCO
            { email, senha },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );
        
        if (result.rows && result.rows.length > 0) {
            const docente = result.rows[0] as { NOME: string, EMAIL: string };
            return {
                nome: docente.NOME,
                email: docente.EMAIL
            };
        }
        
        return null;
    } finally {
        if (conn) {
            await close(conn);
        }
    }
}