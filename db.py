import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

def create_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME'),
            port=int(os.getenv('DB_PORT', 3306)),
            connection_timeout=10
        )
        return connection
    except Error as e:
        print(f"ERRO DE CONEXAO COM O BANCO: {e}")
        raise

def get_cursor(connection):
    if connection is None:
        raise RuntimeError("Conexão com o banco não foi estabelecida.")
    return connection.cursor(dictionary=True)