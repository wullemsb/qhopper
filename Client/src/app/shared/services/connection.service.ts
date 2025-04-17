import { Injectable, WritableSignal, signal } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { ConnectionModel } from '../models/connection.model';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  private readonly CONNECTIONS_DATA = 'connections';
  private readonly ENCRYPTION_KEY = 'your_secret_key';

  public connections: ConnectionModel[] = [];
  connectionSignal: WritableSignal<ConnectionModel> = signal({ host: "http://localhost:15672", username: "guest", password: "guest" });

  constructor() {
    this.connections = this.getAllConnections();
  }

  // Set connection
  setConnection(connection: ConnectionModel) {
    this.connectionSignal.set(connection);
  }

  // Check if there are any connections
  isConnected(): boolean {
    return this.getAllConnections().length > 0;
  }

  // Get all connections
  getAllConnections(): ConnectionModel[] {
    const encryptedData = localStorage.getItem(this.CONNECTIONS_DATA);
    if (encryptedData) {
      const decryptedData = CryptoJS.AES.decrypt(encryptedData, this.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
      try {
        const connections: ConnectionModel[] = JSON.parse(decryptedData) || [];
        return Array.isArray(connections) ? connections : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  // Get a connection by its host and username
  getConnection(connection: ConnectionModel): ConnectionModel | null {
    const connections = this.getAllConnections();
    return connections.find(
      (conn) => conn.host === connection.host && conn.username === connection.username
    ) || null;
  }

  // Get all connection names (host+username)
  getConnectionNames(): string[] {
    const connections = this.getAllConnections();
    return connections.map(conn => conn.host + conn.username);
  }

  // Add a new connection
  addConnection(_name: string, connection: ConnectionModel): ConnectionModel[] {
    let connections = this.getAllConnections();
    // Remove any existing connection with same host+username
    connections = connections.filter(
      (conn) => !(conn.host === connection.host && conn.username === connection.username)
    );
    // Add new connection
    connections.push(connection);
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(connections), this.ENCRYPTION_KEY).toString();
    localStorage.setItem(this.CONNECTIONS_DATA, encryptedData);
    this.setConnection(connection);
    this.connections = connections;
    return this.connections;
  }

  // Delete the connection with the given host and username
  deleteConnection(connection: ConnectionModel): ConnectionModel[] {
    let connections = this.getAllConnections();
    connections = connections.filter(
      (conn) =>
        conn.host !== connection.host ||
        conn.username !== connection.username
    );
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(connections), this.ENCRYPTION_KEY).toString();
    localStorage.setItem(this.CONNECTIONS_DATA, encryptedData);
    this.connections = connections;
    return this.connections;
  }
}
