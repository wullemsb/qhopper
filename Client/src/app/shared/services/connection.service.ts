import { Injectable, WritableSignal, signal } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { ConnectionModel } from '../models/connection.model';
import { NamedConnection } from '../models/connection.model';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  private readonly CONNECTIONS_DATA = 'connections';
  private readonly ENCRYPTION_KEY = 'your_secret_key';

  public connections: NamedConnection[] = [];
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
  getAllConnections(): NamedConnection[] {
    const encryptedData = localStorage.getItem(this.CONNECTIONS_DATA);
    if (encryptedData) {
      const decryptedData = CryptoJS.AES.decrypt(encryptedData, this.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
      try {
        const connections: NamedConnection[] = JSON.parse(decryptedData) || [];
        return Array.isArray(connections) ? connections : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  // Get a connection by its name
  getConnectionByName(name: string): ConnectionModel | null {
    const connections = this.getAllConnections();
    const found = connections.find(conn => conn.name === name);
    return found ? found.connection : null;
  }

  // Get all connection names
  getConnectionNames(): string[] {
    const connections = this.getAllConnections();
    return connections.map(conn => conn.name);
  }

  // Add a new connection
  addConnection(name: string, connection: ConnectionModel): NamedConnection[] {
    let connections = this.getAllConnections();
    // Remove any existing connection with same name
    connections = connections.filter(conn => conn.name !== name);
    // Add new connection
    connections.push({ name, connection });
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(connections), this.ENCRYPTION_KEY).toString();
    localStorage.setItem(this.CONNECTIONS_DATA, encryptedData);
    this.setConnection(connection);
    this.connections = connections;
    return this.connections;
  }

  // Delete the connection with the given name
  deleteConnectionByName(name: string): NamedConnection[] {
    let connections = this.getAllConnections();
    connections = connections.filter(conn => conn.name !== name);
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(connections), this.ENCRYPTION_KEY).toString();
    localStorage.setItem(this.CONNECTIONS_DATA, encryptedData);
    this.connections = connections;
    return this.connections;
  }

  // Delete the connection with the given host and username (legacy support)
  deleteConnection(connection: ConnectionModel): NamedConnection[] {
    let connections = this.getAllConnections();
    connections = connections.filter(
      (conn) =>
        conn.connection.host !== connection.host ||
        conn.connection.username !== connection.username
    );
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(connections), this.ENCRYPTION_KEY).toString();
    localStorage.setItem(this.CONNECTIONS_DATA, encryptedData);
    this.connections = connections;
    return this.connections;
  }
}
