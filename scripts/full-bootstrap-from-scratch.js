#!/usr/bin/env node

/**
 * Complete Directus Bootstrap - From Scratch
 * 
 * This script creates collections AND database tables from scratch,
 * just like creating collections through the Directus UI.
 * 
 * Usage: node full-bootstrap-from-scratch.js
 */

import { createDirectus, staticToken, rest, createCollection, createField, updateCollection, readCollections } from '@directus/sdk';
import 'dotenv/config';

const directus = createDirectus(process.env.PUBLIC_URL || 'https://content.grile.ro')
  .with(staticToken(process.env.DIRECTUS_ADMIN_TOKEN))
  .with(rest());

// Complete collection definitions for creating entire platform from scratch
const collectionsToCreate = {
  // === AI SYSTEM COLLECTIONS ===
  ai_question_staging: {
    collection: 'ai_question_staging',
    icon: 'psychology',
    note: 'AI-generated questions awaiting review and approval',
    color: '#FF9800',
    display_template: '{{question_prompt}}',
    sort_field: 'created_at',
    fields: [
      { field: 'id', type: 'integer', meta: { interface: 'input', readonly: true, hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } },
      { field: 'question_prompt', type: 'text', meta: { interface: 'input-multiline', required: true, width: 'full' }, schema: { is_nullable: false } },
      { field: 'question_type', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: {
        choices: [
          { text: 'Multiple Choice', value: 'multiple_choice' },
          { text: 'True/False', value: 'true_false' },
          { text: 'Fill in the Blank', value: 'fill_blank' }
        ]
      }}, schema: { default_value: 'multiple_choice', length: 50 } },
      { field: 'difficulty_level', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: {
        choices: [
          { text: 'Easy', value: 'easy' },
          { text: 'Medium', value: 'medium' },
          { text: 'Hard', value: 'hard' }
        ]
      }}, schema: { length: 10 } },
      { field: 'explanation', type: 'text', meta: { interface: 'input-multiline', width: 'full' } },
      { field: 'source_book_id', type: 'integer', meta: { interface: 'select-dropdown-m2o', display: 'related-values', width: 'third' } },
      { field: 'source_chapter_id', type: 'integer', meta: { interface: 'select-dropdown-m2o', display: 'related-values', width: 'third' } },
      { field: 'source_subchapter_id', type: 'integer', meta: { interface: 'select-dropdown-m2o', display: 'related-values', width: 'third' } },
      { field: 'source_page', type: 'integer', meta: { interface: 'input', width: 'quarter' } },
      { field: 'source_text', type: 'text', meta: { interface: 'input-multiline', width: 'full' } },
      { field: 'ai_model', type: 'text', meta: { interface: 'input', readonly: true, width: 'half' }, schema: { is_nullable: false } },
      { field: 'generation_cost_tokens', type: 'integer', meta: { interface: 'input', readonly: true, width: 'quarter' }, schema: { default_value: 0 } },
      { field: 'generation_cost_euros', type: 'decimal', meta: { interface: 'input', readonly: true, width: 'quarter' }, schema: { numeric_precision: 10, numeric_scale: 4, default_value: 0 } },
      { field: 'generation_prompt', type: 'text', meta: { interface: 'input-multiline', readonly: true, width: 'full' } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: {
        choices: [
          { text: 'Pending Review', value: 'pending_review' },
          { text: 'Approved', value: 'approved' },
          { text: 'Declined', value: 'declined' },
          { text: 'Needs Revision', value: 'needs_revision' }
        ]
      }}, schema: { default_value: 'pending_review', length: 20 } },
      { field: 'review_notes', type: 'text', meta: { interface: 'input-multiline', width: 'full' } },
      { field: 'reviewed_by', type: 'uuid', meta: { interface: 'select-dropdown-m2o', display: 'related-values', readonly: true, width: 'half' } },
      { field: 'reviewed_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' } },
      { field: 'created_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' }, schema: { default_value: 'now()' } },
      { field: 'updated_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' }, schema: { default_value: 'now()' } }
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
      { field: 'id', type: 'integer', meta: { interface: 'input', readonly: true, hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } },
      { field: 'ai_question_staging_id', type: 'integer', meta: { interface: 'select-dropdown-m2o', display: 'related-values', required: true, width: 'half' } },
      { field: 'option_text', type: 'text', meta: { interface: 'input-multiline', required: true, width: 'full' }, schema: { is_nullable: false } },
      { field: 'is_correct', type: 'boolean', meta: { interface: 'boolean', width: 'quarter' }, schema: { default_value: false } },
      { field: 'option_order', type: 'integer', meta: { interface: 'input', required: true, width: 'quarter' }, schema: { is_nullable: false } },
      { field: 'created_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' }, schema: { default_value: 'now()' } }
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
      { field: 'id', type: 'integer', meta: { interface: 'input', readonly: true, hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } },
      { field: 'date', type: 'date', meta: { interface: 'datetime', width: 'half' }, schema: { default_value: 'CURRENT_DATE' } },
      { field: 'model_name', type: 'text', meta: { interface: 'input', required: true, width: 'half' }, schema: { is_nullable: false } },
      { field: 'total_tokens', type: 'integer', meta: { interface: 'input', width: 'quarter' }, schema: { default_value: 0 } },
      { field: 'total_cost_euros', type: 'decimal', meta: { interface: 'input', width: 'quarter' }, schema: { numeric_precision: 10, numeric_scale: 4, default_value: 0 } },
      { field: 'questions_generated', type: 'integer', meta: { interface: 'input', width: 'quarter' }, schema: { default_value: 0 } },
      { field: 'questions_approved', type: 'integer', meta: { interface: 'input', width: 'quarter' }, schema: { default_value: 0 } },
      { field: 'daily_limit_euros', type: 'decimal', meta: { interface: 'input', width: 'half' }, schema: { numeric_precision: 10, numeric_scale: 4, default_value: 5.00 } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: {
        choices: [
          { text: 'Active', value: 'active' },
          { text: 'Paused', value: 'paused' },
          { text: 'Limit Exceeded', value: 'limit_exceeded' }
        ]
      }}, schema: { default_value: 'active', length: 20 } }
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
      { field: 'id', type: 'uuid', meta: { interface: 'input-hash', readonly: true, hidden: true }, schema: { is_primary_key: true, default_value: 'gen_random_uuid()' } },
      { field: 'domain_name', type: 'string', meta: { interface: 'input', required: true, width: 'full' }, schema: { is_nullable: false, length: 255 } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: {
        choices: [
          { text: 'Published', value: 'published' },
          { text: 'Draft', value: 'draft' },
          { text: 'Archived', value: 'archived' }
        ]
      }}, schema: { default_value: 'draft', length: 50 } },
      { field: 'sort', type: 'integer', meta: { interface: 'input', hidden: true } },
      { field: 'user_created', type: 'uuid', meta: { interface: 'select-dropdown-m2o', readonly: true, hidden: true, special: ['user-created'] } },
      { field: 'date_created', type: 'timestamp', meta: { interface: 'datetime', readonly: true, hidden: true, special: ['date-created'] } },
      { field: 'user_updated', type: 'uuid', meta: { interface: 'select-dropdown-m2o', readonly: true, hidden: true, special: ['user-updated'] } },
      { field: 'date_updated', type: 'timestamp', meta: { interface: 'datetime', readonly: true, hidden: true, special: ['date-updated'] } }
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
      { field: 'id', type: 'integer', meta: { interface: 'input', readonly: true, hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } },
      { field: 'book_name', type: 'string', meta: { interface: 'input', required: true, width: 'full' }, schema: { length: 255 } },
      { field: 'authors', type: 'string', meta: { interface: 'input', width: 'half' }, schema: { length: 255 } },
      { field: 'number_of_pages', type: 'integer', meta: { interface: 'input', width: 'quarter' } },
      { field: 'domain_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', display: 'related-values', width: 'quarter' } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: {
        choices: [
          { text: 'Published', value: 'published' },
          { text: 'Draft', value: 'draft' },
          { text: 'Archived', value: 'archived' }
        ]
      }}, schema: { default_value: 'draft', length: 255 } },
      { field: 'sort', type: 'integer', meta: { interface: 'input', hidden: true } },
      { field: 'user_created', type: 'uuid', meta: { interface: 'select-dropdown-m2o', readonly: true, hidden: true, special: ['user-created'] } },
      { field: 'date_created', type: 'timestamp', meta: { interface: 'datetime', readonly: true, hidden: true, special: ['date-created'] } },
      { field: 'user_updated', type: 'uuid', meta: { interface: 'select-dropdown-m2o', readonly: true, hidden: true, special: ['user-updated'] } },
      { field: 'date_updated', type: 'timestamp', meta: { interface: 'datetime', readonly: true, hidden: true, special: ['date-updated'] } }
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
      { field: 'id', type: 'integer', meta: { interface: 'input', readonly: true, hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } },
      { field: 'chapter_name', type: 'string', meta: { interface: 'input', required: true, width: 'full' }, schema: { length: 255 } },
      { field: 'book_id', type: 'integer', meta: { interface: 'select-dropdown-m2o', display: 'related-values', required: true, width: 'half' } },
      { field: 'start_page', type: 'integer', meta: { interface: 'input', width: 'quarter' } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', width: 'quarter', options: {
        choices: [
          { text: 'Published', value: 'published' },
          { text: 'Draft', value: 'draft' },
          { text: 'Archived', value: 'archived' }
        ]
      }}, schema: { default_value: 'published', length: 255 } },
      { field: 'sort', type: 'integer', meta: { interface: 'input', hidden: true } },
      { field: 'user_created', type: 'uuid', meta: { interface: 'select-dropdown-m2o', readonly: true, hidden: true, special: ['user-created'] } },
      { field: 'date_created', type: 'timestamp', meta: { interface: 'datetime', readonly: true, hidden: true, special: ['date-created'] } },
      { field: 'user_updated', type: 'uuid', meta: { interface: 'select-dropdown-m2o', readonly: true, hidden: true, special: ['user-updated'] } },
      { field: 'date_updated', type: 'timestamp', meta: { interface: 'datetime', readonly: true, hidden: true, special: ['date-updated'] } }
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
      { field: 'id', type: 'integer', meta: { interface: 'input', readonly: true, hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } },
      { field: 'subchapter_name', type: 'string', meta: { interface: 'input', required: true, width: 'full' }, schema: { length: 255 } },
      { field: 'chapter_id', type: 'integer', meta: { interface: 'select-dropdown-m2o', display: 'related-values', required: true, width: 'half' } },
      { field: 'start_page', type: 'integer', meta: { interface: 'input', width: 'quarter' } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', width: 'quarter', options: {
        choices: [
          { text: 'Published', value: 'published' },
          { text: 'Draft', value: 'draft' },
          { text: 'Archived', value: 'archived' }
        ]
      }}, schema: { default_value: 'published', length: 255 } },
      { field: 'sort', type: 'integer', meta: { interface: 'input', hidden: true } },
      { field: 'user_created', type: 'uuid', meta: { interface: 'select-dropdown-m2o', readonly: true, hidden: true, special: ['user-created'] } },
      { field: 'date_created', type: 'timestamp', meta: { interface: 'datetime', readonly: true, hidden: true, special: ['date-created'] } },
      { field: 'user_updated', type: 'uuid', meta: { interface: 'select-dropdown-m2o', readonly: true, hidden: true, special: ['user-updated'] } },
      { field: 'date_updated', type: 'timestamp', meta: { interface: 'datetime', readonly: true, hidden: true, special: ['date-updated'] } }
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
      { field: 'id', type: 'integer', meta: { interface: 'input', readonly: true, hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } },
      { field: 'front_text', type: 'text', meta: { interface: 'input-multiline', required: true, width: 'full', note: 'Question or prompt side of the flashcard' }, schema: { is_nullable: false } },
      { field: 'back_text', type: 'text', meta: { interface: 'input-multiline', required: true, width: 'full', note: 'Answer or explanation side of the flashcard' }, schema: { is_nullable: false } },
      { field: 'explanation', type: 'text', meta: { interface: 'input-multiline', width: 'full', note: 'Additional explanation or context' } },
      { field: 'difficulty_level', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: {
        choices: [
          { text: 'Easy', value: 'easy' },
          { text: 'Medium', value: 'medium' },
          { text: 'Hard', value: 'hard' }
        ]
      }}, schema: { length: 20 } },
      { field: 'domain_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', display: 'related-values', width: 'half', note: 'Subject domain' } },
      { field: 'book_id', type: 'integer', meta: { interface: 'select-dropdown-m2o', display: 'related-values', width: 'third', note: 'Source book (optional)' } },
      { field: 'chapter_id', type: 'integer', meta: { interface: 'select-dropdown-m2o', display: 'related-values', width: 'third', note: 'Source chapter (optional)' } },
      { field: 'subchapter_id', type: 'integer', meta: { interface: 'select-dropdown-m2o', display: 'related-values', width: 'third', note: 'Source subchapter (optional)' } },
      { field: 'source_page', type: 'integer', meta: { interface: 'input', width: 'quarter', note: 'Page number from source material (optional)' } },
      { field: 'tags', type: 'json', meta: { interface: 'tags', width: 'three-quarters', note: 'Topic tags for categorization' } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: {
        choices: [
          { text: 'Published', value: 'published' },
          { text: 'Draft', value: 'draft' },
          { text: 'Archived', value: 'archived' }
        ]
      }}, schema: { default_value: 'draft', length: 255 } },
      { field: 'sort', type: 'integer', meta: { interface: 'input', hidden: true } },
      { field: 'user_created', type: 'uuid', meta: { interface: 'select-dropdown-m2o', readonly: true, hidden: true, special: ['user-created'] } },
      { field: 'date_created', type: 'timestamp', meta: { interface: 'datetime', readonly: true, hidden: true, special: ['date-created'] } },
      { field: 'user_updated', type: 'uuid', meta: { interface: 'select-dropdown-m2o', readonly: true, hidden: true, special: ['user-updated'] } },
      { field: 'date_updated', type: 'timestamp', meta: { interface: 'datetime', readonly: true, hidden: true, special: ['date-updated'] } }
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
      { field: 'id', type: 'integer', meta: { interface: 'input', readonly: true, hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } },
      { field: 'question_prompt', type: 'string', meta: { interface: 'input-multiline', required: true, width: 'full' }, schema: { length: 255 } },
      { field: 'question_type', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: {
        choices: [
          { text: 'Multiple Choice', value: 'multiple_choice' },
          { text: 'True/False', value: 'true_false' },
          { text: 'Fill in the Blank', value: 'fill_blank' }
        ]
      }}, schema: { is_nullable: false, length: 255 } },
      { field: 'difficulty_level', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: {
        choices: [
          { text: 'Easy', value: 'easy' },
          { text: 'Medium', value: 'medium' },
          { text: 'Hard', value: 'hard' }
        ]
      }}, schema: { length: 20 } },
      { field: 'explanation', type: 'text', meta: { interface: 'input-multiline', width: 'full' } },
      { field: 'selected_answers', type: 'json', meta: { interface: 'input-code', width: 'full', options: { language: 'json' } } },
      { field: 'book_id', type: 'integer', meta: { interface: 'select-dropdown-m2o', display: 'related-values', width: 'third' } },
      { field: 'chapter_id', type: 'integer', meta: { interface: 'select-dropdown-m2o', display: 'related-values', width: 'third' } },
      { field: 'subchapter_id', type: 'integer', meta: { interface: 'select-dropdown-m2o', display: 'related-values', width: 'third' } },
      { field: 'domain_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', display: 'related-values', width: 'half' } },
      { field: 'tags', type: 'json', meta: { interface: 'tags', width: 'half' } },
      { field: 'is_public', type: 'boolean', meta: { interface: 'boolean', width: 'quarter' }, schema: { default_value: true } },
      { field: 'is_free', type: 'boolean', meta: { interface: 'boolean', width: 'quarter' }, schema: { default_value: false } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: {
        choices: [
          { text: 'Published', value: 'published' },
          { text: 'Draft', value: 'draft' },
          { text: 'Archived', value: 'archived' }
        ]
      }}, schema: { default_value: 'published ', length: 255 } },
      { field: 'sort', type: 'integer', meta: { interface: 'input', hidden: true } },
      { field: 'user_created', type: 'uuid', meta: { interface: 'select-dropdown-m2o', readonly: true, hidden: true, special: ['user-created'] } },
      { field: 'date_created', type: 'timestamp', meta: { interface: 'datetime', readonly: true, hidden: true, special: ['date-created'] } },
      { field: 'user_updated', type: 'uuid', meta: { interface: 'select-dropdown-m2o', readonly: true, hidden: true, special: ['user-updated'] } },
      { field: 'date_updated', type: 'timestamp', meta: { interface: 'datetime', readonly: true, hidden: true, special: ['date-updated'] } }
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
      { field: 'id', type: 'integer', meta: { interface: 'input', readonly: true, hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } },
      { field: 'question_id', type: 'integer', meta: { interface: 'select-dropdown-m2o', display: 'related-values', required: true, width: 'half' }, schema: { is_nullable: false } },
      { field: 'text', type: 'text', meta: { interface: 'input-multiline', required: true, width: 'full' }, schema: { is_nullable: false } },
      { field: 'is_correct', type: 'boolean', meta: { interface: 'boolean', width: 'quarter' }, schema: { is_nullable: false, default_value: false } },
      { field: 'sort_order', type: 'integer', meta: { interface: 'input', width: 'quarter' } },
      { field: 'created_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' }, schema: { default_value: 'CURRENT_TIMESTAMP' } },
      { field: 'updated_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' }, schema: { default_value: 'CURRENT_TIMESTAMP' } }
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
      { field: 'id', type: 'uuid', meta: { interface: 'input-hash', readonly: true, hidden: true }, schema: { is_primary_key: true, default_value: 'gen_random_uuid()' } },
      { field: 'name', type: 'string', meta: { interface: 'input', required: true, width: 'full' }, schema: { is_nullable: false, length: 255 } },
      { field: 'user_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', display: 'related-values', required: true, width: 'half' }, schema: { is_nullable: false } },
      { field: 'settings', type: 'json', meta: { interface: 'input-code', width: 'full', options: { language: 'json' } }, schema: { is_nullable: false } },
      { field: 'is_public_template', type: 'boolean', meta: { interface: 'boolean', width: 'half' }, schema: { default_value: false } },
      { field: 'created_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' }, schema: { default_value: 'CURRENT_TIMESTAMP' } },
      { field: 'updated_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' }, schema: { default_value: 'CURRENT_TIMESTAMP' } }
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
      { field: 'id', type: 'uuid', meta: { interface: 'input-hash', readonly: true, hidden: true }, schema: { is_primary_key: true, default_value: 'gen_random_uuid()' } },
      { field: 'user_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', display: 'related-values', required: true, width: 'half' }, schema: { is_nullable: false } },
      { field: 'quiz_template_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', display: 'related-values', width: 'half' } },
      { field: 'settings_snapshot', type: 'json', meta: { interface: 'input-code', width: 'full', options: { language: 'json' } }, schema: { is_nullable: false } },
      { field: 'user_answers', type: 'json', meta: { interface: 'input-code', width: 'full', options: { language: 'json' } }, schema: { default_value: '[]' } },
      { field: 'current_question_index', type: 'integer', meta: { interface: 'input', width: 'quarter' }, schema: { default_value: 0 } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', width: 'quarter', options: {
        choices: [
          { text: 'In Progress', value: 'in_progress' },
          { text: 'Completed', value: 'completed' },
          { text: 'Abandoned', value: 'abandoned' },
          { text: 'Paused', value: 'paused' }
        ]
      }}, schema: { default_value: 'in_progress', length: 20 } },
      { field: 'score', type: 'integer', meta: { interface: 'input', width: 'quarter' } },
      { field: 'time_spent_seconds', type: 'integer', meta: { interface: 'input', width: 'quarter' } },
      { field: 'marked_for_review_question_ids', type: 'json', meta: { interface: 'input-code', width: 'full', options: { language: 'json' } }, schema: { default_value: '[]' } },
      { field: 'started_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' }, schema: { default_value: 'CURRENT_TIMESTAMP' } },
      { field: 'ended_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' } },
      { field: 'created_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' }, schema: { default_value: 'CURRENT_TIMESTAMP' } },
      { field: 'updated_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' }, schema: { default_value: 'CURRENT_TIMESTAMP' } }
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
      { field: 'id', type: 'uuid', meta: { interface: 'input-hash', readonly: true, hidden: true }, schema: { is_primary_key: true, default_value: 'gen_random_uuid()' } },
      { field: 'quiz_instance_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', display: 'related-values', required: true, width: 'half' }, schema: { is_nullable: false } },
      { field: 'question_id', type: 'integer', meta: { interface: 'select-dropdown-m2o', display: 'related-values', required: true, width: 'half' }, schema: { is_nullable: false } },
      { field: 'question_order', type: 'integer', meta: { interface: 'input', required: true, width: 'quarter' }, schema: { is_nullable: false } },
      { field: 'correct_option_ids', type: 'json', meta: { interface: 'tags', width: 'three-quarters' }, schema: { is_nullable: false, default_value: '{}' } },
      { field: 'created_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' }, schema: { default_value: 'now()' } }
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
      { field: 'id', type: 'uuid', meta: { interface: 'input-hash', readonly: true, hidden: true }, schema: { is_primary_key: true } },
      { field: 'first_name', type: 'text', meta: { interface: 'input', width: 'half' } },
      { field: 'last_name', type: 'text', meta: { interface: 'input', width: 'half' } },
      { field: 'email', type: 'text', meta: { interface: 'input', required: true, width: 'full' }, schema: { is_nullable: false, default_value: 'example@example.com' } },
      { field: 'domain_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', display: 'related-values', width: 'half' } },
      { field: 'selected_domain_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', display: 'related-values', width: 'half' } },
      { field: 'updated_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' } }
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
      { field: 'id', type: 'uuid', meta: { interface: 'input-hash', readonly: true, hidden: true }, schema: { is_primary_key: true, default_value: 'gen_random_uuid()' } },
      { field: 'user_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', display: 'related-values', required: true, width: 'full' }, schema: { is_nullable: false } },
      { field: 'enable_timer', type: 'boolean', meta: { interface: 'boolean', width: 'half' }, schema: { is_nullable: false, default_value: true } },
      { field: 'show_correct_answers', type: 'boolean', meta: { interface: 'boolean', width: 'half' }, schema: { is_nullable: false, default_value: true } },
      { field: 'randomize_questions', type: 'boolean', meta: { interface: 'boolean', width: 'half' }, schema: { is_nullable: false, default_value: true } },
      { field: 'study_reminders', type: 'boolean', meta: { interface: 'boolean', width: 'half' }, schema: { is_nullable: false, default_value: false } },
      { field: 'quiz_results', type: 'boolean', meta: { interface: 'boolean', width: 'half' }, schema: { is_nullable: false, default_value: true } },
      { field: 'theme', type: 'string', meta: { interface: 'select-dropdown', width: 'quarter', options: {
        choices: [
          { text: 'System', value: 'system' },
          { text: 'Light', value: 'light' },
          { text: 'Dark', value: 'dark' }
        ]
      }}, schema: { is_nullable: false, default_value: 'system', length: 20 } },
      { field: 'language', type: 'string', meta: { interface: 'select-dropdown', width: 'quarter', options: {
        choices: [
          { text: 'English', value: 'en' },
          { text: 'Romanian', value: 'ro' }
        ]
      }}, schema: { is_nullable: false, default_value: 'en', length: 10 } },
      { field: 'created_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' }, schema: { default_value: 'CURRENT_TIMESTAMP' } },
      { field: 'updated_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' }, schema: { default_value: 'CURRENT_TIMESTAMP' } }
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
      { field: 'id', type: 'uuid', meta: { interface: 'input-hash', readonly: true, hidden: true }, schema: { is_primary_key: true, default_value: 'gen_random_uuid()' } },
      { field: 'user_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', display: 'related-values', required: true, width: 'half' }, schema: { is_nullable: false } },
      { field: 'domain_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', display: 'related-values', required: true, width: 'half' }, schema: { is_nullable: false } },
      { field: 'stripe_subscription_id', type: 'string', meta: { interface: 'input', required: true, width: 'half' }, schema: { is_nullable: false, length: 255 } },
      { field: 'stripe_customer_id', type: 'string', meta: { interface: 'input', required: true, width: 'half' }, schema: { is_nullable: false, length: 255 } },
      { field: 'stripe_price_id', type: 'string', meta: { interface: 'input', width: 'half' }, schema: { length: 255 } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: {
        choices: [
          { text: 'Active', value: 'active' },
          { text: 'Canceled', value: 'canceled' },
          { text: 'Incomplete', value: 'incomplete' },
          { text: 'Incomplete Expired', value: 'incomplete_expired' },
          { text: 'Past Due', value: 'past_due' },
          { text: 'Trialing', value: 'trialing' },
          { text: 'Unpaid', value: 'unpaid' }
        ]
      }}, schema: { is_nullable: false, length: 50 } },
      { field: 'current_period_start', type: 'timestamp', meta: { interface: 'datetime', width: 'half' }, schema: { is_nullable: false } },
      { field: 'current_period_end', type: 'timestamp', meta: { interface: 'datetime', width: 'half' }, schema: { is_nullable: false } },
      { field: 'cancel_at_period_end', type: 'boolean', meta: { interface: 'boolean', width: 'quarter' }, schema: { default_value: false } },
      { field: 'canceled_at', type: 'timestamp', meta: { interface: 'datetime', width: 'quarter' } },
      { field: 'trial_start', type: 'timestamp', meta: { interface: 'datetime', width: 'quarter' } },
      { field: 'trial_end', type: 'timestamp', meta: { interface: 'datetime', width: 'quarter' } },
      { field: 'metadata', type: 'json', meta: { interface: 'input-code', width: 'full', options: { language: 'json' } }, schema: { default_value: '{}' } },
      { field: 'created_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' }, schema: { default_value: 'CURRENT_TIMESTAMP' } },
      { field: 'updated_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' }, schema: { default_value: 'CURRENT_TIMESTAMP' } }
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
      { field: 'id', type: 'integer', meta: { interface: 'input', readonly: true, hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', width: 'half', options: {
        choices: [
          { text: 'Published', value: 'published' },
          { text: 'Draft', value: 'draft' },
          { text: 'Archived', value: 'archived' }
        ]
      }}, schema: { default_value: 'draft', length: 255 } },
      { field: 'is_public', type: 'string', meta: { interface: 'boolean', width: 'half' }, schema: { default_value: 'false', length: 255 } },
      { field: 'user_created', type: 'uuid', meta: { interface: 'select-dropdown-m2o', readonly: true, hidden: true, special: ['user-created'] } },
      { field: 'date_created', type: 'timestamp', meta: { interface: 'datetime', readonly: true, hidden: true, special: ['date-created'] } },
      { field: 'user_updated', type: 'uuid', meta: { interface: 'select-dropdown-m2o', readonly: true, hidden: true, special: ['user-updated'] } },
      { field: 'date_updated', type: 'timestamp', meta: { interface: 'datetime', readonly: true, hidden: true, special: ['date-updated'] } }
    ]
  }
};

