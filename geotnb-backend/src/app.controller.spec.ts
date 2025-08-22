import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string, defaultValue?: any) => {
      const config = {
        'npm_package_version': '1.0.0',
        'NODE_ENV': 'test',
        'BUILD_DATE': '2024-01-15',
        'COMMIT_HASH': 'test-hash',
        'GIT_BRANCH': 'test',
        'BUILD_NUMBER': '1',
      };
      return config[key] || defaultValue;
    }),
  };

  const mockAppService = {
    getHealthCheck: jest.fn(),
    getAppInfo: jest.fn(),
    getVersion: jest.fn(),
    handleContact: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const result = {
        status: 'ok',
        timestamp: '2024-01-15T10:30:00.000Z',
        uptime: 3600,
        version: '1.0.0',
        environment: 'test',
        database: 'connected',
      };

      mockAppService.getHealthCheck.mockResolvedValue(result);

      expect(await appController.getHealth()).toBe(result);
      expect(appService.getHealthCheck).toHaveBeenCalled();
    });
  });

  describe('App Info', () => {
    it('should return application information', () => {
      const result = {
        name: 'GeoTNB API',
        description: 'API pour la gestion de la TNB',
        version: '1.0.0',
        author: 'GeoConseil',
        environment: 'test',
      };

      mockAppService.getAppInfo.mockReturnValue(result);

      expect(appController.getInfo()).toBe(result);
      expect(appService.getAppInfo).toHaveBeenCalled();
    });
  });

  describe('Version', () => {
    it('should return version information', () => {
      const result = {
        version: '1.0.0',
        buildDate: '2024-01-15',
        commitHash: 'test-hash',
      };

      mockAppService.getVersion.mockReturnValue(result);

      expect(appController.getVersion()).toBe(result);
      expect(appService.getVersion).toHaveBeenCalled();
    });
  });

  describe('Contact', () => {
    it('should handle contact form submission', async () => {
      const contactData = {
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
      };

      const result = {
        message: 'Message envoyé avec succès',
        timestamp: '2024-01-15T10:30:00.000Z',
        reference: 'TNB-1234567890',
      };

      mockAppService.handleContact.mockResolvedValue(result);

      expect(await appController.contact(contactData)).toBe(result);
      expect(appService.handleContact).toHaveBeenCalledWith(contactData);
    });
  });

  describe('Controller Instantiation', () => {
    it('should be defined', () => {
      expect(appController).toBeDefined();
    });

    it('should have appService injected', () => {
      expect(appService).toBeDefined();
    });
  });
});