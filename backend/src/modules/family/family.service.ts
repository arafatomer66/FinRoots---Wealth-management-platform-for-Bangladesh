import db from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

export class FamilyService {
  async getAll(userId: number) {
    return db('family_members').where({ user_id: userId }).orderBy('created_at', 'asc');
  }

  async getById(userId: number, id: number) {
    const member = await db('family_members').where({ id, user_id: userId }).first();
    if (!member) throw new AppError(404, 'Family member not found');
    return member;
  }

  async create(userId: number, input: Record<string, any>) {
    // Auto-detect minor status
    if (input.date_of_birth) {
      const age = this.calculateAge(new Date(input.date_of_birth));
      input.is_minor = age < 18;
    }

    const [member] = await db('family_members').insert({ ...input, user_id: userId }).returning('*');
    return member;
  }

  async update(userId: number, id: number, input: Record<string, any>) {
    if (input.date_of_birth) {
      const age = this.calculateAge(new Date(input.date_of_birth));
      input.is_minor = age < 18;
    }

    const [member] = await db('family_members')
      .where({ id, user_id: userId })
      .update({ ...input, updated_at: db.fn.now() })
      .returning('*');
    if (!member) throw new AppError(404, 'Family member not found');
    return member;
  }

  async delete(userId: number, id: number) {
    const deleted = await db('family_members').where({ id, user_id: userId }).del();
    if (!deleted) throw new AppError(404, 'Family member not found');
  }

  async getNominees(userId: number) {
    return db('family_members').where({ user_id: userId, is_nominee: true });
  }

  async getMinors(userId: number) {
    return db('family_members').where({ user_id: userId, is_minor: true });
  }

  private calculateAge(dob: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }
}

export const familyService = new FamilyService();
