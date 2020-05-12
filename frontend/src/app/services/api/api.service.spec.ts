import { ApiService } from './api.service';
import { ContactMeRequest } from '../../model/api.model';

describe('ApiService', () => {
  let service: ApiService;
  let httpClientSpy: { post: jasmine.Spy };

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['post']);
    service = new ApiService(httpClientSpy as any);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('.contactMe', () => {
    it('should make GET request', () => {
      const payload: ContactMeRequest = {
        name: 'Patrick',
        email: 'someemail@email.net',
        message: 'my message'
      };
      service.contactMe(payload);
      expect(httpClientSpy.post).toHaveBeenCalledWith('/api/message/send', payload);
    });
  });
});
