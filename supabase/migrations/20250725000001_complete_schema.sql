-- =============================================================================
-- Grile.ro Complete Schema Migration
-- Creates all collections for remote Supabase instances (dev/prod)
-- =============================================================================

-- Ensure we're working with the public schema
SET search_path TO public;

-- Drop existing tables (for clean migration)
DROP TABLE IF EXISTS ai_answer_options_staging CASCADE;
DROP TABLE IF EXISTS ai_question_staging CASCADE;
DROP TABLE IF EXISTS answer_options CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS quiz_instance_questions CASCADE;
DROP TABLE IF EXISTS quiz_instances CASCADE;
DROP TABLE IF EXISTS quiz_templates CASCADE;
DROP TABLE IF EXISTS flashcards CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS subchapters CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS domains CASCADE;
DROP TABLE IF EXISTS ai_generation_costs CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS test CASCADE;

-- Domains (Subject areas)
CREATE TABLE domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'published',
    sort INTEGER,
    user_created UUID,
    date_created TIMESTAMP DEFAULT NOW(),
    user_updated UUID,
    date_updated TIMESTAMP DEFAULT NOW()
);

-- Books
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    book_name VARCHAR(500) NOT NULL,
    authors VARCHAR(500),
    number_of_pages INTEGER,
    domain_id UUID REFERENCES domains(id),
    status VARCHAR(255) DEFAULT 'published',
    sort INTEGER,
    user_created UUID,
    date_created TIMESTAMP DEFAULT NOW(),
    user_updated UUID,
    date_updated TIMESTAMP DEFAULT NOW()
);

-- Chapters
CREATE TABLE chapters (
    id SERIAL PRIMARY KEY,
    chapter_name VARCHAR(500) NOT NULL,
    book_id INTEGER REFERENCES books(id),
    start_page INTEGER,
    status VARCHAR(255) DEFAULT 'published',
    sort INTEGER,
    user_created UUID,
    date_created TIMESTAMP DEFAULT NOW(),
    user_updated UUID,
    date_updated TIMESTAMP DEFAULT NOW()
);

-- Subchapters
CREATE TABLE subchapters (
    id SERIAL PRIMARY KEY,
    subchapter_name VARCHAR(500) NOT NULL,
    chapter_id INTEGER REFERENCES chapters(id),
    start_page INTEGER,
    status VARCHAR(255) DEFAULT 'published',
    sort INTEGER,
    user_created UUID,
    date_created TIMESTAMP DEFAULT NOW(),
    user_updated UUID,
    date_updated TIMESTAMP DEFAULT NOW()
);

-- Questions (Published)
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    question_prompt TEXT NOT NULL,
    question_type VARCHAR(100) DEFAULT 'single_choice',
    selected_answers JSONB,
    explanation TEXT,
    book_id INTEGER REFERENCES books(id),
    chapter_id INTEGER REFERENCES chapters(id),
    subchapter_id INTEGER REFERENCES subchapters(id),
    domain_id UUID REFERENCES domains(id),
    difficulty_level VARCHAR(50) DEFAULT 'medium',
    tags JSONB,
    is_public BOOLEAN DEFAULT true,
    is_free BOOLEAN DEFAULT true,
    status VARCHAR(255) DEFAULT 'published',
    sort INTEGER,
    user_created UUID,
    date_created TIMESTAMP DEFAULT NOW(),
    user_updated UUID,
    date_updated TIMESTAMP DEFAULT NOW()
);

