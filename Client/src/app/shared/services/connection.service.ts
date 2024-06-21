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
    return !!localStorage.getItem(this.CONNECTIONS_DATA);
  }

  // Get all connections
  getAllConnections(): ConnectionModel[] {
    const connectionNames = this.getConnectionNames();
    const allConnections: ConnectionModel[] = [];

    for (const name of connectionNames) {
      const encryptedData = localStorage.getItem(this.CONNECTIONS_DATA);

      if (encryptedData) {
        const decryptedData = CryptoJS.AES.decrypt(encryptedData, this.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
        const connections: { [key: string]: any } = JSON.parse(decryptedData) || {};

        const connection = connections[name];

        if (connection) {
          allConnections.push(connection);
        }
      }
    }
    return allConnections;
  }

  // Get a connection by its name
  getConnection(connection: ConnectionModel): ConnectionModel | null {
    const encryptedData = localStorage.getItem(this.CONNECTIONS_DATA);
    const keyValue = connection.host + connection.username;

    if (encryptedData) {
      const decryptedData = CryptoJS.AES.decrypt(encryptedData, this.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
      const connections: { [key: string]: any } = JSON.parse(decryptedData);

      if (connections && connections[keyValue]) {
        return connections[keyValue];
      } else {
        console.log(`No connection found with key value: '${keyValue}'.`);
      }
    }

    return null;
  }

  // Get all connection names
  getConnectionNames(): string[] {
    const encryptedData = localStorage.getItem(this.CONNECTIONS_DATA);

    if (encryptedData) {
      const decryptedData = CryptoJS.AES.decrypt(encryptedData, this.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
      const connections = JSON.parse(decryptedData);

      if (connections) {
        return Object.keys(connections);
      }
    }

    return [];
  }

  // Add a new connection
  addConnection(name: string, connection: ConnectionModel): ConnectionModel[] {
    let connections: { [key: string]: ConnectionModel } = {};
    const storedData = localStorage.getItem(this.CONNECTIONS_DATA);

    if (storedData) {
      const decryptedData = CryptoJS.AES.decrypt(storedData, this.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
      connections = JSON.parse(decryptedData) || {};
    }

    // Update or add the new connection
    connections[name] = connection;

    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(connections), this.ENCRYPTION_KEY).toString();
    localStorage.setItem(this.CONNECTIONS_DATA, encryptedData);

    // Set selection connection
    this.setConnection(connection);

    // Update connections array
    // Return the updated connections list
    this.connections = this.getAllConnections();
    return this.connections;
  }

  // Delete the connection with the given name
  deleteConnection(connection: ConnectionModel): ConnectionModel[] {
    let connections = this.getAllConnections();
    connections = connections.filter(
      (conn) =>
        conn.host !== connection.host ||
        conn.username !== connection.username ||
        conn.password !== connection.password
    );

    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(connections), this.ENCRYPTION_KEY).toString();
    localStorage.setItem(this.CONNECTIONS_DATA, encryptedData);

    this.connections = connections;
    return this.connections;
  }
}
