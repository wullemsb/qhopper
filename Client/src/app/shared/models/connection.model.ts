export interface ConnectionModel {
  host: string;
  username: string;
  password: string;
}

export interface NamedConnection {
  name: string;
  connection: ConnectionModel;
}
