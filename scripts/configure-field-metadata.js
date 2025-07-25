#!/usr/bin/env node

/**
 * Directus Field Metadata Configuration
 * 
 * Configures field-level metadata for all collections to fix the
 * "database only: click to configure" issue in Directus admin.
 * 
 * This sets up proper interfaces, validation, and display options
 * for each field in each collection.
 */

import { createDirectus, staticToken, rest } from '@directus/sdk';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const directus = createDirectus(process.env.PUBLIC_URL || 'http://localhost:8055')
  .with(rest());

// Field configurations for each collection
const fieldConfigurations = {
  domains: {
    id: { interface: 'input-hash', readonly: true, hidden: true },
    domain_name: { interface: 'input', required: true, width: 'full' },
    status: { 
      interface: 'select-dropdown', 
      width: 'half',
      options: {
        choices: [
          { text: 'Published', value: 'published' },
          { text: 'Draft', value: 'draft' },
          { text: 'Archived', value: 'archived' }
        ]
      }
    },
    sort: { interface: 'input', hidden: true },
    user_created: { interface: 'select-dropdown-m2o', readonly: true, hidden: true, special: ['user-created'] },
    date_created: { interface: 'datetime', readonly: true, hidden: true, special: ['date-created'] },
    user_updated: { interface: 'select-dropdown-m2o', readonly: true, hidden: true, special: ['user-updated'] },
    date_updated: { interface: 'datetime', readonly: true, hidden: true, special: ['date-updated'] }
  },
  
  books: {
    id: { interface: 'input', readonly: true, hidden: true },
    book_name: { interface: 'input', required: true, width: 'full' },
    authors: { interface: 'input', width: 'half' },
    number_of_pages: { interface: 'input', width: 'quarter' },
    domain_id: { interface: 'select-dropdown-m2o', display: 'related-values', width: 'quarter' },
    status: { 
      interface: 'select-dropdown', 
      width: 'half',
      options: {
        choices: [
          { text: 'Published', value: 'published' },
          { text: 'Draft', value: 'draft' },
          { text: 'Archived', value: 'archived' }
        ]
      }
    },
    sort: { interface: 'input', hidden: true },
    user_created: { interface: 'select-dropdown-m2o', readonly: true, hidden: true, special: ['user-created'] },
    date_created: { interface: 'datetime', readonly: true, hidden: true, special: ['date-created'] },
    user_updated: { interface: 'select-dropdown-m2o', readonly: true, hidden: true, special: ['user-updated'] },
    date_updated: { interface: 'datetime', readonly: true, hidden: true, special: ['date-updated'] }
  },
  
  chapters: {
    id: { interface: 'input', readonly: true, hidden: true },
    chapter_name: { interface: 'input', required: true, width: 'full' },
    book_id: { interface: 'select-dropdown-m2o', display: 'related-values', required: true, width: 'half' },
    start_page: { interface: 'input', width: 'quarter' },
    status: { 
      interface: 'select-dropdown', 
      width: 'quarter',
      options: {
        choices: [
          { text: 'Published', value: 'published' },
          { text: 'Draft', value: 'draft' },
          { text: 'Archived', value: 'archived' }
        ]
      }
    },
    sort: { interface: 'input', hidden: true },
    user_created: { interface: 'select-dropdown-m2o', readonly: true, hidden: true, special: ['user-created'] },
    date_created: { interface: 'datetime', readonly: true, hidden: true, special: ['date-created'] },
    user_updated: { interface: 'select-dropdown-m2o', readonly: true, hidden: true, special: ['user-updated'] },
    date_updated: { interface: 'datetime', readonly: true, hidden: true, special: ['date-updated'] }
  },
  
  subchapters: {
    id: { interface: 'input', readonly: true, hidden: true },
    subchapter_name: { interface: 'input', required: true, width: 'full' },
    chapter_id: { interface: 'select-dropdown-m2o', display: 'related-values', width: 'half' },
    start_page: { interface: 'input', width: 'quarter' },
    status: { 
      interface: 'select-dropdown', 
      width: 'quarter',
      options: {
        choices: [
          { text: 'Published', value: 'published' },
          { text: 'Draft', value: 'draft' },
          { text: 'Archived', value: 'archived' }
        ]
      }
    },
    sort: { interface: 'input', hidden: true },
    user_created: { interface: 'select-dropdown-m2o', readonly: true, hidden: true, special: ['user-created'] },
    date_created: { interface: 'datetime', readonly: true, hidden: true, special: ['date-created'] },
    user_updated: { interface: 'select-dropdown-m2o', readonly: true, hidden: true, special: ['user-updated'] },
    date_updated: { interface: 'datetime', readonly: true, hidden: true, special: ['date-updated'] }
  },
  
  questions: {
    id: { interface: 'input', readonly: true, hidden: true },
    question_prompt: { interface: 'input-multiline', required: true, width: 'full' },
    question_type: { 
      interface: 'select-dropdown', 
      width: 'half',
      options: {
        choices: [
          { text: 'Single Choice', value: 'single_choice' },
          { text: 'Multiple Choice', value: 'multiple_choice' },
          { text: 'True/False', value: 'true_false' }
        ]
      }
    },
    selected_answers: { interface: 'input-code', width: 'half', options: { language: 'json' } },
    explanation: { interface: 'input-multiline', width: 'full' },
    book_id: { interface: 'select-dropdown-m2o', display: 'related-values', width: 'third' },
    chapter_id: { interface: 'select-dropdown-m2o', display: 'related-values', width: 'third' },
    subchapter_id: { interface: 'select-dropdown-m2o', display: 'related-values', width: 'third' },
    domain_id: { interface: 'select-dropdown-m2o', display: 'related-values', width: 'half' },
    difficulty_level: { 
      interface: 'select-dropdown', 
      width: 'quarter',
      options: {
        choices: [
          { text: 'Easy', value: 'easy' },
          { text: 'Medium', value: 'medium' },
          { text: 'Hard', value: 'hard' }
        ]
      }
    },
    tags: { interface: 'tags', width: 'quarter' },
    is_public: { interface: 'boolean', width: 'quarter' },
    is_free: { interface: 'boolean', width: 'quarter' },
    status: { 
      interface: 'select-dropdown', 
      width: 'half',
      options: {
        choices: [
          { text: 'Published', value: 'published' },
          { text: 'Draft', value: 'draft' },
          { text: 'Archived', value: 'archived' }
        ]
      }
    },
    sort: { interface: 'input', hidden: true },
    user_created: { interface: 'select-dropdown-m2o', readonly: true, hidden: true, special: ['user-created'] },
    date_created: { interface: 'datetime', readonly: true, hidden: true, special: ['date-created'] },
    user_updated: { interface: 'select-dropdown-m2o', readonly: true, hidden: true, special: ['user-updated'] },
    date_updated: { interface: 'datetime', readonly: true, hidden: true, special: ['date-updated'] }
  },
  
  answer_options: {
    id: { interface: 'input', readonly: true, hidden: true },
    question_id: { interface: 'select-dropdown-m2o', display: 'related-values', required: true, width: 'half' },
    text: { interface: 'input-multiline', required: true, width: 'full' },
    is_correct: { interface: 'boolean', width: 'quarter' },
    sort_order: { interface: 'input', width: 'quarter' },
    created_at: { interface: 'datetime', readonly: true, width: 'half' },
    updated_at: { interface: 'datetime', readonly: true, width: 'half' }
  },
  
  ai_question_staging: {
    id: { interface: 'input', readonly: true, hidden: true },
    question_prompt: { interface: 'input-multiline', required: true, width: 'full' },
    question_type: { 
      interface: 'select-dropdown', 
      width: 'half',
      options: {
        choices: [
          { text: 'Single Choice', value: 'single_choice_single_answer' },
          { text: 'Multiple Choice', value: 'multiple_answers' },
          { text: 'True/False', value: 'true_false' }
        ]
      }
    },
    difficulty_level: { 
      interface: 'select-dropdown', 
      width: 'half',
      options: {
        choices: [
          { text: 'Easy', value: 'easy' },
          { text: 'Medium', value: 'medium' },
          { text: 'Hard', value: 'hard' }
        ]
      }
    },
    explanation: { interface: 'input-multiline', width: 'full' },
    source_book_id: { interface: 'select-dropdown-m2o', display: 'related-values', width: 'third' },
    source_chapter_id: { interface: 'select-dropdown-m2o', display: 'related-values', width: 'third' },
    source_subchapter_id: { interface: 'select-dropdown-m2o', display: 'related-values', width: 'third' },
    domain_id: { interface: 'select-dropdown-m2o', display: 'related-values', width: 'half' },
    source_page: { interface: 'input', width: 'quarter' },
    source_text: { interface: 'input-multiline', width: 'full' },
    ai_model: { interface: 'input', readonly: true, width: 'half' },
    generation_cost_tokens: { interface: 'input', readonly: true, width: 'quarter' },
    generation_cost_euros: { interface: 'input', readonly: true, width: 'quarter' },
    generation_prompt: { interface: 'input-multiline', readonly: true, width: 'full' },
    status: { 
      interface: 'select-dropdown', 
      width: 'half',
      options: {
        choices: [
          { text: 'Pending Review', value: 'pending_review' },
          { text: 'Approved', value: 'approved' },
          { text: 'Declined', value: 'declined' },
          { text: 'Needs Revision', value: 'needs_revision' }
        ]
      }
    },
    review_notes: { interface: 'input-multiline', width: 'full' },
    reviewed_by: { interface: 'select-dropdown-m2o', display: 'related-values', readonly: true, width: 'half' },
    reviewed_at: { interface: 'datetime', readonly: true, width: 'half' },
    created_at: { interface: 'datetime', readonly: true, width: 'half' },
    updated_at: { interface: 'datetime', readonly: true, width: 'half' }
  }
};

