<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { acceptQuestion, declineQuestion } from './api';
import { Directus } from '@directus/sdk';

interface AIQuestion {
  id: number;
  question_prompt: string;
  explanation: string | null;
  difficulty_level: string | null;
  answer_options: {
    id: number;
    option_text: string;
    is_correct: boolean;
  }[];
}

const questions = ref<AIQuestion[]>([]);
const expanded = ref<number | null>(null);
const directus = new Directus(window.location.origin + '/');

async function fetchQuestions() {
  const { data } = await directus.items('ai_question_staging').readByQuery({
    filter: { status: { _eq: 'pending_review' } },
    fields: ['*', {
      answer_options: ['id', 'option_text', 'is_correct']
    }]
  });
  questions.value = data as AIQuestion[];
}

async function onAccept(id: number) {
  await acceptQuestion(id, (await directus.auth.me()).id);
  await fetchQuestions();
}

async function onDecline(id: number) {
  const reason = prompt('Reason for decline?');
  if (!reason) return;
  await declineQuestion(id, (await directus.auth.me()).id, reason);
  await fetchQuestions();
}

onMounted(fetchQuestions);
</script>

<template>
  <div class="ai-review-list">
    <h2>AI-Generated Questions Pending Review</h2>

    <div v-for="q in questions" :key="q.id" class="card">
      <div class="card-header" @click="expanded = expanded === q.id ? null : q.id">
        #{{ q.id }} – {{ q.question_prompt.substring(0, 80) }}
      </div>

      <div v-if="expanded === q.id" class="card-body">
        <p><strong>Explanation:</strong> {{ q.explanation }}</p>
        <ul>
          <li v-for="opt in q.answer_options" :key="opt.id"
              :class="{ correct: opt.is_correct }">
            {{ opt.option_text }}
          </li>
        </ul>
        <button @click="onAccept(q.id)">Accept</button>
        <button @click="onDecline(q.id)">Decline</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 8px;
}
.card-header {
  padding: 8px 12px;
  background: #f7f7f7;
  cursor: pointer;
}
.card-body {
  padding: 12px;
}
.correct {
  background: #e6ffed;
}
</style> 