#!/usr/bin/env node

/**
 * Directus Metadata Bootstrap
 * 
 * Adds Directus metadata to collections created via SQL.
 * This makes SQL-created tables fully functional in Directus with proper UI elements.
 */

import { createDirectus, staticToken, rest } from '@directus/sdk';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const directus = createDirectus(process.env.PUBLIC_URL || 'http://localhost:8055')
  .with(rest());

// Collection metadata configurations
const collectionsMetadata = {
  domains: {
    icon: 'domain',
    note: 'Subject domains (Medicină Dentară, Medicină Generală)',
    color: '#9C27B0',
    display_template: '{{domain_name}}',
    sort_field: 'sort'
  },
  books: {
    icon: 'menu_book',
    note: 'Medical textbooks and educational resources',
    color: '#2196F3',
    display_template: '{{book_name}} by {{authors}}',
    sort_field: 'sort'
  },
  chapters: {
    icon: 'article',
    note: 'Book chapters organization',
    color: '#2196F3',
    display_template: '{{chapter_name}}',
    sort_field: 'sort'
  },
  subchapters: {
    icon: 'format_list_numbered',
    note: 'Sub-organization within chapters',
    color: '#2196F3',
    display_template: '{{subchapter_name}}',
    sort_field: 'sort'
  },
  questions: {
    icon: 'help',
    note: 'Published questions for quizzes and assessments',
    color: '#4CAF50',
    display_template: '{{question_prompt}}',
    sort_field: 'sort'
  },
  answer_options: {
    icon: 'radio_button_checked',
    note: 'Answer options for published questions',
    color: '#4CAF50',
    display_template: '{{text}}',
    sort_field: 'sort_order'
  },
  ai_question_staging: {
    icon: 'psychology',
    note: 'AI-generated questions awaiting review and approval',
    color: '#FF9800',
    display_template: '{{question_prompt}}',
    sort_field: 'created_at'
  },
  ai_answer_options_staging: {
    icon: 'quiz',
    note: 'Answer options for AI-generated questions',
    color: '#FF9800',
    display_template: '{{option_text}}',
    sort_field: 'option_order'
  },
  ai_generation_costs: {
    icon: 'analytics',
    note: 'Daily AI generation costs and usage tracking',
    color: '#4CAF50',
    display_template: '{{date}} - {{model_name}} (€{{total_cost_euros}})',
    sort_field: 'date'
  },
  flashcards: {
    icon: 'quiz',
    note: 'Flashcard content for spaced repetition learning',
    color: '#9C27B0',
    display_template: '{{front_text}}',
    sort_field: 'sort'
  },
  profiles: {
    icon: 'person',
    note: 'User profile information',
    color: '#607D8B',
    display_template: '{{first_name}} {{last_name}} ({{email}})',
    sort_field: 'updated_at'
  },
  quiz_instances: {
    icon: 'quiz',
    note: 'Individual quiz attempts by users',
    color: '#FF5722',
    display_template: 'Quiz {{id}} - {{status}}',
    sort_field: 'started_at'
  },
  quiz_templates: {
    icon: 'assignment',
    note: 'Reusable quiz configurations and templates',
    color: '#FF5722',
    display_template: '{{name}}',
    sort_field: 'created_at'
  },
  quiz_instance_questions: {
    icon: 'list_alt',
    note: 'Questions within quiz instances with order and answers',
    color: '#FF5722',
    display_template: 'Question {{question_order}}',
    sort_field: 'question_order'
  },
  quizzes: {
    icon: 'list_alt',
    note: 'Legacy quiz table for backward compatibility',
    color: '#E91E63',
    display_template: 'Legacy Quiz {{id}}',
    sort_field: 'date_created'
  },
  subscriptions: {
    icon: 'payment',
    note: 'Stripe subscription management',
    color: '#795548',
    display_template: '{{stripe_subscription_id}} - {{status}}',
    sort_field: 'created_at'
  },
  user_settings: {
    icon: 'settings',
    note: 'User preferences and configuration',
    color: '#607D8B',
    display_template: 'Settings for {{user_id}}',
    sort_field: 'updated_at'
  },
  test: {
    icon: 'science',
    note: 'Test collection for development purposes',
    color: '#9E9E9E',
    display_template: 'Test {{id}}',
    sort_field: 'id'
  }
};

