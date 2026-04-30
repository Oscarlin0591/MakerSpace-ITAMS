/**
 * uploadRouter.test.ts
 * Unit tests for upload inference business logic and mocked subprocess execution.
 *
 * @ai-assisted Codex (OpenAI) — https://openai.com/codex
 * AI used to test inference queue helpers without running Python or hardware.
 */

import { EventEmitter } from 'events';
import { jest } from '@jest/globals';
import {
  applyInferenceResults,
  getProposedQuantity,
  mergeLabelCounts,
  pendingUpdates,
  queueUpdate,
  runPythonInference,
  type PendingImage,
} from '../../src/router/uploadRouter';
import { InventoryItem } from '../../src/models/inventory_item';

describe('upload inference business logic', () => {
  beforeEach(() => {
    pendingUpdates.splice(0, pendingUpdates.length);
  });

  it('calculates proposed quantity from all matching YOLO labels', () => {
    const item = new InventoryItem(1, 'PLA spool', 1, 10, 3, ['pla', 'spool'], 0);

    expect(getProposedQuantity(item, { pla: 2, spool: 3, unrelated: 99 })).toBe(5);
  });

  it('merges label counts across camera images', () => {
    expect(mergeLabelCounts([{ pla: 2 }, { pla: 3, wood: 1 }])).toEqual({ pla: 5, wood: 1 });
  });

  it('keeps at most one pending update per item', () => {
    const item = new InventoryItem(1, 'PLA spool', 1, 10, 3, ['pla'], 0);

    queueUpdate(item, 4, 0, { pla: 4 });
    queueUpdate(item, 7, 1, { pla: 7 });

    expect(pendingUpdates).toHaveLength(1);
    expect(pendingUpdates[0]).toMatchObject({
      itemID: 1,
      proposedQuantity: 7,
      cameraIndex: 1,
      labelCounts: { pla: 7 },
    });
  });

  it('queues camera-specific and cross-camera null-camera updates', async () => {
    const cameraItem = new InventoryItem(1, 'PLA spool', 1, 10, 3, ['pla'], 0);
    const sharedItem = new InventoryItem(2, 'Glue sticks', 1, 5, 1, ['glue'], undefined);
    const images: PendingImage[] = [
      { path: 'cam0.jpg', cameraIndex: 0 },
      { path: 'cam1.jpg', cameraIndex: 1 },
    ];

    await applyInferenceResults(images, [{ pla: 4, glue: 1 }, { glue: 2 }], {
      getItemsByCameraId: async (cameraId) => (cameraId === 0 ? [cameraItem] : []),
      getItemsWithNullCamera: async () => [sharedItem],
    });

    expect(pendingUpdates).toEqual([
      expect.objectContaining({ itemID: 1, proposedQuantity: 4, cameraIndex: 0 }),
      expect.objectContaining({ itemID: 2, proposedQuantity: 3, cameraIndex: null }),
    ]);
  });
});

describe('runPythonInference', () => {
  it('uses an injectable mocked subprocess instead of running Python', async () => {
    const stdout = new EventEmitter();
    const stderr = new EventEmitter();
    const child = new EventEmitter() as EventEmitter & { stdout: EventEmitter; stderr: EventEmitter };
    child.stdout = stdout;
    child.stderr = stderr;
    const spawnMock = jest.fn(() => child);

    const promise = runPythonInference([{ path: 'cam0.jpg', cameraIndex: 0 }], spawnMock as never);
    stdout.emit('data', Buffer.from('[{"pla":2}]'));
    child.emit('close', 0);

    await expect(promise).resolves.toEqual([{ pla: 2 }]);
    expect(spawnMock).toHaveBeenCalledWith('python', ['inference.py', 'cam0.jpg']);
  });
});
