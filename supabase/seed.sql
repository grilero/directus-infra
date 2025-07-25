-- =============================================================================
-- Grile.ro Complete Bootstrap - Schema + Seed Data
-- Creates all collections and loads production sample data
-- =============================================================================

-- Ensure we're working with the public schema
SET search_path TO public;

-- =============================================================================
-- SCHEMA CREATION
-- =============================================================================

-- Drop existing tables (for clean bootstrap)
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

-- =============================================================================
-- CORE CONTENT COLLECTIONS
-- =============================================================================

-- Domains (Subject areas)
INSERT INTO domains (id, domain_name, status, sort, date_created, date_updated) VALUES 
('9524c5c4-b831-4695-8d20-9445c688f678', 'Medicină Dentară - Rezidențiat', 'published', 1, NOW(), NOW()),
('e2ac9b1d-ec84-4fc9-9648-78df8446924b', 'Medicină Generală - Rezidențiat', 'published', 2, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Books
INSERT INTO books (id, book_name, authors, number_of_pages, domain_id, status, sort, date_created, date_updated) VALUES 
(5, 'Manual pentru rezidențiat - Volumul I', 'PROF. DR. ECATERINA IONESCU', 366, '9524c5c4-b831-4695-8d20-9445c688f678', 'published', 1, NOW(), NOW()),
(6, 'Manual pentru rezidențiat - Volumul II', 'PROF. DR. ECATERINA IONESCU', 308, '9524c5c4-b831-4695-8d20-9445c688f678', 'published', 2, NOW(), NOW()),
(8, 'Kumar și Clark Medicină Clinică', 'Adam Feather, David Randall, Mona Waterhouse', 650, 'e2ac9b1d-ec84-4fc9-9648-78df8446924b', 'published', 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Chapters
INSERT INTO chapters (id, chapter_name, book_id, status, sort, date_created, date_updated) VALUES 
(18, 'CAP. 8 - SEPSISUL ȘI TRATAMENTUL INFECȚIILOR BACTERIENE', 8, 'published', 1, NOW(), NOW()),
(19, 'CAP. 9 - ECHILIBRUL HIDRO-ELECTROLITIC ȘI ACIDO-BAZIC', 8, 'published', 2, NOW(), NOW()),
(20, 'CAP. 10 - TERAPIE INTENSIVĂ', 8, 'published', 3, NOW(), NOW()),
(21, 'CAP. 16 - HEMATOLOGIE', 8, 'published', 4, NOW(), NOW()),
(22, 'CAP. 18 - REUMATOLOGIE', 8, 'published', 5, NOW(), NOW()),
(5, 'CAP. 5 - PARODONTOLOGIE', 5, 'published', 1, NOW(), NOW()),
(6, 'CAP. 6 - CARDIOLOGIE', 6, 'published', 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Subchapters (sample data)
INSERT INTO subchapters (id, subchapter_name, chapter_id, status, sort, date_created, date_updated) VALUES 
(1, 'Gingivita și tratamentul ei', 5, 'published', 1, NOW(), NOW()),
(2, 'Parodontita cronică', 5, 'published', 2, NOW(), NOW()),
(3, 'Tehnici de detartraj', 5, 'published', 3, NOW(), NOW()),
(4, 'Ciclul cardiac și fiziopatologie', 6, 'published', 1, NOW(), NOW()),
(5, 'Hipertensiunea arterială', 6, 'published', 2, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- QUESTION SYSTEM
-- =============================================================================

-- Published Questions
INSERT INTO questions (id, question_prompt, question_type, selected_answers, explanation, book_id, chapter_id, domain_id, is_public, is_free, tags, difficulty_level, status, date_created, date_updated) VALUES 
(227, 'Care este principala cauză a gingivitei?', 'single_choice', '["Placa bacteriană"]', 'Placa bacteriană este principala cauză a gingivitei, fiind formată din biofilm bacterian care se acumulează la nivelul marginii gingivale.', 5, 5, '9524c5c4-b831-4695-8d20-9445c688f678', true, true, '["parodontologie", "gingivita", "placa-bacteriana"]', 'medium', 'published', NOW(), NOW()),
(228, 'Care sunt semnele clinice ale parodontitei cronice?', 'multiple_choice', '["Sângerare gingivală", "Pungi parodontale", "Mobilitate dentară", "Retracția gingivală"]', 'Parodontita cronică se caracterizează prin sângerare gingivală, formarea de pungi parodontale, mobilitate dentară și retracția gingivală.', 5, 5, '9524c5c4-b831-4695-8d20-9445c688f678', true, true, '["parodontologie", "parodontita", "semne-clinice"]', 'medium', 'published', NOW(), NOW()),
(229, 'Care este valoarea normală a tensiunii arteriale?', 'single_choice', '["120/80 mmHg"]', 'Tensiunea arterială normală este considerată 120/80 mmHg conform ghidurilor internaționale.', 6, 6, '9524c5c4-b831-4695-8d20-9445c688f678', true, true, '["cardiologie", "tensiune-arteriala", "valori-normale"]', 'easy', 'published', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Answer Options for Questions
INSERT INTO answer_options (id, question_id, text, is_correct, sort_order, created_at, updated_at) VALUES 
-- Options for question 227 (Gingivita)
(1, 227, 'Placa bacteriană', true, 1, NOW(), NOW()),
(2, 227, 'Traumatismul dentar', false, 2, NOW(), NOW()),
(3, 227, 'Deficiența vitaminelor', false, 3, NOW(), NOW()),
(4, 227, 'Fumatul', false, 4, NOW(), NOW()),

-- Options for question 228 (Parodontita)
(5, 228, 'Sângerare gingivală', true, 1, NOW(), NOW()),
(6, 228, 'Pungi parodontale', true, 2, NOW(), NOW()),
(7, 228, 'Mobilitate dentară', true, 3, NOW(), NOW()),
(8, 228, 'Retracția gingivală', true, 4, NOW(), NOW()),
(9, 228, 'Carii dentare', false, 5, NOW(), NOW()),

-- Options for question 229 (Tensiune arterială)
(10, 229, '120/80 mmHg', true, 1, NOW(), NOW()),
(11, 229, '110/70 mmHg', false, 2, NOW(), NOW()),
(12, 229, '140/90 mmHg', false, 3, NOW(), NOW()),
(13, 229, '130/85 mmHg', false, 4, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- AI SYSTEM COLLECTIONS
-- =============================================================================

-- AI Question Staging
INSERT INTO ai_question_staging (id, question_prompt, question_type, difficulty_level, explanation, source_book_id, source_chapter_id, domain_id, source_text, ai_model, generation_cost_tokens, generation_cost_euros, status, created_at, updated_at) VALUES 
(1, 'Care sunt cele două faze principale ale ciclului cardiac?', 'multiple_choice', 'easy', 'Conform contextului furnizat, ciclul cardiac constă în fazele de sistolă și diastolă.', 6, 6, '9524c5c4-b831-4695-8d20-9445c688f678', 'The cardiac cycle consists of systole and diastole phases.', 'gemini-2.5-flash', 2739, 0.0002, 'pending_review', NOW(), NOW()),
(2, 'Conform informațiilor furnizate, ce valoare a tensiunii arteriale sistolice ar indica hipertensiune?', 'multiple_choice', 'medium', 'Conform contextului, hipertensiunea este definită ca fiind ≥ 140/90 mmHg. Prin urmare, o valoare a tensiunii arteriale sistolice de 140 mmHg sau mai mare indică hipertensiune.', 6, 6, '9524c5c4-b831-4695-8d20-9445c688f678', 'Normal blood pressure is 120/80 mmHg. Hypertension is ≥ 140/90 mmHg.', 'gemini-2.5-flash', 2865, 0.0002, 'pending_review', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- AI Answer Options Staging
INSERT INTO ai_answer_options_staging (id, ai_question_staging_id, option_text, is_correct, option_order, created_at) VALUES 
-- Options for AI question 1 (Ciclul cardiac)
(1, 1, 'Contracție și relaxare', false, 1, NOW()),
(2, 1, 'Sistolă și diastolă', true, 2, NOW()),
(3, 1, 'Umplere și golire', false, 3, NOW()),
(4, 1, 'Depolarizare și repolarizare', false, 4, NOW()),

-- Options for AI question 2 (Hipertensiune)
(5, 2, '120 mmHg', false, 1, NOW()),
(6, 2, '130 mmHg', false, 2, NOW()),
(7, 2, '139 mmHg', false, 3, NOW()),
(8, 2, '140 mmHg', true, 4, NOW()),
(9, 2, '150 mmHg', false, 5, NOW())
ON CONFLICT (id) DO NOTHING;

-- AI Generation Costs (sample tracking data)
INSERT INTO ai_generation_costs (id, date, model_name, total_tokens, total_cost_euros, questions_generated, questions_approved, daily_limit_euros, status) VALUES 
(1, CURRENT_DATE, 'gemini-2.5-flash', 5604, 0.0004, 2, 0, 5.00, 'active'),
(2, CURRENT_DATE - INTERVAL '1 day', 'gemini-2.5-flash', 12000, 0.0012, 5, 3, 5.00, 'active')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- USER SYSTEM COLLECTIONS
-- =============================================================================

-- User Profiles (sample data)
INSERT INTO profiles (id, first_name, last_name, email, domain_id, selected_domain_id, updated_at) VALUES 
('69ecb1cb-9350-4512-ab7c-50bade9482c5', 'Admin', 'User', 'admin@grile.ro', '9524c5c4-b831-4695-8d20-9445c688f678', '9524c5c4-b831-4695-8d20-9445c688f678', NOW()),
('a207f010-435c-4724-935a-99a46d582060', 'Demo', 'Student', 'student@grile.ro', 'e2ac9b1d-ec84-4fc9-9648-78df8446924b', 'e2ac9b1d-ec84-4fc9-9648-78df8446924b', NOW())
ON CONFLICT (id) DO NOTHING;

-- User Settings
INSERT INTO user_settings (id, user_id, enable_timer, show_correct_answers, randomize_questions, study_reminders, quiz_results, theme, language, created_at, updated_at) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '69ecb1cb-9350-4512-ab7c-50bade9482c5', true, true, true, false, true, 'system', 'ro', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'a207f010-435c-4724-935a-99a46d582060', true, false, true, true, true, 'dark', 'ro', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- QUIZ SYSTEM COLLECTIONS
-- =============================================================================

-- Quiz Templates
INSERT INTO quiz_templates (id, name, user_id, settings, is_public_template, created_at, updated_at) VALUES 
('650e8400-e29b-41d4-a716-446655440001', 'Template Parodontologie', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '{"duration": 30, "questions_count": 10, "domain_id": "9524c5c4-b831-4695-8d20-9445c688f678", "difficulty": "medium"}', true, NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440002', 'Template Cardiologie', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '{"duration": 45, "questions_count": 15, "domain_id": "e2ac9b1d-ec84-4fc9-9648-78df8446924b", "difficulty": "easy"}', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Quiz Instances (sample quiz attempts)
INSERT INTO quiz_instances (id, user_id, settings_snapshot, user_answers, current_question_index, status, score, time_spent_seconds, started_at, ended_at, created_at, updated_at) VALUES 
('750e8400-e29b-41d4-a716-446655440001', 'a207f010-435c-4724-935a-99a46d582060', '{"duration": 30, "questions_count": 3}', '[{"question_id": 227, "selected_options": [1], "time_spent": 45}, {"question_id": 228, "selected_options": [5,6,7,8], "time_spent": 60}]', 2, 'completed', 85, 105, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 58 minutes', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 58 minutes'),
('750e8400-e29b-41d4-a716-446655440002', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '{"duration": 45, "questions_count": 2}', '[{"question_id": 229, "selected_options": [10], "time_spent": 30}]', 1, 'in_progress', null, null, NOW() - INTERVAL '30 minutes', null, NOW() - INTERVAL '30 minutes', NOW())
ON CONFLICT (id) DO NOTHING;

-- Quiz Instance Questions
INSERT INTO quiz_instance_questions (id, quiz_instance_id, question_id, question_order, correct_option_ids, created_at) VALUES 
('850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 227, 1, '[1]', NOW()),
('850e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001', 228, 2, '[5,6,7,8]', NOW()),
('850e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440002', 229, 1, '[10]', NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- ADDITIONAL COLLECTIONS
-- =============================================================================

-- Flashcards
INSERT INTO flashcards (id, front_text, back_text, explanation, difficulty_level, domain_id, book_id, chapter_id, tags, status, sort, date_created, date_updated) VALUES 
(1, 'Care este principala cauză a gingivitei?', 'Placa bacteriană', 'Biofilmul bacterian se acumulează la marginea gingivală și provoacă inflamația gingivală.', 'easy', '9524c5c4-b831-4695-8d20-9445c688f678', 5, 5, '["parodontologie", "gingivita"]', 'published', 1, NOW(), NOW()),
(2, 'Ce înseamnă sistolă?', 'Faza de contracție a ventriculilor', 'În timpul sistolei, ventriculii se contractă și pompează sângele în aortă și artera pulmonară.', 'medium', '9524c5c4-b831-4695-8d20-9445c688f678', 6, 6, '["cardiologie", "sistola"]', 'published', 2, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Subscriptions (sample Stripe data)
INSERT INTO subscriptions (id, user_id, domain_id, stripe_subscription_id, stripe_customer_id, status, current_period_start, current_period_end, cancel_at_period_end, metadata, created_at, updated_at) VALUES 
('950e8400-e29b-41d4-a716-446655440001', 'a207f010-435c-4724-935a-99a46d582060', '9524c5c4-b831-4695-8d20-9445c688f678', 'sub_1234567890', 'cus_1234567890', 'active', NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days', false, '{"plan": "monthly", "price": 29.99}', NOW() - INTERVAL '15 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- Legacy Quizzes (for backward compatibility)
INSERT INTO quizzes (id, status, is_public, date_created, date_updated) VALUES 
(1, 'published', true, NOW(), NOW()),
(2, 'draft', false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- RESET SEQUENCES FOR AUTO-INCREMENT FIELDS
-- =============================================================================

-- Reset sequences to ensure proper auto-increment continuation
SELECT setval('books_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM books), false);
SELECT setval('chapters_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM chapters), false);
SELECT setval('subchapters_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM subchapters), false);
SELECT setval('questions_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM questions), false);
SELECT setval('answer_options_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM answer_options), false);
SELECT setval('ai_question_staging_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM ai_question_staging), false);
SELECT setval('ai_answer_options_staging_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM ai_answer_options_staging), false);
SELECT setval('ai_generation_costs_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM ai_generation_costs), false);
SELECT setval('flashcards_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM flashcards), false);
SELECT setval('quizzes_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM quizzes), false);
SELECT setval('test_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM test), false);

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

SELECT 'Grile.ro seed data loaded successfully!' as message,
       (SELECT COUNT(*) FROM domains) as domains_count,
       (SELECT COUNT(*) FROM books) as books_count,
       (SELECT COUNT(*) FROM chapters) as chapters_count,
       (SELECT COUNT(*) FROM questions) as questions_count,
       (SELECT COUNT(*) FROM ai_question_staging) as ai_questions_count,
       (SELECT COUNT(*) FROM answer_options) as answer_options_count;