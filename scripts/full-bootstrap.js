#!/usr/bin/env node

/**
 * Complete Directus Bootstrap Script
 * 
 * This script creates all collections and field configurations for the complete
 * Grile.ro educational platform, including AI question review, quiz system,
 * content management, and user preferences.
 * 
 * Usage: node full-bootstrap.js
 */

import { createDirectus, staticToken, rest, createCollection, createField, updateField, readCollections, readFields } from '@directus/sdk';
import 'dotenv/config';

const directus = createDirectus(process.env.PUBLIC_URL || 'https://content.grile.ro')
  .with(staticToken(process.env.DIRECTUS_ADMIN_TOKEN))
  .with(rest());

// Complete collections configuration
const collectionsConfig = {
  // === AI SYSTEM COLLECTIONS ===
  ai_question_staging: {
    collection: 'ai_question_staging',
    icon: 'psychology',
    note: 'AI-generated questions awaiting review and approval',
    color: '#FF9800',
    display_template: '{{question_prompt}}',
    sort_field: 'created_at',
    fields: [
      { field: 'id', interface: 'input', readonly: true, hidden: true },
      { field: 'question_prompt', interface: 'input-multiline', required: true, width: 'full' },
      { field: 'question_type', interface: 'select-dropdown', width: 'half', options: {
        choices: [
          { text: 'Multiple Choice', value: 'multiple_choice' },
          { text: 'True/False', value: 'true_false' },
          { text: 'Fill in the Blank', value: 'fill_blank' }
        ]
      }},
      { field: 'difficulty_level', interface: 'select-dropdown', width: 'half', options: {
        choices: [
          { text: 'Easy', value: 'easy' },
          { text: 'Medium', value: 'medium' },
          { text: 'Hard', value: 'hard' }
        ]
      }},
      { field: 'explanation', interface: 'input-multiline', width: 'full' },
      { field: 'source_book_id', interface: 'select-dropdown-m2o', display: 'related-values', width: 'half' },
      { field: 'source_chapter_id', interface: 'select-dropdown-m2o', display: 'related-values', width: 'half' },
      { field: 'source_subchapter_id', interface: 'select-dropdown-m2o', display: 'related-values', width: 'half' },
      { field: 'source_page', interface: 'input', width: 'quarter' },
      { field: 'source_text', interface: 'input-multiline', width: 'full' },
      { field: 'ai_model', interface: 'input', readonly: true, width: 'half' },
      { field: 'generation_cost_tokens', interface: 'input', readonly: true, width: 'quarter' },
      { field: 'generation_cost_euros', interface: 'input', readonly: true, width: 'quarter' },
      { field: 'generation_prompt', interface: 'input-multiline', readonly: true, width: 'full' },
      { field: 'status', interface: 'select-dropdown', width: 'half', options: {
        choices: [
          { text: 'Pending Review', value: 'pending_review' },
          { text: 'Approved', value: 'approved' },
          { text: 'Declined', value: 'declined' },
          { text: 'Needs Revision', value: 'needs_revision' }
        ]
      }},
      { field: 'review_notes', interface: 'input-multiline', width: 'full' },
      { field: 'reviewed_by', interface: 'select-dropdown-m2o', display: 'related-values', readonly: true, width: 'half' },
      { field: 'reviewed_at', interface: 'datetime', readonly: true, width: 'half' },
      { field: 'created_at', interface: 'datetime', readonly: true, width: 'half' },
      { field: 'updated_at', interface: 'datetime', readonly: true, width: 'half' }
    ]
  },

  ai_answer_options_staging: {
    collection: 'ai_answer_options_staging',
    icon: 'quiz',
    note: 'Answer options for AI-generated questions',
    color: '#FF9800',
    display_template: '{{option_text}}',
    sort_field: 'option_order',
    fields: [
      { field: 'id', interface: 'input', readonly: true, hidden: true },
      { field: 'ai_question_staging_id', interface: 'select-dropdown-m2o', display: 'related-values', required: true, width: 'half' },
      { field: 'option_text', interface: 'input-multiline', required: true, width: 'full' },
      { field: 'is_correct', interface: 'boolean', width: 'quarter' },
      { field: 'option_order', interface: 'input', required: true, width: 'quarter' },
      { field: 'created_at', interface: 'datetime', readonly: true, width: 'half' }
    ]
  },

  ai_generation_costs: {
    collection: 'ai_generation_costs',
    icon: 'analytics',
    note: 'Daily AI generation costs and usage tracking',
    color: '#4CAF50',
    display_template: '{{date}} - {{model_name}} (€{{total_cost_euros}})',
    sort_field: 'date',
    fields: [
      { field: 'id', interface: 'input', readonly: true, hidden: true },
      { field: 'date', interface: 'datetime', width: 'half' },
      { field: 'model_name', interface: 'input', required: true, width: 'half' },
      { field: 'total_tokens', interface: 'input', width: 'quarter' },
      { field: 'total_cost_euros', interface: 'input', width: 'quarter' },
      { field: 'questions_generated', interface: 'input', width: 'quarter' },
      { field: 'questions_approved', interface: 'input', width: 'quarter' },
      { field: 'daily_limit_euros', interface: 'input', width: 'half' },
      { field: 'status', interface: 'select-dropdown', width: 'half', options: {
        choices: [
          { text: 'Active', value: 'active' },
          { text: 'Paused', value: 'paused' },
          { text: 'Limit Exceeded', value: 'limit_exceeded' }
        ]
      }}
    ]
  },

  // === CONTENT MANAGEMENT COLLECTIONS ===
  domains: {
    collection: 'domains',
    icon: 'domain',
    note: 'Subject domains for content organization',
    color: '#9C27B0',
    display_template: '{{domain_name}}',
    sort_field: 'sort',
    fields: [
      { field: 'id', interface: 'input-hash', readonly: true, hidden: true },
      { field: 'domain_name', interface: 'input', required: true, width: 'full' },
      { field: 'status', interface: 'select-dropdown', width: 'half', options: {
        choices: [
          { text: 'Published', value: 'published' },
          { text: 'Draft', value: 'draft' },
          { text: 'Archived', value: 'archived' }
        ]
      }},
      { field: 'sort', interface: 'input', hidden: true },
      { field: 'user_created', interface: 'select-dropdown-m2o', readonly: true, hidden: true },
      { field: 'date_created', interface: 'datetime', readonly: true, hidden: true },
      { field: 'user_updated', interface: 'select-dropdown-m2o', readonly: true, hidden: true },
      { field: 'date_updated', interface: 'datetime', readonly: true, hidden: true }
    ]
  },

  books: {
    collection: 'books',
    icon: 'menu_book',
    note: 'Educational book collection',
    color: '#2196F3',
    display_template: '{{book_name}} by {{authors}}',
    sort_field: 'sort',
    fields: [
      { field: 'id', interface: 'input', readonly: true, hidden: true },
      { field: 'book_name', interface: 'input', required: true, width: 'full' },
      { field: 'authors', interface: 'input', width: 'half' },
      { field: 'number_of_pages', interface: 'input', width: 'quarter' },
      { field: 'domain_id', interface: 'select-dropdown-m2o', display: 'related-values', width: 'quarter' },
      { field: 'status', interface: 'select-dropdown', width: 'half', options: {
        choices: [
          { text: 'Published', value: 'published' },
          { text: 'Draft', value: 'draft' },
          { text: 'Archived', value: 'archived' }
        ]
      }},
      { field: 'sort', interface: 'input', hidden: true },
      { field: 'user_created', interface: 'select-dropdown-m2o', readonly: true, hidden: true },
      { field: 'date_created', interface: 'datetime', readonly: true, hidden: true },
      { field: 'user_updated', interface: 'select-dropdown-m2o', readonly: true, hidden: true },
      { field: 'date_updated', interface: 'datetime', readonly: true, hidden: true }
    ]
  },

  chapters: {
    collection: 'chapters',
    icon: 'article',
    note: 'Book chapters organization',
    color: '#2196F3',
    display_template: '{{chapter_name}} (Page {{start_page}})',
    sort_field: 'sort',
    fields: [
      { field: 'id', interface: 'input', readonly: true, hidden: true },
      { field: 'chapter_name', interface: 'input', required: true, width: 'full' },
      { field: 'book_id', interface: 'select-dropdown-m2o', display: 'related-values', required: true, width: 'half' },
      { field: 'start_page', interface: 'input', width: 'quarter' },
      { field: 'status', interface: 'select-dropdown', width: 'quarter', options: {
        choices: [
          { text: 'Published', value: 'published' },
          { text: 'Draft', value: 'draft' },
          { text: 'Archived', value: 'archived' }
        ]
      }},
      { field: 'sort', interface: 'input', hidden: true },
      { field: 'user_created', interface: 'select-dropdown-m2o', readonly: true, hidden: true },
      { field: 'date_created', interface: 'datetime', readonly: true, hidden: true },
      { field: 'user_updated', interface: 'select-dropdown-m2o', readonly: true, hidden: true },
      { field: 'date_updated', interface: 'datetime', readonly: true, hidden: true }
    ]
  },

  subchapters: {
    collection: 'subchapters',
    icon: 'format_list_numbered',
    note: 'Sub-organization within chapters',
    color: '#2196F3',
    display_template: '{{subchapter_name}} (Page {{start_page}})',
    sort_field: 'sort',
    fields: [
      { field: 'id', interface: 'input', readonly: true, hidden: true },
      { field: 'subchapter_name', interface: 'input', required: true, width: 'full' },
      { field: 'chapter_id', interface: 'select-dropdown-m2o', display: 'related-values', required: true, width: 'half' },
      { field: 'start_page', interface: 'input', width: 'quarter' },
      { field: 'status', interface: 'select-dropdown', width: 'quarter', options: {
        choices: [
          { text: 'Published', value: 'published' },
          { text: 'Draft', value: 'draft' },
          { text: 'Archived', value: 'archived' }
        ]
      }},
      { field: 'sort', interface: 'input', hidden: true },
      { field: 'user_created', interface: 'select-dropdown-m2o', readonly: true, hidden: true },
      { field: 'date_created', interface: 'datetime', readonly: true, hidden: true },
      { field: 'user_updated', interface: 'select-dropdown-m2o', readonly: true, hidden: true },
      { field: 'date_updated', interface: 'datetime', readonly: true, hidden: true }
    ]
  },

  // === QUESTION SYSTEM ===
  questions: {
    collection: 'questions',
    icon: 'help',
    note: 'Published questions for quizzes and assessments',
    color: '#4CAF50',
    display_template: '{{question_prompt}}',
    sort_field: 'sort',
    fields: [
      { field: 'id', interface: 'input', readonly: true, hidden: true },
      { field: 'question_prompt', interface: 'input-multiline', required: true, width: 'full' },
      { field: 'question_type', interface: 'select-dropdown', width: 'half', options: {
        choices: [
          { text: 'Multiple Choice', value: 'multiple_choice' },
          { text: 'True/False', value: 'true_false' },
          { text: 'Fill in the Blank', value: 'fill_blank' }
        ]
      }},
      { field: 'difficulty_level', interface: 'select-dropdown', width: 'half', options: {
        choices: [
          { text: 'Easy', value: 'easy' },
          { text: 'Medium', value: 'medium' },
          { text: 'Hard', value: 'hard' }
        ]
      }},
      { field: 'explanation', interface: 'input-multiline', width: 'full' },
      { field: 'selected_answers', interface: 'input-code', width: 'full', options: { language: 'json' } },
      { field: 'book_id', interface: 'select-dropdown-m2o', display: 'related-values', width: 'third' },
      { field: 'chapter_id', interface: 'select-dropdown-m2o', display: 'related-values', width: 'third' },
      { field: 'subchapter_id', interface: 'select-dropdown-m2o', display: 'related-values', width: 'third' },
      { field: 'domain_id', interface: 'select-dropdown-m2o', display: 'related-values', width: 'half' },
      { field: 'tags', interface: 'tags', width: 'half' },
      { field: 'is_public', interface: 'boolean', width: 'quarter' },
      { field: 'is_free', interface: 'boolean', width: 'quarter' },
      { field: 'status', interface: 'select-dropdown', width: 'half', options: {
        choices: [
          { text: 'Published', value: 'published' },
          { text: 'Draft', value: 'draft' },
          { text: 'Archived', value: 'archived' }
        ]
      }},
      { field: 'sort', interface: 'input', hidden: true },
      { field: 'user_created', interface: 'select-dropdown-m2o', readonly: true, hidden: true },
      { field: 'date_created', interface: 'datetime', readonly: true, hidden: true },
      { field: 'user_updated', interface: 'select-dropdown-m2o', readonly: true, hidden: true },
      { field: 'date_updated', interface: 'datetime', readonly: true, hidden: true }
    ]
  },

  answer_options: {
    collection: 'answer_options',
    icon: 'radio_button_checked',
    note: 'Answer options for published questions',
    color: '#4CAF50',
    display_template: '{{text}} ({{is_correct}})',
    sort_field: 'sort_order',
    fields: [
      { field: 'id', interface: 'input', readonly: true, hidden: true },
      { field: 'question_id', interface: 'select-dropdown-m2o', display: 'related-values', required: true, width: 'half' },
      { field: 'text', interface: 'input-multiline', required: true, width: 'full' },
      { field: 'is_correct', interface: 'boolean', width: 'quarter' },
      { field: 'sort_order', interface: 'input', width: 'quarter' },
      { field: 'created_at', interface: 'datetime', readonly: true, width: 'half' },
      { field: 'updated_at', interface: 'datetime', readonly: true, width: 'half' }
    ]
  },

  // === QUIZ SYSTEM ===
  quiz_templates: {
    collection: 'quiz_templates',
    icon: 'assignment',
    note: 'Reusable quiz configurations and templates',
    color: '#FF5722',
    display_template: '{{name}}',
    sort_field: 'created_at',
    fields: [
      { field: 'id', interface: 'input-hash', readonly: true, hidden: true },
      { field: 'name', interface: 'input', required: true, width: 'full' },
      { field: 'user_id', interface: 'select-dropdown-m2o', display: 'related-values', required: true, width: 'half' },
      { field: 'settings', interface: 'input-code', width: 'full', options: { language: 'json' } },
      { field: 'is_public_template', interface: 'boolean', width: 'half' },
      { field: 'created_at', interface: 'datetime', readonly: true, width: 'half' },
      { field: 'updated_at', interface: 'datetime', readonly: true, width: 'half' }
    ]
  },

  quiz_instances: {
    collection: 'quiz_instances',
    icon: 'quiz',
    note: 'Individual quiz attempts by users',
    color: '#FF5722',
    display_template: 'Quiz {{id}} - {{status}}',
    sort_field: 'started_at',
    fields: [
      { field: 'id', interface: 'input-hash', readonly: true, hidden: true },
      { field: 'user_id', interface: 'select-dropdown-m2o', display: 'related-values', required: true, width: 'half' },
      { field: 'quiz_template_id', interface: 'select-dropdown-m2o', display: 'related-values', width: 'half' },
      { field: 'settings_snapshot', interface: 'input-code', width: 'full', options: { language: 'json' } },
      { field: 'user_answers', interface: 'input-code', width: 'full', options: { language: 'json' } },
      { field: 'current_question_index', interface: 'input', width: 'quarter' },
      { field: 'status', interface: 'select-dropdown', width: 'quarter', options: {
        choices: [
          { text: 'In Progress', value: 'in_progress' },
          { text: 'Completed', value: 'completed' },
          { text: 'Abandoned', value: 'abandoned' },
          { text: 'Paused', value: 'paused' }
        ]
      }},
      { field: 'score', interface: 'input', width: 'quarter' },
      { field: 'time_spent_seconds', interface: 'input', width: 'quarter' },
      { field: 'marked_for_review_question_ids', interface: 'input-code', width: 'full', options: { language: 'json' } },
      { field: 'started_at', interface: 'datetime', readonly: true, width: 'half' },
      { field: 'ended_at', interface: 'datetime', readonly: true, width: 'half' },
      { field: 'created_at', interface: 'datetime', readonly: true, width: 'half' },
      { field: 'updated_at', interface: 'datetime', readonly: true, width: 'half' }
    ]
  },

  quiz_instance_questions: {
    collection: 'quiz_instance_questions',
    icon: 'list_alt',
    note: 'Questions within quiz instances with order and answers',
    color: '#FF5722',
    display_template: 'Question {{question_order}}',
    sort_field: 'question_order',
    fields: [
      { field: 'id', interface: 'input-hash', readonly: true, hidden: true },
      { field: 'quiz_instance_id', interface: 'select-dropdown-m2o', display: 'related-values', required: true, width: 'half' },
      { field: 'question_id', interface: 'select-dropdown-m2o', display: 'related-values', required: true, width: 'half' },
      { field: 'question_order', interface: 'input', required: true, width: 'quarter' },
      { field: 'correct_option_ids', interface: 'tags', width: 'three-quarters' },
      { field: 'created_at', interface: 'datetime', readonly: true, width: 'half' }
    ]
  },

  // === USER SYSTEM ===
  profiles: {
    collection: 'profiles',
    icon: 'person',
    note: 'User profile information',
    color: '#607D8B',
    display_template: '{{first_name}} {{last_name}} ({{email}})',
    sort_field: 'updated_at',
    fields: [
      { field: 'id', interface: 'input-hash', readonly: true, hidden: true },
      { field: 'first_name', interface: 'input', width: 'half' },
      { field: 'last_name', interface: 'input', width: 'half' },
      { field: 'email', interface: 'input', required: true, width: 'full' },
      { field: 'domain_id', interface: 'select-dropdown-m2o', display: 'related-values', width: 'half' },
      { field: 'selected_domain_id', interface: 'select-dropdown-m2o', display: 'related-values', width: 'half' },
      { field: 'updated_at', interface: 'datetime', readonly: true, width: 'half' }
    ]
  },

  user_settings: {
    collection: 'user_settings',
    icon: 'settings',
    note: 'User preferences and configuration',
    color: '#607D8B',
    display_template: 'Settings for {{user_id}}',
    sort_field: 'updated_at',
    fields: [
      { field: 'id', interface: 'input-hash', readonly: true, hidden: true },
      { field: 'user_id', interface: 'select-dropdown-m2o', display: 'related-values', required: true, width: 'full' },
      { field: 'enable_timer', interface: 'boolean', width: 'half' },
      { field: 'show_correct_answers', interface: 'boolean', width: 'half' },
      { field: 'randomize_questions', interface: 'boolean', width: 'half' },
      { field: 'study_reminders', interface: 'boolean', width: 'half' },
      { field: 'quiz_results', interface: 'boolean', width: 'half' },
      { field: 'theme', interface: 'select-dropdown', width: 'quarter', options: {
        choices: [
          { text: 'System', value: 'system' },
          { text: 'Light', value: 'light' },
          { text: 'Dark', value: 'dark' }
        ]
      }},
      { field: 'language', interface: 'select-dropdown', width: 'quarter', options: {
        choices: [
          { text: 'English', value: 'en' },
          { text: 'Romanian', value: 'ro' }
        ]
      }},
      { field: 'created_at', interface: 'datetime', readonly: true, width: 'half' },
      { field: 'updated_at', interface: 'datetime', readonly: true, width: 'half' }
    ]
  },

  // === SUBSCRIPTION SYSTEM ===
  subscriptions: {
    collection: 'subscriptions',
    icon: 'payment',
    note: 'Stripe subscription management',
    color: '#795548',
    display_template: '{{stripe_subscription_id}} - {{status}}',
    sort_field: 'created_at',
    fields: [
      { field: 'id', interface: 'input-hash', readonly: true, hidden: true },
      { field: 'user_id', interface: 'select-dropdown-m2o', display: 'related-values', required: true, width: 'half' },
      { field: 'domain_id', interface: 'select-dropdown-m2o', display: 'related-values', required: true, width: 'half' },
      { field: 'stripe_subscription_id', interface: 'input', required: true, width: 'half' },
      { field: 'stripe_customer_id', interface: 'input', required: true, width: 'half' },
      { field: 'stripe_price_id', interface: 'input', width: 'half' },
      { field: 'status', interface: 'select-dropdown', width: 'half', options: {
        choices: [
          { text: 'Active', value: 'active' },
          { text: 'Canceled', value: 'canceled' },
          { text: 'Incomplete', value: 'incomplete' },
          { text: 'Incomplete Expired', value: 'incomplete_expired' },
          { text: 'Past Due', value: 'past_due' },
          { text: 'Trialing', value: 'trialing' },
          { text: 'Unpaid', value: 'unpaid' }
        ]
      }},
      { field: 'current_period_start', interface: 'datetime', width: 'half' },
      { field: 'current_period_end', interface: 'datetime', width: 'half' },
      { field: 'cancel_at_period_end', interface: 'boolean', width: 'quarter' },
      { field: 'canceled_at', interface: 'datetime', width: 'quarter' },
      { field: 'trial_start', interface: 'datetime', width: 'quarter' },
      { field: 'trial_end', interface: 'datetime', width: 'quarter' },
      { field: 'metadata', interface: 'input-code', width: 'full', options: { language: 'json' } },
      { field: 'created_at', interface: 'datetime', readonly: true, width: 'half' },
      { field: 'updated_at', interface: 'datetime', readonly: true, width: 'half' }
    ]
  },

  // === FLASHCARD SYSTEM ===
  flashcards: {
    collection: 'flashcards',
    icon: 'quiz',
    note: 'Flashcard content for spaced repetition learning',
    color: '#9C27B0',
    display_template: '{{front_text}}',
    sort_field: 'sort',
    fields: [
      { field: 'id', interface: 'input', readonly: true, hidden: true },
      { field: 'front_text', interface: 'input-multiline', required: true, width: 'full', note: 'Question or prompt side of the flashcard' },
      { field: 'back_text', interface: 'input-multiline', required: true, width: 'full', note: 'Answer or explanation side of the flashcard' },
      { field: 'explanation', interface: 'input-multiline', width: 'full', note: 'Additional explanation or context' },
      { field: 'difficulty_level', interface: 'select-dropdown', width: 'half', options: {
        choices: [
          { text: 'Easy', value: 'easy' },
          { text: 'Medium', value: 'medium' },
          { text: 'Hard', value: 'hard' }
        ]
      }},
      { field: 'domain_id', interface: 'select-dropdown-m2o', display: 'related-values', width: 'half', note: 'Subject domain' },
      { field: 'book_id', interface: 'select-dropdown-m2o', display: 'related-values', width: 'third', note: 'Source book (optional)' },
      { field: 'chapter_id', interface: 'select-dropdown-m2o', display: 'related-values', width: 'third', note: 'Source chapter (optional)' },
      { field: 'subchapter_id', interface: 'select-dropdown-m2o', display: 'related-values', width: 'third', note: 'Source subchapter (optional)' },
      { field: 'source_page', interface: 'input', width: 'quarter', note: 'Page number from source material (optional)' },
      { field: 'tags', interface: 'tags', width: 'three-quarters', note: 'Topic tags for categorization' },
      { field: 'status', interface: 'select-dropdown', width: 'half', options: {
        choices: [
          { text: 'Published', value: 'published' },
          { text: 'Draft', value: 'draft' },
          { text: 'Archived', value: 'archived' }
        ]
      }},
      { field: 'sort', interface: 'input', hidden: true },
      { field: 'user_created', interface: 'select-dropdown-m2o', readonly: true, hidden: true },
      { field: 'date_created', interface: 'datetime', readonly: true, hidden: true },
      { field: 'user_updated', interface: 'select-dropdown-m2o', readonly: true, hidden: true },
      { field: 'date_updated', interface: 'datetime', readonly: true, hidden: true }
    ]
  },

  // === LEGACY COLLECTIONS ===
  quizzes: {
    collection: 'quizzes',
    icon: 'quiz_outlined',
    note: 'Legacy quiz table (replaced by quiz_templates/quiz_instances)',
    color: '#E91E63',
    display_template: 'Legacy Quiz {{id}}',
    sort_field: 'date_created',
    fields: [
      { field: 'id', interface: 'input', readonly: true, hidden: true },
      { field: 'status', interface: 'select-dropdown', width: 'half', options: {
        choices: [
          { text: 'Published', value: 'published' },
          { text: 'Draft', value: 'draft' },
          { text: 'Archived', value: 'archived' }
        ]
      }},
      { field: 'is_public', interface: 'boolean', width: 'half' },
      { field: 'user_created', interface: 'select-dropdown-m2o', readonly: true, hidden: true },
      { field: 'date_created', interface: 'datetime', readonly: true, hidden: true },
      { field: 'user_updated', interface: 'select-dropdown-m2o', readonly: true, hidden: true },
      { field: 'date_updated', interface: 'datetime', readonly: true, hidden: true }
    ]
  }
};

