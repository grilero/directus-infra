#!/usr/bin/env node

/**
 * Analyze Duplicate Collections
 * 
 * This script analyzes your database to identify duplicate collections
 * and suggests a cleanup strategy.
 * 
 * Usage: node analyze-duplicates.js
 */

import { createDirectus, staticToken, rest, readCollections } from '@directus/sdk';
import 'dotenv/config';

const directus = createDirectus(process.env.PUBLIC_URL || 'http://localhost:8055')
  .with(staticToken(process.env.DIRECTUS_ADMIN_TOKEN))
  .with(rest());

async function analyzeDuplicates() {
  console.log('🔍 Analyzing duplicate collections...\n');
  
  try {
    const collections = await directus.request(readCollections());
    const userCollections = collections.filter(c => !c.collection.startsWith('directus_'));
    
    // Group collections by lowercase name to find duplicates
    const grouped = {};
    userCollections.forEach(collection => {
      const key = collection.collection.toLowerCase();
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(collection);
    });
    
    // Find duplicates
    const duplicates = Object.entries(grouped).filter(([key, collections]) => collections.length > 1);
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate collections found!');
      return;
    }
    
    console.log(`🚨 Found ${duplicates.length} sets of duplicate collections:\n`);
    
    for (const [baseName, collections] of duplicates) {
      console.log(`📋 ${baseName}:`);
      for (const collection of collections) {
        console.log(`   - ${collection.collection} (${collection.meta?.note || 'no description'})`);
        
        // Try to get record count (this might fail for some collections)
        try {
          const response = await fetch(`${process.env.PUBLIC_URL}/items/${collection.collection}`, {
            headers: {
              'Authorization': `Bearer ${process.env.DIRECTUS_ADMIN_TOKEN}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            console.log(`     └─ Records: ${data.data?.length || 0}`);
          }
        } catch (e) {
          console.log(`     └─ Records: Unable to count`);
        }
      }
      console.log();
    }
    
    console.log('🛠️  RECOMMENDED CLEANUP STRATEGY:\n');
    console.log('1. Keep the Directus-created collections (capitalized names)');
    console.log('2. Migrate any data from lowercase collections to capitalized ones');
    console.log('3. Delete the lowercase collections');
    console.log('4. Use the bootstrap script only for missing collections\n');
    
    console.log('⚠️  BEFORE CLEANUP:');
    console.log('1. Backup your database');
    console.log('2. Export any important data from lowercase collections');
    console.log('3. Test in a development environment first');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

analyzeDuplicates();