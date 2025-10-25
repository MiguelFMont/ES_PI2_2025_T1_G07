import { connect } from "http2";
import { Connection } from "mysql2/typings/mysql/lib/Connection";
import OracleDB, { oracleClientVersion } from "oracledb";

// caminho da wallet de conexao com o oracle.
const walletPath = "C:\\wallets-oracle-databases\\notadez-wallets\\Wallet_notaDez";

// inicializando o cliente oracle, usando a wallet.
OracleDB.initOracleClient({configDir: walletPath});

// formato de saída dos dados, vai ser objetos JavaScript estruturados.
OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

const dbConfig = {
    user: "WEBAPP",
    password: "superSecretMyPassword123",
    connectString: "notadez_high"
};

// função para abrir conexões com o oracle
export async function open(){
    try{
        const connection = OracleDB.getConnection(dbConfig);
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
