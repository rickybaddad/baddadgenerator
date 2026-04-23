import { ImportStatus, ImportType, Prisma } from '@prisma/client';
import { prisma } from '../prisma';

export async function withImportRun<T>(
  type: ImportType,
  handler: (runId: string) => Promise<{ message?: string; metadata?: Prisma.JsonValue; status?: ImportStatus; data: T }>
) {
  const run = await prisma.importRun.create({ data: { type, status: ImportStatus.SUCCESS } });
  try {
    const result = await handler(run.id);
    await prisma.importRun.update({
      where: { id: run.id },
      data: {
        status: result.status ?? ImportStatus.SUCCESS,
        message: result.message,
        metadata: result.metadata,
        completedAt: new Date()
      }
    });
    return result.data;
  } catch (error) {
    await prisma.importRun.update({
      where: { id: run.id },
      data: {
        status: ImportStatus.FAILED,
        message: error instanceof Error ? error.message : 'Unknown failure',
        completedAt: new Date()
      }
    });
    throw error;
  }
}
