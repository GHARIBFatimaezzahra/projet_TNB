import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Create Test User (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a test admin user', async () => {
    const testUser = {
      username: 'testadmin',
      email: 'testadmin@example.com',
      password: 'test123',
      nom: 'Test Admin',
      profil: 'Admin'
    };

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(testUser)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.username).toBe(testUser.username);
    console.log('✅ Test user created successfully:', response.body.data);
  });

  it('should login with test user', async () => {
    const loginData = {
      username: 'testadmin',
      password: 'test123'
    };

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send(loginData)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.access_token).toBeDefined();
    console.log('✅ Login successful, token received');
    
    // Test accessing protected endpoint
    const statsResponse = await request(app.getHttpServer())
      .get('/api/v1/users/statistics')
      .set('Authorization', `Bearer ${response.body.data.access_token}`)
      .expect(200);

    console.log('✅ Statistics endpoint accessible:', statsResponse.body);
  });
});