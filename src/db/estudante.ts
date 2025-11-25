// AUTOR: Davi José Bertuolo Vitoreti - RA: 25004168

import { open, close } from "../config/db";
import OracleDB from "oracledb";

export interface Estudante {
    ra: number;
    nome: string;
}

// Adicionar um estudante
export async function addEstudante(
    ra: number,
    nome: string
): Promise<number> {
    const conn = await open();
    try {
        await conn.execute(
            `INSERT INTO webapp.ESTUDANTE (RA, NOME)
             VALUES (:ra, :nome)`,
            { ra, nome },
            { autoCommit: true }
        );

        return ra;
    } finally {
        await close(conn);
    }
}

// Deletar um estudante
export async function deleteEstudante(ra: number) {
    const conn = await open();
    try {
        await conn.execute(
            `DELETE FROM webapp.ESTUDANTE WHERE RA = :ra`,
            { ra },
            { autoCommit: true }
        );
    } finally {
        await close(conn);
    }
}

// Atualizar um estudante
export async function updateEstudante(
    ra: number,
    nome: string
) {
    const conn = await open();
    try {
        await conn.execute(
            `UPDATE webapp.ESTUDANTE 
             SET NOME = :nome
             WHERE RA = :ra`,
            { nome, ra },
            { autoCommit: true }
        );
    } finally {
        await close(conn);
    }
}

// Verificar se estudante já existe
export async function verificarEstudanteExistente(
    ra: number
): Promise<Estudante | null> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `SELECT RA as "ra",
                    NOME as "nome"
             FROM webapp.ESTUDANTE  
             WHERE RA = :ra
             FETCH FIRST 1 ROWS ONLY`,
            { ra },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );

        return (result.rows?.[0] as Estudante) || null;
    } finally {
        await close(conn);
    }
}

// Obter estudante pelo RA
export async function getEstudanteByRA(ra: number): Promise<Estudante | null> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `SELECT RA as "ra",
                    NOME as "nome"
             FROM webapp.ESTUDANTE
             WHERE RA = :ra`,
            { ra },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );

        return (result.rows?.[0] as Estudante) || null;
    } finally {
        await close(conn);
    }
}

// Obter todos os estudantes
export async function getAllEstudantes(): Promise<Estudante[]> {
    const conn = await open();
    try {
        const result = await conn.execute(
            `SELECT RA as "ra",
                    NOME as "nome"
             FROM webapp.ESTUDANTE`
        );

        return result.rows as Estudante[];
    } finally {
        await close(conn);
    }
}