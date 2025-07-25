-- =============================================================================
-- AI Question Review System - Stored Procedures and Views
-- Adds the missing stored procedures mentioned in README for AI workflow
-- =============================================================================

-- Drop existing procedures and views if they exist
DROP FUNCTION IF EXISTS accept_ai_question(INTEGER);
DROP FUNCTION IF EXISTS decline_ai_question(INTEGER, TEXT);
DROP VIEW IF EXISTS vw_user_review_stats;

-- =============================================================================
-- STORED PROCEDURE: accept_ai_question
-- Moves an AI-generated question from staging to production
-- =============================================================================
CREATE OR REPLACE FUNCTION accept_ai_question(p_staging_id INTEGER)
RETURNS JSON AS $$
DECLARE
    staging_question RECORD;
    new_question_id INTEGER;
    answer_option RECORD;
    result JSON;
BEGIN
    -- Get the staging question
    SELECT * INTO staging_question 
    FROM ai_question_staging 
    WHERE id = p_staging_id AND status = 'pending_review';
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Question not found or already processed'
        );
    END IF;
    
    -- Insert into production questions table
    INSERT INTO questions (
        question_prompt,
        question_type,
        explanation,
        book_id,
        chapter_id,
        subchapter_id,
        domain_id,
        difficulty_level,
        status,
        user_created,
        date_created
    ) VALUES (
        staging_question.question_prompt,
        staging_question.question_type,
        staging_question.explanation,
        staging_question.source_book_id,
        staging_question.source_chapter_id,
        staging_question.source_subchapter_id,
        staging_question.domain_id,
        staging_question.difficulty_level,
        'published',
        staging_question.reviewed_by,
        NOW()
    ) RETURNING id INTO new_question_id;
    
    -- Copy answer options from staging to production
    FOR answer_option IN 
        SELECT * FROM ai_answer_options_staging 
        WHERE ai_question_staging_id = p_staging_id
    LOOP
        INSERT INTO answer_options (
            question_id,
            text,
            is_correct,
            sort_order,
            created_at
        ) VALUES (
            new_question_id,
            answer_option.option_text,
            answer_option.is_correct,
            answer_option.option_order,
            NOW()
        );
    END LOOP;
    
    -- Update staging question status
    UPDATE ai_question_staging 
    SET 
        status = 'approved',
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_staging_id;
    
    -- Update generation costs stats
    UPDATE ai_generation_costs 
    SET questions_approved = questions_approved + 1
    WHERE date = CURRENT_DATE 
      AND model_name = staging_question.ai_model;
    
    RETURN json_build_object(
        'success', true,
        'staging_id', p_staging_id,
        'production_id', new_question_id,
        'message', 'Question successfully moved to production'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- STORED PROCEDURE: decline_ai_question  
-- Marks an AI-generated question as declined with reason
-- =============================================================================
CREATE OR REPLACE FUNCTION decline_ai_question(p_staging_id INTEGER, p_reason TEXT)
RETURNS JSON AS $$
DECLARE
    staging_question RECORD;
    result JSON;
BEGIN
    -- Get the staging question
    SELECT * INTO staging_question 
    FROM ai_question_staging 
    WHERE id = p_staging_id AND status = 'pending_review';
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Question not found or already processed'
        );
    END IF;
    
    -- Update staging question with decline reason
    UPDATE ai_question_staging 
    SET 
        status = 'declined',
        review_notes = p_reason,
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_staging_id;
    
    RETURN json_build_object(
        'success', true,
        'staging_id', p_staging_id,
        'reason', p_reason,
        'message', 'Question declined and archived'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- VIEW: vw_user_review_stats
-- Shows reviewer statistics for the AI question review system
-- =============================================================================
CREATE VIEW vw_user_review_stats AS
SELECT 
    reviewed_by as reviewer_id,
    COUNT(*) as total_reviews,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
    COUNT(*) FILTER (WHERE status = 'declined') as declined_count,
    ROUND(
        (COUNT(*) FILTER (WHERE status = 'approved')::NUMERIC / COUNT(*)) * 100, 2
    ) as approval_rate,
    MIN(reviewed_at) as first_review_date,
    MAX(reviewed_at) as last_review_date,
    DATE_TRUNC('day', MAX(reviewed_at)) as last_review_day,
    -- Daily stats for current month
    COUNT(*) FILTER (
        WHERE reviewed_at >= DATE_TRUNC('month', CURRENT_DATE)
    ) as reviews_this_month,
    COUNT(*) FILTER (
        WHERE reviewed_at >= CURRENT_DATE
    ) as reviews_today,
    -- Average reviews per day (for reviewers with activity in last 30 days)
    CASE 
        WHEN MAX(reviewed_at) >= (CURRENT_DATE - INTERVAL '30 days') THEN
            ROUND(
                COUNT(*) FILTER (WHERE reviewed_at >= (CURRENT_DATE - INTERVAL '30 days'))::NUMERIC / 
                GREATEST(1, EXTRACT(DAY FROM (CURRENT_DATE - GREATEST(MIN(reviewed_at), CURRENT_DATE - INTERVAL '30 days')))), 2
            )
        ELSE 0 
    END as avg_reviews_per_day_30d
FROM ai_question_staging 
WHERE reviewed_by IS NOT NULL 
  AND status IN ('approved', 'declined')
GROUP BY reviewed_by;

-- =============================================================================
-- GRANT PERMISSIONS
-- Ensure the stored procedures and views can be accessed by Directus
-- =============================================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION accept_ai_question(INTEGER) TO PUBLIC;
GRANT EXECUTE ON FUNCTION decline_ai_question(INTEGER, TEXT) TO PUBLIC;

-- Grant select permissions on view
GRANT SELECT ON vw_user_review_stats TO PUBLIC;

-- =============================================================================
-- EXAMPLE USAGE (for testing)
-- =============================================================================

-- Test the stored procedures (uncomment to test):
-- 
-- -- Approve a staging question (replace 1 with actual staging ID)
-- SELECT accept_ai_question(1);
-- 
-- -- Decline a staging question with reason  
-- SELECT decline_ai_question(2, 'Grammar errors and unclear wording');
-- 
-- -- View reviewer statistics
-- SELECT * FROM vw_user_review_stats;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================