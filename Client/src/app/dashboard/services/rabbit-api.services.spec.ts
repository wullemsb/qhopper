import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { RabbitApiService } from "./rabbit-api.service";
import { RefreshService } from "./refresh.service";
import { ConnectionService } from "../../shared/services/connection.service";
import { ConnectionModel } from "../../shared/models/connection.model";

describe('RabbitApiService', () => {
  let service: RabbitApiService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RabbitApiService, RefreshService, ConnectionService]
    });
    service = TestBed.inject(RabbitApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should update base API URL correctly', () => {
    const connection: ConnectionModel = {
      host: 'http://localhost:15672',
      username: 'testUser',
      password: 'testPassword'
    };
    spyOn(service['connectionService'], 'connectionSignal').and.returnValue(connection);
    service.updateHttpOptions();
    expect(service['baseApiUrl']).toEqual(connection.host);
  });

  it('should construct correct URL for getQueues()', () => {
    const testVhost = 'testVhost';
    const expectedUrl = `http://localhost:15672/api/queues/${encodeURIComponent(testVhost)}`;
    service.getQueues(testVhost).subscribe();
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual('GET');
  });

  it('should construct correct URL for getVhost()', () => {
    const testName = 'testVhost';
    const expectedUrl = `http://localhost:15672/api/vhosts/${encodeURIComponent(testName)}`;
    service.getVhost(testName).subscribe();
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual('GET');
  });

  it('should construct correct URL for getMessages()', () => {
    const testVhost = 'testVhost';
    const testQueue = 'testQueue';
    const expectedUrl = `http://localhost:15672/api/queues/${encodeURIComponent(testVhost)}/${encodeURIComponent(testQueue)}/get`;
    service.getMessages(testVhost, testQueue).subscribe();
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual('POST');
  });
});
