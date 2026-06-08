import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { v4 as uuidv4 } from 'uuid';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:54322/postgres';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function main() {
  console.log('Seeding database...');

  // 1. Chapters
  const chaptersData = [
    { id: uuidv4(), name: 'Chapter 1: General Requirements' },
    { id: uuidv4(), name: 'Chapter 2: Wiring and Protection' },
    { id: uuidv4(), name: 'Chapter 3: Wiring Methods and Materials' },
  ];

  await db.insert(schema.chapters).values(chaptersData).onConflictDoNothing();
  console.log('Chapters seeded.');

  // 2. Questions & Options
  const chapter1Id = chaptersData[0].id;

  const q1Id = uuidv4();
  await db.insert(schema.questions).values({
    id: q1Id,
    chapterId: chapter1Id,
    text: 'What is the minimum working space depth for a 120V system to ground with exposed live parts on one side and no live or grounded parts on the other?',
    source: 'NEC 110.26(A)(1)',
  });

  await db.insert(schema.questionOptions).values([
    { questionId: q1Id, text: '2 feet', isCorrect: false },
    { questionId: q1Id, text: '3 feet', isCorrect: true },
    { questionId: q1Id, text: '4 feet', isCorrect: false },
    { questionId: q1Id, text: '6 feet', isCorrect: false },
  ]);

  const q2Id = uuidv4();
  await db.insert(schema.questions).values({
    id: q2Id,
    chapterId: chapter1Id,
    text: 'Equipment that is associated with the electrical installation and is located above or below the electrical equipment shall be permitted to extend not more than ____ inches beyond the front of the electrical equipment.',
    source: 'NEC 110.26(A)(3)',
  });

  await db.insert(schema.questionOptions).values([
    { questionId: q2Id, text: '3 inches', isCorrect: false },
    { questionId: q2Id, text: '6 inches', isCorrect: true },
    { questionId: q2Id, text: '12 inches', isCorrect: false },
    { questionId: q2Id, text: '24 inches', isCorrect: false },
  ]);

  console.log('Questions and Options seeded.');

  // 3. Exams
  await db.insert(schema.exams).values([
    {
      id: uuidv4(),
      name: 'Full NEC Practice Exam 1',
      description: 'A comprehensive 100-question practice exam covering all chapters.',
    },
    {
      id: uuidv4(),
      name: 'Residential Code Focus',
      description: 'Focuses specifically on residential wiring requirements.',
    },
  ]);
  console.log('Exams seeded.');

  console.log('Seeding completed successfully.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
