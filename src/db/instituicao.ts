import {open, close} from "../config/db";
import OracleDB from "oracledb";

export interface Instituicao {
    id: number,
    nome: string
};

// Adicionar uma instituição
export async function addInstituicao(nome: string): Promise<number> {
    const conn = await open();
    try {
        const result = await conn.execute<{outBinds : {id: number}}>(
            `
            INSERT INTO Instituicao (Nome)
            VALUES (:nome)
            RETURNING ID_Instituicao INTO :id
            `,
            {nome, id: {dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER}},
            {autoCommit: true}
        );

        const outBinds = result.outBinds as {id?: number[]} | undefined;

        if (!outBinds || !outBinds.id || outBinds.id.length === 0) {
            throw new Error("Erro ao obter um ID retornado na inserção da Instituição.");
        }

        return outBinds.id[0];
    } finally {
        await close(conn);
    }
}

// Deletar uma instituição da tabela
export async function deleteInstituicao(id: number): Promise<boolean> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `DELETE FROM Instituicao WHERE ID_Instituicao = :id`,
            { id },
            { autoCommit: true }
        );
        
        return result.rowsAffected !== undefined && result.rowsAffected > 0;
    } finally {
        await close(conn);
    }
}

export async function updateInstituicao(id: number, novo_nome: string): Promise<boolean> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `
            UPDATE Instituicao
            SET Nome = :novo_nome
            WHERE ID_Instituicao = :id
            `,
            { novo_nome, id },
            { autoCommit: true }
        );
        
        return result.rowsAffected !== undefined && result.rowsAffected > 0;
    } finally {
        await close(conn);
    }
}

// Verifica se a instituição já não está cadastrada
export async function verificarCadastroInstituicao(nome: string): Promise<Instituicao | null> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `SELECT ID_Instituicao as "id", Nome as "nome" FROM Instituicao  
            WHERE UPPER(Nome) = UPPER(:nome)
            FETCH FIRST 1 ROWS ONLY`,
            { nome },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );
        
        if (result.rows && result.rows.length > 0) {
            return result.rows[0] as Instituicao;
        }
        
        return null;
    } finally {
        if (conn) {
            await close(conn);
        }
    }
}

// Obter a instituição pelo ID.
export async function getInstituicaoById(id: number): Promise<Instituicao | null> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `SELECT ID_Instituicao as "id", Nome as "nome" FROM Instituicao
            WHERE ID_Instituicao = :id`,
            { id },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );
        
        if (result.rows && result.rows.length > 0) {
            return result.rows[0] as Instituicao;
        }
        
        return null;
    } finally {
        await close(conn);
    }
}

// Obter todas as instituições da tabela INSTITUICAO do Oracle
export async function getAllInstituicao(): Promise<Instituicao[]> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `SELECT ID_Instituicao as "id", Nome as "nome" FROM Instituicao
            ORDER BY Nome`,
            {},
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );
        
        return result.rows ? result.rows as Instituicao[] : [];
    } finally {
        await close(conn);
    }
}