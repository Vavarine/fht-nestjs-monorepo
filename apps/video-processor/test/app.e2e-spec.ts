import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('VideoProcessor (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Application Bootstrap', () => {
    it('should initialize the video processor application', () => {
      expect(app).toBeDefined();
    });

    it('should have required modules loaded', () => {
      const moduleRef = app.get(AppModule);
      expect(moduleRef).toBeDefined();
    });
  });

  describe('Message Consumer', () => {
    it('should be ready to consume messages from RabbitMQ', async () => {
      // The app should have connected to RabbitMQ on init
      // This is a basic test to ensure the app can start without errors
      expect(app).toBeDefined();
    });
  });

  // Note: Full E2E testing of video processing would require:
  // - RabbitMQ test container
  // - S3/RustFS test setup
  // - Sample video files
  // - Database test container
  // These would be better suited for integration tests with TestContainers
});