async function addDirectusMetadata() {
  console.log('🎨 Adding Directus metadata to SQL-created collections...\n');
  
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
    
    // Configure directus with static token
    const authenticatedDirectus = createDirectus(process.env.PUBLIC_URL || 'http://localhost:8055')
      .with(staticToken(authData.data.access_token))
      .with(rest());
    
    console.log('✅ Authentication successful!\n');
    
    // Get all collections to see which ones exist
    const response = await fetch(`${process.env.PUBLIC_URL || 'http://localhost:8055'}/collections`, {
      headers: { 'Authorization': `Bearer ${authData.data.access_token}` }
    });
    const collectionsData = await response.json();
    const existingCollections = collectionsData.data.map(c => c.collection);
    
    let updatedCollections = 0;
    let skippedCollections = 0;
    
    // Update metadata for each collection
    for (const [collectionName, metadata] of Object.entries(collectionsMetadata)) {
      console.log(`🎨 Processing collection: ${collectionName}`);
      
      if (!existingCollections.includes(collectionName)) {
        console.log(`  ⏭️  Collection does not exist: ${collectionName}`);
        skippedCollections++;
        continue;
      }
      
      try {
        // Update collection metadata
        const updateResponse = await fetch(`${process.env.PUBLIC_URL || 'http://localhost:8055'}/collections/${collectionName}`, {
          method: 'PATCH',
          headers: { 
            'Authorization': `Bearer ${authData.data.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            meta: {
              collection: collectionName,
              icon: metadata.icon,
              note: metadata.note,
              color: metadata.color,
              display_template: metadata.display_template,
              sort_field: metadata.sort_field,
              hidden: false,
              singleton: false,
              archive_app_filter: true,
              accountability: 'all',
              collapse: 'open',
              versioning: false
            }
          })
        });
        
        if (updateResponse.ok) {
          updatedCollections++;
          console.log(`  ✅ Updated metadata for: ${collectionName}`);
        } else {
          const errorData = await updateResponse.json();
          console.log(`  ⚠️  Failed to update ${collectionName}:`, errorData.errors?.[0]?.message || 'Unknown error');
        }
        
      } catch (error) {
        console.error(`  ❌ Error updating collection ${collectionName}:`, error.message);
      }
      
      console.log(''); // Add spacing
    }
    
    // Summary
    console.log('🎉 Metadata bootstrap completed!');
    console.log(`📊 Summary:`);
    console.log(`   • Collections updated: ${updatedCollections}`);
    console.log(`   • Collections skipped (not found): ${skippedCollections}`);
    console.log(`   • Total collections processed: ${Object.keys(collectionsMetadata).length}`);
    
    if (updatedCollections > 0) {
      console.log('\n✨ All collections now have proper Directus metadata:');
      console.log('   🎨 Icons, colors, and display templates');
      console.log('   📝 Notes and descriptions');
      console.log('   📋 Sort fields configured');
      console.log('   🔧 Ready for use in Directus admin interface');
      
      console.log('\n🚀 Next steps:');
      console.log('   1. Access Directus admin interface at http://localhost:8055');
      console.log('   2. Verify all collections appear with proper styling');
      console.log('   3. Test the AI question review layout');
      console.log('   4. Add sample data as needed');
    }
    
  } catch (error) {
    console.error('❌ Metadata bootstrap failed:', error.message);
    if (error.errors) {
      error.errors.forEach(err => console.error('  -', err.message));
    }
    process.exit(1);
  }
}

// Run the metadata bootstrap
addDirectusMetadata();