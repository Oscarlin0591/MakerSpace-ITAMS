/**
 * server.test.ts
 * Supertest integration tests for Express auth and pending-update routes.
 *
 * @ai-assisted Codex (OpenAI) — https://openai.com/codex
 * AI used to add route tests that avoid listeners, cron jobs, realtime, and email.
 */

import request from 'supertest';
import jwt from 'jsonwebtoken';
import { initializeServer } from '../src/server';
import { pendingUpdates } from '../src/router/uploadRouter';

describe('Express routes', () => {
  let app: Awaited<ReturnType<typeof initializeServer>>;

  beforeAll(async () => {
    app = await initializeServer({
      startListening: false,
      enableEmail: false,
      enableScheduledJobs: false,
      enableRealtime: false,
      enableHeartbeat: false,
    });
  });

  beforeEach(() => {
    pendingUpdates.splice(0, pendingUpdates.length);
  });

  it('rejects protected routes without a JWT', async () => {
    await request(app).get('/api/items').expect(401, {
      message: 'Access denied. No token provided.',
    });
  });

  it('accepts a valid user JWT on /authorized', async () => {
    const token = jwt.sign({ username: 'student', isAdmin: false }, process.env.JWT_SECRET as string);

    const response = await request(app).get('/api/authorized').set('Authorization', token).expect(200);

    expect(response.body).toBe(true);
  });

  it('rejects non-admin JWTs on admin routes', async () => {
    const token = jwt.sign({ username: 'student', isAdmin: false }, process.env.JWT_SECRET as string);

    await request(app).get('/api/authorized-admin').set('Authorization', token).expect(403, {
      message: 'Administrator access denied.',
    });
  });

  it('returns pending updates for admins without hardware or Python', async () => {
    pendingUpdates.push({
      id: 'pending-1',
      itemID: 7,
      itemName: 'PLA spool',
      cameraIndex: 0,
      currentQuantity: 2,
      proposedQuantity: 5,
      timestamp: '2026-04-29T00:00:00.000Z',
      labelCounts: { pla: 5 },
    });
    const token = jwt.sign({ username: 'admin', isAdmin: true }, process.env.JWT_SECRET as string);

    const response = await request(app).get('/api/pending-updates').set('Authorization', token).expect(200);

    expect(response.body).toEqual([
      expect.objectContaining({ id: 'pending-1', itemID: 7, proposedQuantity: 5 }),
    ]);
  });
});