-- Answer Options (for published questions)
CREATE TABLE answer_options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    sort_order INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- AI Question Staging
CREATE TABLE ai_question_staging (
    id SERIAL PRIMARY KEY,
    question_prompt TEXT NOT NULL,
    question_type VARCHAR(100) DEFAULT 'single_choice_single_answer',
    difficulty_level VARCHAR(50) DEFAULT 'medium',
    explanation TEXT,
    source_book_id INTEGER REFERENCES books(id),
    source_chapter_id INTEGER REFERENCES chapters(id),
    source_subchapter_id INTEGER REFERENCES subchapters(id),
    domain_id UUID REFERENCES domains(id),
    source_page INTEGER,
    source_text TEXT,
    ai_model VARCHAR(100),
    generation_cost_tokens INTEGER,
    generation_cost_euros DECIMAL(10,6),
    generation_prompt TEXT,
    status VARCHAR(50) DEFAULT 'pending_review',
    review_notes TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- AI Answer Options Staging
CREATE TABLE ai_answer_options_staging (
    id SERIAL PRIMARY KEY,
    ai_question_staging_id INTEGER REFERENCES ai_question_staging(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    option_order INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- AI Generation Costs
CREATE TABLE ai_generation_costs (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    total_tokens INTEGER DEFAULT 0,
    total_cost_euros DECIMAL(10,6) DEFAULT 0.00,
    questions_generated INTEGER DEFAULT 0,
    questions_approved INTEGER DEFAULT 0,
    daily_limit_euros DECIMAL(10,2) DEFAULT 5.00,
    status VARCHAR(50) DEFAULT 'active'
);

-- User Profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    domain_id UUID REFERENCES domains(id),
    selected_domain_id UUID REFERENCES domains(id),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User Settings
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    enable_timer BOOLEAN DEFAULT true,
    show_correct_answers BOOLEAN DEFAULT true,
    randomize_questions BOOLEAN DEFAULT true,
    study_reminders BOOLEAN DEFAULT false,
    quiz_results BOOLEAN DEFAULT true,
    theme VARCHAR(20) DEFAULT 'system',
    language VARCHAR(5) DEFAULT 'ro',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Quiz Templates
CREATE TABLE quiz_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL,
    settings JSONB,
    is_public_template BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Quiz Instances
CREATE TABLE quiz_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    settings_snapshot JSONB,
    user_answers JSONB,
    current_question_index INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'in_progress',
    score INTEGER,
    time_spent_seconds INTEGER,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Quiz Instance Questions
CREATE TABLE quiz_instance_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_instance_id UUID REFERENCES quiz_instances(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id),
    question_order INTEGER NOT NULL,
    correct_option_ids JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Flashcards
CREATE TABLE flashcards (
    id SERIAL PRIMARY KEY,
    front_text TEXT NOT NULL,
    back_text TEXT NOT NULL,
    explanation TEXT,
    difficulty_level VARCHAR(50) DEFAULT 'medium',
    domain_id UUID REFERENCES domains(id),
    book_id INTEGER REFERENCES books(id),
    chapter_id INTEGER REFERENCES chapters(id),
    subchapter_id INTEGER REFERENCES subchapters(id),
    tags JSONB,
    status VARCHAR(255) DEFAULT 'published',
    sort INTEGER,
    user_created UUID,
    date_created TIMESTAMP DEFAULT NOW(),
    user_updated UUID,
    date_updated TIMESTAMP DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    domain_id UUID REFERENCES domains(id),
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Legacy Quizzes (for backward compatibility)
CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    status VARCHAR(255) DEFAULT 'published',
    is_public BOOLEAN DEFAULT true,
    date_created TIMESTAMP DEFAULT NOW(),
    date_updated TIMESTAMP DEFAULT NOW()
);

-- Test Collection (for development)
CREATE TABLE test (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    status VARCHAR(255) DEFAULT 'published',
    date_created TIMESTAMP DEFAULT NOW(),
    date_updated TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_books_domain_id ON books(domain_id);
CREATE INDEX idx_chapters_book_id ON chapters(book_id);
CREATE INDEX idx_subchapters_chapter_id ON subchapters(chapter_id);
CREATE INDEX idx_questions_book_id ON questions(book_id);
CREATE INDEX idx_questions_chapter_id ON questions(chapter_id);
CREATE INDEX idx_questions_domain_id ON questions(domain_id);
CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_answer_options_question_id ON answer_options(question_id);
CREATE INDEX idx_ai_staging_domain_id ON ai_question_staging(domain_id);
CREATE INDEX idx_ai_staging_status ON ai_question_staging(status);
CREATE INDEX idx_ai_staging_book_id ON ai_question_staging(source_book_id);
CREATE INDEX idx_ai_options_question_id ON ai_answer_options_staging(ai_question_staging_id);
CREATE INDEX idx_ai_costs_date ON ai_generation_costs(date);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_quiz_instances_user_id ON quiz_instances(user_id);

SELECT 'Grile.ro schema migration completed successfully!' as message,
       'All 18 collections created with indexes' as details;