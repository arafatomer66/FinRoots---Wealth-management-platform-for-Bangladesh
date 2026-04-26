import db from '../../config/database';

function getNextDueDate(currentDate: string, frequency: string): string {
  const d = new Date(currentDate);
  switch (frequency) {
    case 'daily': d.setDate(d.getDate() + 1); break;
    case 'weekly': d.setDate(d.getDate() + 7); break;
    case 'monthly': d.setMonth(d.getMonth() + 1); break;
    case 'quarterly': d.setMonth(d.getMonth() + 3); break;
    case 'yearly': d.setFullYear(d.getFullYear() + 1); break;
  }
  return d.toISOString().split('T')[0];
}

export class RecurringService {
  async getUpcoming(userId: number) {
    const [incomeItems, expenseItems] = await Promise.all([
      db('income').where({ user_id: userId, is_recurring: true }).whereNotNull('next_due_date').orderBy('next_due_date', 'asc'),
      db('expenses').where({ user_id: userId, is_recurring: true }).whereNotNull('next_due_date').orderBy('next_due_date', 'asc'),
    ]);

    return {
      income: incomeItems.map((i: any) => ({ ...i, entry_type: 'income' })),
      expenses: expenseItems.map((e: any) => ({ ...e, entry_type: 'expense' })),
    };
  }

  async processdue(userId: number) {
    const today = new Date().toISOString().split('T')[0];
    const processed: any[] = [];

    // Process due income entries
    const dueIncome = await db('income')
      .where({ user_id: userId, is_recurring: true })
      .where('next_due_date', '<=', today);

    for (const entry of dueIncome) {
      const nextDue = getNextDueDate(entry.next_due_date, entry.frequency);
      await db('income').where({ id: entry.id }).update({ next_due_date: nextDue, updated_at: db.fn.now() });
      processed.push({ type: 'income', source: entry.source, amount: entry.amount, nextDue });
    }

    // Process due expense entries
    const dueExpenses = await db('expenses')
      .where({ user_id: userId, is_recurring: true })
      .where('next_due_date', '<=', today);

    for (const entry of dueExpenses) {
      // Create a new expense entry for the due date
      await db('expenses').insert({
        user_id: userId,
        category: entry.category,
        amount: entry.amount,
        frequency: entry.frequency,
        date: entry.next_due_date,
        notes: `Auto-generated from recurring: ${entry.notes || entry.category}`,
        is_recurring: false,
      });
      const nextDue = getNextDueDate(entry.next_due_date, entry.frequency);
      await db('expenses').where({ id: entry.id }).update({ next_due_date: nextDue, updated_at: db.fn.now() });
      processed.push({ type: 'expense', category: entry.category, amount: entry.amount, nextDue });
    }

    return { processed: processed.length, entries: processed };
  }

  async toggleRecurring(table: 'income' | 'expenses', userId: number, id: number, isRecurring: boolean) {
    const entry = await db(table).where({ id, user_id: userId }).first();
    if (!entry) return null;

    const update: any = { is_recurring: isRecurring, updated_at: db.fn.now() };
    if (isRecurring && !entry.next_due_date) {
      update.next_due_date = getNextDueDate(new Date().toISOString().split('T')[0], entry.frequency);
    }
    if (!isRecurring) {
      update.next_due_date = null;
    }

    const [updated] = await db(table).where({ id, user_id: userId }).update(update).returning('*');
    return updated;
  }
}

export const recurringService = new RecurringService();
