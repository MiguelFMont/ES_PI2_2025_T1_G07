import { open, close } from "../config/db";
import OracleDB from "oracledb";

export interface Nota {
    id_nota: number;
    fk_id_componente: number;
    fk_id_estudante: number;
    fk_id_turma: number;
    valor_nota: number;
}

// Adicionar uma nota
export async function addNota(
    id_nota: number,
    fk_id_componente: number,
    fk_id_estudante: number,
    fk_id_turma: number,
    valor_nota: number
): Promise<number> {
    const conn = await open();
    try {
        const result = await conn.execute<{ outBinds: { id_nota: number } }>(
            `INSERT INTO webapp.NOTA (FK_ID_COMPONENTE, FK_ID_ESTUDANTE, FK_ID_TURMA, VALOR)
             VALUES (:fk_id_componente, :fk_id_estudante, :fk_id_turma, :valor_nota)
             RETURNING ID_NOTA INTO :id_nota`,
            {
                fk_id_componente,
                fk_id_estudante,
                fk_id_turma,
                valor_nota,
                id_nota: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER }
            },
            { autoCommit: true }
        );

        const outBinds = result.outBinds as { id_nota: number[] } | undefined;

        if (!outBinds?.id_nota?.[0]) {
            throw new Error("Erro ao obter o ID retornado na inserção da Turma.");
        }

        return outBinds.id_nota[0];
    } finally {
        await close(conn);
    }
}

export async function verificarNotaExistente(
    id_nota: number,
    fk_id_componente: number,
    fk_id_estudante: number,
    fk_id_turma: number
): Promise<Nota | null> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `SELECT ID_NOTA as "id_nota",
                    FK_ID ESTUDANTE as "id_estudante"
             FROM webapp.NOTA  
             WHERE FK_ID_ESTUDANTE = :fk_id_estudante
               AND ID_NOTA = :id_nota
             FETCH FIRST 1 ROWS ONLY`,
            { id_nota, fk_id_estudante },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );

        return (result.rows?.[0] as Nota) || null;
    } finally {
        await close(conn);
    }
}

// Obter nota pelo ID
export async function getNotaById(id_nota: number): Promise<Nota | null> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `SELECT ID_NOTA as "id_nota",
                    FK_ID_COMPONENTE as "fk_id_componente",
                    FK_ID_ESTUDANTE as "fk_id_estudante",
                    FK_ID_TURMA as "fk_id_turma",
                    VALOR as "valor_nota"
             FROM webapp.NOTA
             WHERE ID_NOTA = :id_nota`,
            { id_nota },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );

        return (result.rows?.[0] as Nota) || null;
    } finally {
        await close(conn);
    }
}

// Obter todas as turmas
export async function getAllNotas(): Promise<Nota[]> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `SELECT ID_NOTA as "id_nota",
                    FK_ID_COMPONENTE as "fk_id_componente",
                    FK_ID_ESTUDANTE as "fk_id_estudante",
                    FK_ID_TURMA as "fk_id_turma",
                    VALOR as "valor_nota"
             FROM webapp.NOTA`,
            {},
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );

        return result.rows as Nota[];
    } finally {
        await close(conn);
    }
}