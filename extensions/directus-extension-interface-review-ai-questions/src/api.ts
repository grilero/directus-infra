import { Directus } from '@directus/sdk';

const directus = new Directus(window.location.origin + '/');

export async function acceptQuestion(id: number, reviewUser: string) {
  return directus.rpc('accept_ai_question', { p_question_id: id, p_user: reviewUser });
}

export async function declineQuestion(id: number, reviewUser: string, reason: string) {
  return directus.rpc('decline_ai_question', { p_question_id: id, p_user: reviewUser, p_reason: reason });
} 