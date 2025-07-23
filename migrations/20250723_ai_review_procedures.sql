-- Migration: AI Question Review Procedures
-- Date: 2025-07-23

-- 1. Accept AI Question
CREATE OR REPLACE FUNCTION public.accept_ai_question(
    p_question_id INTEGER,
    p_user UUID
) RETURNS INTEGER
LANGUAGE plpgsql AS $$
DECLARE
    v_new_question_id INTEGER;
BEGIN
    -- Copy question into production table
    INSERT INTO public.questions (
        question_prompt,
        explanation,
        question_type,
        difficulty_level,
        book_id,
        chapter_id,
        subchapter_id,
        user_created,
        date_created
    )
    SELECT 
        q.question_prompt,
        q.explanation,
        q.question_type,
        q.difficulty_level,
        q.source_book_id,
        q.source_chapter_id,
        q.source_subchapter_id,
        p_user,
        NOW()
    FROM public.ai_question_staging q
    WHERE q.id = p_question_id
    RETURNING id INTO v_new_question_id;

    -- Copy answers
    INSERT INTO public.answer_options (
        question_id, text, is_correct, sort_order, created_at
    )
    SELECT 
        v_new_question_id,
        a.option_text,
        a.is_correct,
        a.option_order,
        NOW()
    FROM public.ai_answer_options_staging a
    WHERE a.ai_question_staging_id = p_question_id;

    -- Mark staging row as migrated/approved
    UPDATE public.ai_question_staging
    SET status       = 'approved',
        reviewed_by  = p_user,
        reviewed_at  = NOW()
    WHERE id = p_question_id;

    RETURN v_new_question_id;
END;
$$;

-- 2. Decline AI Question
CREATE OR REPLACE FUNCTION public.decline_ai_question(
    p_question_id INTEGER,
    p_user UUID,
    p_reason TEXT
) RETURNS VOID
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE public.ai_question_staging
    SET status       = 'declined',
        review_notes = p_reason,
        reviewed_by  = p_user,
        reviewed_at  = NOW()
    WHERE id = p_question_id;
END;
$$;

-- 3. Reviewer Stats View
CREATE OR REPLACE VIEW public.vw_user_review_stats AS
SELECT 
    reviewed_by               AS user_id,
    COUNT(*) FILTER (WHERE status = 'approved') AS approved_count,
    COUNT(*) FILTER (WHERE status = 'declined') AS declined_count,
    COUNT(*)                                  AS total_reviewed,
    MAX(reviewed_at)                          AS last_review
FROM public.ai_question_staging
WHERE status IN ('approved','declined')
GROUP BY reviewed_by; 