async function fullBootstrap() {
  console.log('🚀 Starting complete Directus bootstrap for Grile.ro platform...\n');
  
  try {
    // Get existing collections and fields
    const existingCollections = await directus.request(readCollections());
    const existingCollectionNames = existingCollections.map(c => c.collection);
    const existingFields = await directus.request(readFields());
    
    let createdCollections = 0;
    let updatedCollections = 0;
    let updatedFields = 0;
    
    // Process each collection configuration
    for (const [collectionName, config] of Object.entries(collectionsConfig)) {
      console.log(`📋 Processing collection: ${collectionName}`);
      
      // Create collection if it doesn't exist
      if (!existingCollectionNames.includes(collectionName)) {
        console.log(`  ➕ Creating collection: ${collectionName}`);
        
        await directus.request(createCollection({
          collection: collectionName,
          icon: config.icon,
          note: config.note,
          color: config.color,
          display_template: config.display_template,
          sort_field: config.sort_field,
          fields: config.fields
        }));
        
        createdCollections++;
        console.log(`  ✅ Created collection: ${collectionName}`);
      } else {
        console.log(`  ℹ️  Collection exists: ${collectionName}, updating metadata...`);
        
        // Update collection metadata
        try {
          await directus.request(
            rest().patch(`/collections/${collectionName}`, {
              icon: config.icon,
              note: config.note,
              color: config.color,
              display_template: config.display_template,
              sort_field: config.sort_field
            })
          );
          updatedCollections++;
        } catch (error) {
          console.log(`    ⚠️  Could not update collection metadata: ${error.message}`);
        }
        
        // Update fields that have null interfaces or missing configurations
        const collectionFields = existingFields.filter(f => f.collection === collectionName);
        
        for (const fieldConfig of config.fields) {
          const existingField = collectionFields.find(f => f.field === fieldConfig.field);
          
          if (existingField && (!existingField.interface || existingField.interface === null)) {
            console.log(`    🔧 Updating field interface: ${fieldConfig.field}`);
            
            try {
              await directus.request(updateField(collectionName, fieldConfig.field, {
                interface: fieldConfig.interface,
                display: fieldConfig.display || null,
                options: fieldConfig.options || null,
                readonly: fieldConfig.readonly || false,
                hidden: fieldConfig.hidden || false,
                width: fieldConfig.width || 'full',
                required: fieldConfig.required || false
              }));
              
              updatedFields++;
              console.log(`    ✅ Updated field: ${fieldConfig.field}`);
            } catch (error) {
              console.log(`    ⚠️  Could not update field ${fieldConfig.field}: ${error.message}`);
            }
          }
        }
      }
      
      console.log(''); // Add spacing between collections
    }
    
    // Summary
    console.log('\n🎉 Bootstrap completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   • Collections created: ${createdCollections}`);
    console.log(`   • Collections updated: ${updatedCollections}`);
    console.log(`   • Fields updated: ${updatedFields}`);
    console.log(`   • Total collections configured: ${Object.keys(collectionsConfig).length}`);
    
    console.log('\n✨ Your complete Grile.ro Directus setup includes:');
    console.log('   🤖 AI Question Generation & Review System');
    console.log('   📚 Content Management (Domains → Books → Chapters → Subchapters)');
    console.log('   ❓ Question & Answer Management');
    console.log('   🎯 Quiz Templates & Instance System');
    console.log('   🎴 Flashcard System for Spaced Repetition');
    console.log('   👤 User Profiles & Settings');
    console.log('   💳 Subscription Management');
    console.log('   📊 Cost Tracking & Analytics');
    
    console.log('\n📝 You can now refresh your Directus admin interface to see all configured collections.');
    
  } catch (error) {
    console.error('❌ Bootstrap failed:', error.message);
    if (error.errors) {
      error.errors.forEach(err => console.error('  -', err.message));
    }
    process.exit(1);
  }
}

// Run the full bootstrap
fullBootstrap();