async function configureFieldMetadata() {
  console.log('🔧 Configuring field metadata to remove "database only" warnings...\n');
  
  try {
    // Get access token
    console.log('🔑 Getting access token...');
    const authResponse = await fetch(`${process.env.PUBLIC_URL || 'http://localhost:8055'}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      })
    });
    
    const authData = await authResponse.json();
    if (!authData.data?.access_token) {
      throw new Error('Failed to get access token: ' + JSON.stringify(authData));
    }
    
    console.log('✅ Authentication successful!\n');
    
    let updatedFields = 0;
    let skippedFields = 0;
    
    // Configure fields for each collection
    for (const [collectionName, fields] of Object.entries(fieldConfigurations)) {
      console.log(`🔧 Configuring fields for collection: ${collectionName}`);
      
      for (const [fieldName, fieldConfig] of Object.entries(fields)) {
        try {
          const updateResponse = await fetch(`${process.env.PUBLIC_URL || 'http://localhost:8055'}/fields/${collectionName}/${fieldName}`, {
            method: 'PATCH',
            headers: { 
              'Authorization': `Bearer ${authData.data.access_token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(fieldConfig)
          });
          
          if (updateResponse.ok) {
            updatedFields++;
            console.log(`  ✅ Updated field: ${fieldName}`);
          } else {
            const errorData = await updateResponse.json();
            console.log(`  ⚠️  Skipped field ${fieldName}:`, errorData.errors?.[0]?.message || 'Unknown error');
            skippedFields++;
          }
          
        } catch (error) {
          console.error(`  ❌ Error updating field ${fieldName}:`, error.message);
          skippedFields++;
        }
      }
      
      console.log(''); // Add spacing
    }
    
    // Summary
    console.log('🎉 Field metadata configuration completed!');
    console.log(`📊 Summary:`);
    console.log(`   • Fields updated: ${updatedFields}`);
    console.log(`   • Fields skipped: ${skippedFields}`);
    console.log(`   • Collections processed: ${Object.keys(fieldConfigurations).length}`);
    
    if (updatedFields > 0) {
      console.log('\n✨ Field metadata configured successfully:');
      console.log('   🔧 Proper interfaces assigned');
      console.log('   ✅ Validation rules set');
      console.log('   🎨 Display options configured');
      console.log('   📝 No more "database only" warnings');
      
      console.log('\n🚀 Next steps:');
      console.log('   1. Refresh Directus admin interface');
      console.log('   2. Check Data Model in Settings');
      console.log('   3. All fields should now be properly configured');
    }
    
  } catch (error) {
    console.error('❌ Field metadata configuration failed:', error.message);
    if (error.errors) {
      error.errors.forEach(err => console.error('  -', err.message));
    }
    process.exit(1);
  }
}

// Run the field metadata configuration
configureFieldMetadata();