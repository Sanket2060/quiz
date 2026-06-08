import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  primaryKey,
  index,
  date
} from 'drizzle-orm/pg-core';

// Existing users table (reference only or defined for FKs)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().notNull(),
  full_name: text('full_name'),
  avatar_url: text('avatar_url'),
  billing_address: text('billing_address'), // In reality jsonb in schema.sql, but for now we focus on new tables
  payment_method: text('payment_method') // In reality jsonb in schema.sql
});

export const chapters = pgTable('chapters', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const questions = pgTable(
  'questions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    chapterId: uuid('chapter_id')
      .references(() => chapters.id, { onDelete: 'cascade' })
      .notNull(),
    text: text('text').notNull(),
    source: text('source'),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  (table) => {
    return {
      chapterIdIdx: index('questions_chapter_id_idx').on(table.chapterId)
    };
  }
);

export const questionOptions = pgTable(
  'question_options',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    questionId: uuid('question_id')
      .references(() => questions.id, { onDelete: 'cascade' })
      .notNull(),
    text: text('text').notNull(),
    isCorrect: boolean('is_correct').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  (table) => {
    return {
      questionIdIdx: index('question_options_question_id_idx').on(
        table.questionId
      )
    };
  }
);

export const exams = pgTable('exams', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const attempts = pgTable(
  'attempts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    examId: uuid('exam_id').references(() => exams.id, {
      onDelete: 'set null'
    }),
    type: text('type').notNull(), // 'practice', 'mock', 'daily'
    score: integer('score').default(0).notNull(),
    totalQuestions: integer('total_questions').default(0).notNull(),
    startedAt: timestamp('started_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at')
  },
  (table) => {
    return {
      userIdIdx: index('attempts_user_id_idx').on(table.userId),
      examIdIdx: index('attempts_exam_id_idx').on(table.examId)
    };
  }
);

export const attemptAnswers = pgTable(
  'attempt_answers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    attemptId: uuid('attempt_id')
      .references(() => attempts.id, { onDelete: 'cascade' })
      .notNull(),
    questionId: uuid('question_id')
      .references(() => questions.id, { onDelete: 'cascade' })
      .notNull(),
    selectedOptionId: uuid('selected_option_id')
      .references(() => questionOptions.id, { onDelete: 'cascade' })
      .notNull(),
    isCorrect: boolean('is_correct').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  (table) => {
    return {
      attemptIdIdx: index('attempt_answers_attempt_id_idx').on(table.attemptId),
      questionIdIdx: index('attempt_answers_question_id_idx').on(
        table.questionId
      )
    };
  }
);

export const bookmarkedQuestions = pgTable(
  'bookmarked_questions',
  {
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    questionId: uuid('question_id')
      .references(() => questions.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.questionId] })
    };
  }
);

export const dailyChallenges = pgTable('daily_challenges', {
  id: uuid('id').defaultRandom().primaryKey(),
  date: date('date').unique().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const dailyChallengeQuestions = pgTable(
  'daily_challenge_questions',
  {
    dailyChallengeId: uuid('daily_challenge_id')
      .references(() => dailyChallenges.id, { onDelete: 'cascade' })
      .notNull(),
    questionId: uuid('question_id')
      .references(() => questions.id, { onDelete: 'cascade' })
      .notNull()
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.dailyChallengeId, table.questionId] })
    };
  }
);
