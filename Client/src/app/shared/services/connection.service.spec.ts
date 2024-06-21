import { TestBed } from '@angular/core/testing';
import { ConnectionService } from './connection.service';
import { ConnectionModel } from '../models/connection.model';

describe('ConnectionService', () => {
  let service: ConnectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConnectionService]
    });
    service = TestBed.inject(ConnectionService);
  });

  it('should add a connection', () => {
    const connection: ConnectionModel = { host: 'test.com', username: 'user', password: 'pass' };
    const connection2: ConnectionModel = { host: 'test2.com', username: 'user2', password: 'pass2' };
    service.addConnection('Test1', connection);
    service.addConnection('Test2', connection2);
    const connectionsBefore = service.getAllConnections().length;
    expect(connectionsBefore).toEqual(2);
  });

  it('should delete a connection', () => {
    const connection: ConnectionModel = { host: 'test.com', username: 'user', password: 'pass' };
    const connection2: ConnectionModel = { host: 'test2.com', username: 'user2', password: 'pass2' };
    service.addConnection('Test1', connection);
    service.addConnection('Test2', connection2);
    service.deleteConnection(connection);
    const connectionsAfter = service.getAllConnections().length;
    expect(connectionsAfter).toEqual(1);
  });

  it('should get all connections', () => {
    const connection: ConnectionModel = { host: 'test.com', username: 'user', password: 'pass' };
    const connection2: ConnectionModel = { host: 'test2.com', username: 'user2', password: 'pass2' };
    service.addConnection('Test1', connection);
    service.addConnection('Test2', connection2);
    const connections = service.getAllConnections();
    expect(connections.length).toEqual(2);
  });

  it('should get all connection names', () => {
    let connection: ConnectionModel = { host: 'test.com', username: 'user', password: 'pass' };
    let connection2: ConnectionModel = { host: 'test2.com', username: 'user2', password: 'pass2' };
    service.addConnection('Test1', connection);
    service.addConnection('Test2', connection2);
    const connectionNames = service.getConnectionNames();
    expect(connectionNames.length).toEqual(2);
    expect(connectionNames).toContain('Test1');
    expect(connectionNames).toContain('Test2');
  });

});