async function createCollectionsFromScratch() {
  console.log('🚀 Creating Directus collections from scratch (with database tables)...\n');
  
  try {
    // Get existing collections to avoid duplicates
    const existingCollections = await directus.request(readCollections());
    const existingCollectionNames = existingCollections.map(c => c.collection);
    
    let createdCollections = 0;
    let skippedCollections = 0;
    
    for (const [collectionName, config] of Object.entries(collectionsToCreate)) {
      console.log(`📋 Processing collection: ${collectionName}`);
      
      if (existingCollectionNames.includes(collectionName)) {
        console.log(`  ⏭️  Collection already exists: ${collectionName}`);
        skippedCollections++;
        continue;
      }
      
      try {
        console.log(`  ➕ Creating collection and database table: ${collectionName}`);
        
        // Create collection with basic metadata first
        await directus.request(createCollection({
          collection: collectionName,
          icon: config.icon,
          note: config.note,
          color: config.color,
          display_template: config.display_template,
          sort_field: config.sort_field
        }));
        
        // Create each field individually (this creates the database columns)
        for (const fieldConfig of config.fields) {
          console.log(`    🔧 Creating field: ${fieldConfig.field}`);
          
          await directus.request(createField(collectionName, {
            field: fieldConfig.field,
            type: fieldConfig.type,
            meta: fieldConfig.meta,
            schema: fieldConfig.schema
          }));
        }
        
        createdCollections++;
        console.log(`  ✅ Created collection: ${collectionName} with ${config.fields.length} fields`);
        
      } catch (error) {
        console.error(`  ❌ Failed to create collection ${collectionName}:`, error.message);
        if (error.errors) {
          error.errors.forEach(err => console.error('    -', err.message));
        }
      }
      
      console.log(''); // Add spacing
    }
    
    // Summary
    console.log('🎉 Bootstrap from scratch completed!');
    console.log(`📊 Summary:`);
    console.log(`   • Collections created: ${createdCollections}`);
    console.log(`   • Collections skipped (already exist): ${skippedCollections}`);
    console.log(`   • Total collections processed: ${Object.keys(collectionsToCreate).length}`);
    
    if (createdCollections > 0) {
      console.log('\n✨ Created complete Grile.ro platform with database tables:');
      console.log('   🤖 AI Question Generation & Review System');
      console.log('   📚 Content Management (Domains → Books → Chapters → Subchapters)');
      console.log('   ❓ Question & Answer Management');
      console.log('   🎯 Quiz Templates & Instance System');
      console.log('   🎴 Flashcard System for Spaced Repetition');
      console.log('   👤 User Profiles & Settings');
      console.log('   💳 Subscription Management');
      console.log('   📦 Legacy Quiz System');
      
      console.log('\n📝 You can now:');
      console.log('   1. Refresh your Directus admin interface');
      console.log('   2. Start adding content to your collections');
      console.log('   3. Test the AI question review workflow');
      console.log('   4. Set up relationships between collections if needed');
    }
    
  } catch (error) {
    console.error('❌ Bootstrap failed:', error.message);
    if (error.errors) {
      error.errors.forEach(err => console.error('  -', err.message));
    }
    process.exit(1);
  }
}

// Run the bootstrap
createCollectionsFromScratch();