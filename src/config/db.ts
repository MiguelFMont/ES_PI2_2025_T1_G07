
import OracleDB, { oracleClientVersion } from "oracledb";
import dotenv from 'dotenv';
dotenv.config();
// caminho da wallet de conexao com o oracle.
const walletPath = `${process.env.WALLET_PATH}`

console.log(walletPath);

// inicializando o cliente oracle, usando a wallet.
OracleDB.initOracleClient({configDir: walletPath});

// formato de saída dos dados, vai ser objetos JavaScript estruturados.
OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

const dbConfig = {
    user: `${process.env.DB_USER}`,
    password: `${process.env.DB_PASSWORD}`,
    connectString: `${process.env.DB_CONNECTSTRING}`
};

// função para abrir conexões com o oracle
export async function open(){
    try{
        const connection = await OracleDB.getConnection(dbConfig);
        console.log("conexão OCI - aberta");
        return connection;
    }catch(err){
        console.error("Erro ao abrir conexão com o Oracle: ", err);
        throw err;
    }
}

// função para fechar conexão
export async function close(connection: OracleDB.Connection){
    try{
        await connection.close();
        console.log("Conexão OCI - fechada");
    }catch(err){
        console.error("Erro ao fechar conexão com o Oracle: ", err)
    }
}
