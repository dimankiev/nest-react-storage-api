import { Test, TestingModule } from '@nestjs/testing';
import { AuthCryptoService } from './auth-crypto.service';

describe('AuthCryptoService', () => {
  let service: AuthCryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthCryptoService],
    }).compile();

    service = module.get<AuthCryptoService>(AuthCryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
