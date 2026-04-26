import db from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import fs from 'fs';
import path from 'path';

export class DocumentsService {
  async getAll(userId: number) {
    return db('documents')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc');
  }

  async getById(userId: number, id: number) {
    const doc = await db('documents').where({ id, user_id: userId }).first();
    if (!doc) throw new AppError(404, 'Document not found');
    return doc;
  }

  async create(userId: number, input: Record<string, any>) {
    const [doc] = await db('documents').insert({ ...input, user_id: userId }).returning('*');
    return doc;
  }

  async update(userId: number, id: number, input: Record<string, any>) {
    const [doc] = await db('documents')
      .where({ id, user_id: userId })
      .update({ ...input, updated_at: db.fn.now() })
      .returning('*');
    if (!doc) throw new AppError(404, 'Document not found');
    return doc;
  }

  async delete(userId: number, id: number) {
    const doc = await db('documents').where({ id, user_id: userId }).first();
    if (!doc) throw new AppError(404, 'Document not found');

    // Remove file from disk
    const filePath = path.resolve(doc.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await db('documents').where({ id, user_id: userId }).del();
  }
}

export const documentsService = new DocumentsService();
