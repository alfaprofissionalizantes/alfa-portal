import mysql.connector
from mysql.connector import Error
import os
from flask import g, has_app_context
from dotenv import load_dotenv

load_dotenv()

def create_connection():
    # Reaproveita a conexão da requisição atual, se já existir
    if has_app_context():
        if 'db_conn' in g and g.db_conn.is_connected():
            return g.db_conn

    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME'),
            port=int(os.getenv('DB_PORT', 3306)),
            connection_timeout=10
        )
    except Error as e:
        print(f"ERRO DE CONEXAO COM O BANCO: {e}")
        raise

    if has_app_context():
        g.db_conn = connection

    return connection


def get_cursor(connection):
    if connection is None:
        raise RuntimeError("Conexão com o banco não foi estabelecida.")
    return connection.cursor(dictionary=True)


def fechar_conexao(exception=None):
    conn = g.pop('db_conn', None)
    if conn is not None:
        try:
            conn.close()
        except Exception:
            pass