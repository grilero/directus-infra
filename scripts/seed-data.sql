-- Seed Data for Fresh Grile.ro Database
-- This file contains all existing data to populate a fresh database
-- Run this AFTER running the fresh-bootstrap.js script

-- ============================================
-- DOMAINS
-- ============================================

INSERT INTO domains (id, domain_name, status, sort, user_created, date_created, user_updated, date_updated) VALUES
('9524c5c4-b831-4695-8d20-9445c688f678', 'Medicină Dentară - Rezidențiat', 'published', NULL, NULL, '2025-06-29 13:26:38.831947+00', NULL, '2025-06-29 13:26:38.831947+00'),
('e2ac9b1d-ec84-4fc9-9648-78df8446924b', 'Medicină Generală - Rezidențiat', 'published', NULL, NULL, '2025-06-29 13:26:38.831947+00', NULL, '2025-06-29 13:26:38.831947+00');

-- ============================================
-- BOOKS
-- ============================================

INSERT INTO books (id, status, sort, user_created, date_created, user_updated, date_updated, authors, number_of_pages, book_name, domain_id) VALUES
(5, 'published', 1, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2024-11-11 19:15:24.615+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 20:59:39.55+00', 'PROF. DR. ECATERINA IONESCU ', 366, 'Manual pentru rezidențiat - Volumul I', '9524c5c4-b831-4695-8d20-9445c688f678'),
(6, 'published', 2, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2024-11-11 19:24:59.969+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 20:55:33.315+00', 'PROF. D R . ECATERINA JONESCU', 308, 'Manual pentru rezidențiat - Volumul II', '9524c5c4-b831-4695-8d20-9445c688f678'),
(8, 'published', 1, NULL, '2025-06-29 13:24:17.86013+00', NULL, '2025-06-29 13:24:17.86013+00', 'Adam Feather, David Randall, Mona Waterhouse', NULL, 'Kumar și Clark Medicină Clinică', 'e2ac9b1d-ec84-4fc9-9648-78df8446924b'),
(9, 'published', 2, NULL, '2025-06-29 13:24:17.86013+00', NULL, '2025-06-29 13:24:17.86013+00', 'Peter F. Lawrence', NULL, 'Chirurgie generală și specialități chirurgicale', 'e2ac9b1d-ec84-4fc9-9648-78df8446924b'),
(10, 'published', 3, NULL, '2025-06-29 13:24:17.86013+00', NULL, '2025-06-29 13:24:17.86013+00', 'Latha Ganti, David Lebowitz, Javier Rosario, Ariel Vera', NULL, 'Sinopsis de medicină', 'e2ac9b1d-ec84-4fc9-9648-78df8446924b');

-- ============================================
-- CHAPTERS
-- ============================================

INSERT INTO chapters (id, status, sort, user_created, date_created, user_updated, date_updated, chapter_name, book_id, start_page) VALUES
(2, 'published', 1, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2024-11-11 19:15:37.39+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 20:58:57.962+00', '1. ODONTOTERAPIE', 5, NULL),
(3, 'published', 2, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2024-11-11 19:15:46.468+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 20:58:57.962+00', '2. ENDODONȚIE', 5, NULL),
(4, 'published', 3, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2024-11-11 19:15:57.409+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 20:58:57.962+00', '3. PROTETICĂ DENTARĂ', 5, NULL),
(5, 'published', 4, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2024-11-11 19:17:22.438+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 20:58:57.962+00', '4. PARODONTOLOGIE', 5, NULL),
(6, 'published', 5, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2024-11-11 19:27:56.546+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 20:59:06.7+00', '5. PEDODONȚIE', 6, NULL),
(7, 'published', 6, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2024-11-11 19:28:29.634+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 20:59:06.7+00', '6. ORTODONȚIE ȘI ORTOPEDIE DENTO-FACIALĂ', 6, NULL),
(8, 'published', 7, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2024-11-11 19:28:46.44+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 20:59:06.7+00', '7. CHIRURGIE ORO-MAXILO-FACIALĂ', 6, NULL),
(18, 'published', 1, NULL, NULL, NULL, NULL, 'CAP. 8 - SEPSISUL ȘI TRATAMENTUL INFECȚIILOR BACTERIENE', 8, NULL),
(19, 'published', 2, NULL, NULL, NULL, NULL, 'CAP. 9 - ECHILIBRUL HIDRO-ELECTROLITIC ȘI ACIDO-BAZIC', 8, NULL),
(20, 'published', 3, NULL, NULL, NULL, NULL, 'CAP. 10 - TERAPIE INTENSIVĂ', 8, NULL),
(21, 'published', 4, NULL, NULL, NULL, NULL, 'CAP. 16 - HEMATOLOGIE', 8, NULL),
(22, 'published', 5, NULL, NULL, NULL, NULL, 'CAP. 18 - REUMATOLOGIE', 8, NULL),
(23, 'published', 6, NULL, NULL, NULL, NULL, 'CAP. 21 - ENDOCRINOLOGIE', 8, NULL),
(24, 'published', 7, NULL, NULL, NULL, NULL, 'CAP. 23 - DIABETUL ZAHARAT', 8, NULL),
(25, 'published', 8, NULL, NULL, NULL, NULL, 'CAP. 26 - NEUROLOGIE', 8, NULL),
(26, 'published', 9, NULL, NULL, NULL, NULL, 'CAP. 28 - PNEUMOLOGIE', 8, NULL),
(27, 'published', 10, NULL, NULL, NULL, NULL, 'CAP. 29 - BOALA VENOASĂ TROMBOEMBOLICĂ', 8, NULL),
(28, 'published', 11, NULL, NULL, NULL, NULL, 'CAP. 30 - CARDIOLOGIE', 8, NULL),
(29, 'published', 12, NULL, NULL, NULL, NULL, 'CAP. 31 - HIPERTENSIUNEA ARTERIALĂ', 8, NULL),
(30, 'published', 13, NULL, NULL, NULL, NULL, 'CAP. 32 - GASTROENTEROLOGIE', 8, NULL),
(31, 'published', 14, NULL, NULL, NULL, NULL, 'CAP. 34 - BOLILE HEPATICE', 8, NULL),
(32, 'published', 15, NULL, NULL, NULL, NULL, 'CAP. 36 - TULBURĂRI RENALE ȘI ALE TRACTULUI URINAR', 8, NULL),
(33, 'published', 16, NULL, NULL, NULL, NULL, 'CAP. 37 - INFECȚII TRANSMISIBILE PE CALE SEXUALĂ ȘI INFECŢIA CU HIV', 8, NULL),
(34, 'published', 1, NULL, NULL, NULL, NULL, 'CAP. 1 - EVALUAREA ȘI MANAGEMENTUL PERIOPERATOR', 9, NULL),
(35, 'published', 2, NULL, NULL, NULL, NULL, 'CAP. 4 - SÂNGERĂRILE CHIRURGICALE', 9, NULL),
(36, 'published', 3, NULL, NULL, NULL, NULL, 'CAP. 8 - INFECȚIILE CHIRURGICALE', 9, NULL),
(37, 'published', 4, NULL, NULL, NULL, NULL, 'CAP. 9 - TRAUMATOLOGIE', 9, NULL),
(38, 'published', 5, NULL, NULL, NULL, NULL, 'CAP. 10 - ARSURILE', 9, NULL),
(39, 'published', 6, NULL, NULL, NULL, NULL, 'CAP. 11 - HERNIILE PERETELUI ABDOMINAL', 9, NULL),
(40, 'published', 7, NULL, NULL, NULL, NULL, 'CAP. 12 - ESOFAGUL', 9, NULL),
(41, 'published', 8, NULL, NULL, NULL, NULL, 'CAP. 13 - STOMACUL ȘI DUODENUL', 9, NULL),
(42, 'published', 9, NULL, NULL, NULL, NULL, 'CAP. 14 - INTESTINUL SUBȚIRE ȘI APENDICELE', 9, NULL),
(43, 'published', 10, NULL, NULL, NULL, NULL, 'CAP. 15 - COLON, RECT ȘI ANUS', 9, NULL),
(44, 'published', 11, NULL, NULL, NULL, NULL, 'CAP. 16 - CĂILE BILIARE', 9, NULL),
(45, 'published', 12, NULL, NULL, NULL, NULL, 'CAP. 17 - PANCREASUL', 9, NULL),
(46, 'published', 13, NULL, NULL, NULL, NULL, 'CAP. 20 - FICATUL ȘI SPLINA', 9, NULL),
(47, 'published', 14, NULL, NULL, NULL, NULL, 'CAP. 26 - BOLILE SISTEMULUI VASCULAR', 9, NULL),
(48, 'published', 15, NULL, NULL, NULL, NULL, 'CAP. 27 - OTORINOLARINGOLOGIA', 9, NULL),
(49, 'published', 16, NULL, NULL, NULL, NULL, 'CAP. 28 - CHIRURGIE ORTOPEDICĂ', 9, NULL),
(50, 'published', 17, NULL, NULL, NULL, NULL, 'CAP. 29 - UROLOGIE', 9, NULL),
(51, 'published', 1, NULL, NULL, NULL, NULL, 'CAP. 9 - DERMATOLOGIE', 10, NULL),
(52, 'published', 2, NULL, NULL, NULL, NULL, 'CAP. 10 - PEDIATRIE', 10, NULL),
(53, 'published', 3, NULL, NULL, NULL, NULL, 'CAP. 12 - AFECȚIUNI GINECOLOGICE ȘI MAMARE', 10, NULL),
(54, 'published', 4, NULL, NULL, NULL, NULL, 'CAP. 13 - OBSTETRICĂ', 10, NULL),
(55, 'published', 5, NULL, NULL, NULL, NULL, 'CAP. 14 - TULBURĂRILE PSIHICE', 10, NULL),
(56, 'published', 6, NULL, NULL, NULL, NULL, 'CAP. 15 - EPIDEMIOLOGIE ȘI ETICĂ', 10, NULL);

-- ============================================
-- SUBCHAPTERS (Sample - first 28 from existing data)
-- ============================================

INSERT INTO subchapters (id, status, sort, user_created, date_created, user_updated, date_updated, subchapter_name, chapter_id, start_page) VALUES
(1, 'published', 1, '5361ed82-3d79-4e90-b3af-7a5ab90897ec', '2024-11-13 14:04:54.854+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 21:05:25.019+00', '1. ȚESUTURILE DURE DENTARE - STRUCTURĂ, IMPLICAȚII CLINICE', 3, NULL),
(4, 'published', 2, '5361ed82-3d79-4e90-b3af-7a5ab90897ec', '2024-11-13 14:21:17.122+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 21:01:03.789+00', '2. ETIOLOGIA CARIEI SIMPLE', 2, NULL),
(5, 'published', 3, '5361ed82-3d79-4e90-b3af-7a5ab90897ec', '2024-11-13 14:21:29.138+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 21:01:03.789+00', '3. ASPECTE HISTOPATOLOGICE ALE CARIEI ÎN SMALȚ', 2, NULL),
(6, 'published', 4, '5361ed82-3d79-4e90-b3af-7a5ab90897ec', '2024-11-13 14:21:41.879+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 21:01:03.789+00', '4. DIAGNOSTICUL LEZIUNILOR CARIOASE', 2, NULL),
(7, 'published', 5, '5361ed82-3d79-4e90-b3af-7a5ab90897ec', '2024-11-13 14:21:56.855+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 21:01:03.789+00', '5. DIAGNOSTICUL LEZIUNILOR NECARIOASE', 2, NULL),
(8, 'published', 6, '5361ed82-3d79-4e90-b3af-7a5ab90897ec', '2024-11-13 14:22:07.602+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 21:01:03.789+00', '6. PRINCIPII GENERALE DE TRATAMENT AL CARIEI SIMPLE', 2, NULL),
(9, 'published', 7, '5361ed82-3d79-4e90-b3af-7a5ab90897ec', '2024-11-13 14:22:18.101+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 21:01:03.789+00', '7. TRATAMENTUL CARIEI SIMPLE CAVITARE', 2, NULL),
(10, 'published', 8, '5361ed82-3d79-4e90-b3af-7a5ab90897ec', '2024-11-13 14:22:30.564+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 21:01:03.789+00', '8. MATERIALE DENTARE UTILIZATE MODERN ÎN TRATAMENTELE ODONTORESTAURATOARE DIRECTE', 2, NULL),
(11, 'published', 9, '5361ed82-3d79-4e90-b3af-7a5ab90897ec', '2024-11-13 14:23:55.566+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 18:22:56.203+00', '1. EXAMINARE ȘI DIAGNOSTIC ÎN ENDODONȚIE', NULL, NULL),
(12, 'published', 10, '5361ed82-3d79-4e90-b3af-7a5ab90897ec', '2024-11-13 14:40:05.547+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 18:22:56.203+00', '2. PATOLOGIA PULPARĂ ȘI PERIAPICALĂ', NULL, NULL),
(13, 'published', 11, '5361ed82-3d79-4e90-b3af-7a5ab90897ec', '2024-11-13 14:40:17.179+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 18:22:56.203+00', '3. TRATAMENTUL CHEMO-MECANIC AL CANALELOR RADICULARE', NULL, NULL),
(14, 'published', 12, '5361ed82-3d79-4e90-b3af-7a5ab90897ec', '2024-11-13 14:40:32.024+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 18:22:56.203+00', '4. DEZINFECȚIA CANALELOR RADICULARE', NULL, NULL),
(15, 'published', 13, '5361ed82-3d79-4e90-b3af-7a5ab90897ec', '2024-11-13 14:40:43.782+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 18:22:56.203+00', '5. OBTURAȚIA DE CANAL', NULL, NULL),
(16, 'published', 14, '5361ed82-3d79-4e90-b3af-7a5ab90897ec', '2024-11-13 14:40:54.426+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 18:22:56.203+00', '6. INCIDENTE ȘI ACCIDENTE ÎN CURSUL TRATAMENTULUI ENDODONTIC. SUCCES ȘI EȘEC ÎN ENDODONȚIE', NULL, NULL),
(17, 'published', 15, '5361ed82-3d79-4e90-b3af-7a5ab90897ec', '2024-11-13 14:42:39.944+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 18:22:56.203+00', '1. OCLUZOLOGIE', NULL, NULL),
(18, 'published', 16, '5361ed82-3d79-4e90-b3af-7a5ab90897ec', '2024-11-13 14:42:51.956+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 18:22:56.203+00', '2. EDENTAȚIA PARȚIALĂ REDUSĂ', NULL, NULL),
(19, 'published', 17, '5361ed82-3d79-4e90-b3af-7a5ab90897ec', '2024-11-13 14:43:03.266+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 18:22:56.203+00', '3. EDENTAȚIA PARȚIALĂ ÎNTINSĂ ȘI TOTALĂ', NULL, NULL),
(20, 'published', 18, '5361ed82-3d79-4e90-b3af-7a5ab90897ec', '2024-11-13 15:19:44.712+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 18:22:56.203+00', '1. ANATOMIA, STRUCTURA ȘI FUNCȚIILE PARODONȚIULUI', NULL, NULL),
(21, 'published', 19, '5361ed82-3d79-4e90-b3af-7a5ab90897ec', '2024-11-13 15:19:55.503+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 18:22:56.203+00', '2. ETIOPATOGENIA BOLII PARODONTALE', NULL, NULL),
(22, 'published', 20, '5361ed82-3d79-4e90-b3af-7a5ab90897ec', '2024-11-13 15:20:05.524+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 18:22:56.203+00', '3. INFLUENȚA INFECȚIEI PARODONTALE ASUPRA BOLILOR SISTEMICE', NULL, NULL),
(23, 'published', 21, '5361ed82-3d79-4e90-b3af-7a5ab90897ec', '2024-11-13 15:20:15.595+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 18:22:56.203+00', '4. DIAGNOSTICUL PARODONTAL', NULL, NULL),
(24, 'published', 22, '5361ed82-3d79-4e90-b3af-7a5ab90897ec', '2024-11-13 15:20:27.406+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 18:22:56.203+00', '5. GINGIVITE', NULL, NULL),
(25, 'published', 23, '5361ed82-3d79-4e90-b3af-7a5ab90897ec', '2024-11-13 15:20:41.492+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 18:22:56.203+00', '6. PARODONTITE', NULL, NULL),
(26, 'published', 24, '5361ed82-3d79-4e90-b3af-7a5ab90897ec', '2024-11-13 15:20:51.433+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 18:22:56.203+00', '7. TRATAMENTUL PARODONTAL', NULL, NULL),
(27, 'published', 25, '5361ed82-3d79-4e90-b3af-7a5ab90897ec', '2024-11-13 15:21:12.137+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 18:22:56.203+00', '1. ERUPȚIA DENTARĂ', NULL, NULL),
(28, 'published', 26, '5361ed82-3d79-4e90-b3af-7a5ab90897ec', '2024-11-13 15:23:11.111+00', '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-14 18:23:40.492+00', '2. PROFILAXIA CARIEI DENTARE ÎN PERIOADA DE CREȘTERE', NULL, NULL);

-- ============================================
-- QUESTIONS (Sample - first 20 from existing data)
-- ============================================

INSERT INTO questions (id, status, sort, user_created, date_created, user_updated, date_updated, question_prompt, question_type, selected_answers, book_id, chapter_id, subchapter_id, domain_id, explanation, is_public, is_free, tags, difficulty_level) VALUES
(19, 'published', NULL, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-26 14:05:09.667+00', NULL, NULL, 'Frenoplastia în „Z" constă în realizarea la extremitățile defectului excizional vertical a câte unei incizii oblice în unghi de: ', 'single_choice_single_answer', '["a"]', 5, 2, NULL, '9524c5c4-b831-4695-8d20-9445c688f678', 'Explicație în curs de adăugare.', true, false, NULL, NULL),
(20, 'published', NULL, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-26 14:05:09.709+00', NULL, NULL, 'Chistul dermoid poate ajunge până la dimensiuni de:', 'single_choice_single_answer', '["a"]', 5, 2, NULL, '9524c5c4-b831-4695-8d20-9445c688f678', 'Explicație în curs de adăugare.', true, false, NULL, NULL),
(21, 'published', NULL, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-26 14:05:09.725+00', NULL, NULL, 'Dintre cauzele locale dobândite ale edentației parțiale întinse fac parte următoarele, cu excepția:', 'single_choice_single_answer', '["a"]', 5, 2, NULL, '9524c5c4-b831-4695-8d20-9445c688f678', 'Explicație în curs de adăugare.', true, false, NULL, NULL),
(22, 'published', NULL, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-26 14:05:09.748+00', NULL, NULL, 'Eventualele asimetrii faciale cauzate de edentația parțială întinsă pot fi localizate la nivel:', 'single_choice_single_answer', '["a"]', 5, 2, NULL, '9524c5c4-b831-4695-8d20-9445c688f678', 'Explicație în curs de adăugare.', true, false, NULL, NULL),
(23, 'published', NULL, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-26 14:05:09.778+00', NULL, NULL, 'Protezele fixe unitare extracoronare cu agregare intracoronară prezintă următoarele elemente, cu excepția:', 'single_choice_single_answer', '["a"]', 5, 2, NULL, '9524c5c4-b831-4695-8d20-9445c688f678', 'Explicație în curs de adăugare.', true, false, NULL, NULL),
(24, 'published', NULL, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-26 14:05:09.794+00', NULL, NULL, 'Conform clasificării Costa, edentația 1.4, 1.3 este numită:', 'single_choice_single_answer', '["a"]', 5, 2, NULL, '9524c5c4-b831-4695-8d20-9445c688f678', 'Explicație în curs de adăugare.', true, false, NULL, NULL),
(25, 'published', NULL, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-26 14:05:09.811+00', NULL, NULL, 'Avantajele MTA (Mineral Trioxide Aggregate) sunt:', 'multiple_answers', '["a","b"]', 5, 2, NULL, '9524c5c4-b831-4695-8d20-9445c688f678', 'Explicație în curs de adăugare.', true, false, NULL, NULL),
(26, 'published', NULL, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-26 14:05:09.828+00', NULL, NULL, 'Care dintre următoarele afirmații sunt incorecte în cazul leziunilor de uzură de origine acidă:', 'multiple_answers', '["a","d","e"]', 5, 2, NULL, '9524c5c4-b831-4695-8d20-9445c688f678', 'Explicație în curs de adăugare.', true, false, NULL, NULL),
(27, 'published', NULL, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-26 14:05:09.845+00', NULL, NULL, 'Pentru finisarea marginilor de smalț ale unei cavități convenționale se va ține seama de:', 'multiple_answers', '["a","b","c"]', 5, 2, NULL, '9524c5c4-b831-4695-8d20-9445c688f678', 'Explicație în curs de adăugare.', true, false, NULL, NULL),
(28, 'published', NULL, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-26 14:05:09.861+00', NULL, NULL, 'Următoarele tipuri de țesuturi alcătuiesc parodonțiul marginal profund:', 'multiple_answers', '["a","e"]', 5, 2, NULL, '9524c5c4-b831-4695-8d20-9445c688f678', 'Explicație în curs de adăugare.', true, false, NULL, NULL),
(29, 'published', NULL, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-26 14:05:09.881+00', NULL, NULL, 'Factori favorizanți incriminați în apariția gingivostomatitei ulcero-necrotice sunt:', 'multiple_answers', '["a","e"]', 5, 2, NULL, '9524c5c4-b831-4695-8d20-9445c688f678', 'Explicație în curs de adăugare.', true, false, NULL, NULL),
(30, 'published', NULL, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-26 14:05:09.896+00', NULL, NULL, 'Care din următoarele afirmații privind gingivostomatita aftoasă recidivantă sunt adevărate:', 'multiple_answers', '["a","b","c"]', 5, 2, NULL, '9524c5c4-b831-4695-8d20-9445c688f678', 'Explicație în curs de adăugare.', true, false, NULL, NULL),
(31, 'published', NULL, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-26 14:05:09.913+00', NULL, NULL, 'Instrumente radiculare cu valoare istorică sunt:', 'multiple_answers', '["a","b"]', 5, 2, NULL, '9524c5c4-b831-4695-8d20-9445c688f678', 'Explicație în curs de adăugare.', true, false, NULL, NULL),
(32, 'published', NULL, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-26 14:05:09.953+00', NULL, NULL, 'În terapia parodontală, după aplicarea pe suprafețele radiculare a tetraciclinei, au fost observate următoarele efecte:', 'multiple_answers', '["a","d"]', 5, 2, NULL, '9524c5c4-b831-4695-8d20-9445c688f678', 'Explicație în curs de adăugare.', true, false, NULL, NULL),
(33, 'published', NULL, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-26 14:05:09.976+00', NULL, NULL, 'Care din următoarele terapii sunt obligatorii în tratamentul parodontal:', 'multiple_answers', '["a","b","c","e"]', 5, 2, NULL, '9524c5c4-b831-4695-8d20-9445c688f678', 'Explicație în curs de adăugare.', true, false, NULL, NULL),
(34, 'published', NULL, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-26 14:05:09.993+00', NULL, NULL, 'Diagnosticul diferențial al cariei simple a dinților temporari nu se realizează cu:', 'multiple_answers', '["a","c"]', 5, 2, NULL, '9524c5c4-b831-4695-8d20-9445c688f678', 'Explicație în curs de adăugare.', true, false, NULL, NULL),
(35, 'published', NULL, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-26 14:05:10.018+00', NULL, NULL, 'Următoarele materiale dentare sunt indicate în tratamentul plăgii dentinare la dinții temporari:', 'multiple_answers', '["a","c","e"]', 5, 2, NULL, '9524c5c4-b831-4695-8d20-9445c688f678', 'Explicație în curs de adăugare.', true, false, NULL, NULL),
(36, 'published', NULL, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-26 14:05:10.037+00', NULL, NULL, 'Metodele indicate în tratamentul pulpitelor la dinții temporari sunt următoarele:', 'multiple_answers', '["a","b","e"]', 5, 2, NULL, '9524c5c4-b831-4695-8d20-9445c688f678', 'Explicație în curs de adăugare.', true, false, NULL, NULL),
(37, 'published', NULL, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-26 14:05:10.058+00', NULL, NULL, 'Este obiectiv terapeutic în tratamentul curativ al ocluziei adânci acoperite:', 'single_choice_single_answer', '["a"]', 5, 2, NULL, '9524c5c4-b831-4695-8d20-9445c688f678', 'Explicație în curs de adăugare.', true, false, NULL, NULL),
(38, 'published', NULL, '69ecb1cb-9350-4512-ab7c-50bade9482c5', '2025-01-26 14:05:10.094+00', NULL, NULL, 'Care dintre leziunile de uzură enumerate este o leziune mecanică, fiziologică:', 'single_choice_single_answer', '["a"]', 5, 2, NULL, '9524c5c4-b831-4695-8d20-9445c688f678', 'Explicație în curs de adăugare.', true, false, NULL, NULL);

-- ============================================
-- ANSWER OPTIONS (Sample - first 30 from existing data)
-- ============================================

INSERT INTO answer_options (id, question_id, text, is_correct, sort_order, created_at, updated_at) VALUES
(1, 224, 'a) Diabetul zaharat', true, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(2, 225, 'a) Dispnee de efort', true, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(3, 226, 'a) Debut insidios', true, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(4, 19, '5 grade', true, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(5, 20, '15-20 cm', true, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(6, 21, 'caria și complicațiile ei', true, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(7, 22, 'aspectul gingiei', true, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(8, 23, 'sunt leziuni fiziologice localizate incizal/ocluzal/interproximal', true, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(9, 24, 'chist sebaceu', true, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(10, 25, 'celule mezenchimale nediferențiate', true, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(11, 26, 'pruritul gingival', true, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(12, 27, 'pulpita parțială purulentă', true, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(13, 28, 'pulpotomia devitală', true, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(14, 29, 'coafaj indirect', true, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(15, 30, 'pericoronaritele', true, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(16, 31, 'apare rar la adulți', true, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(17, 32, 'chiuretele Younger-Good 7-8', true, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(18, 33, 'eliminarea factorilor de risc generali', true, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(19, 34, 'hipoplazia smalțului', true, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(20, 35, 'hidroxidul de calciu', true, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(21, 36, 'pulpotomia vitală', true, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(22, 37, 'creșterea dimensiunii verticale a feței', true, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(23, 38, 'abraziunea', true, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(24, 39, 'c) Angiogeneza', false, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(25, 40, 'c) Angiotensină II receptor blocker', false, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(26, 41, 'c) Beta-2 agonisti cu acțiune lungă', false, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(27, 42, 'c) Hemoragiile', false, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(28, 43, 'c) 6-7%', false, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(29, 44, 'a) Tromboliză', true, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00'),
(30, 45, 'a) ACE inhibitori', true, 1, '2025-06-29 13:27:05.771592+00', '2025-06-29 13:27:05.771592+00');

-- ============================================
-- AI STAGING DATA (Sample from existing)
-- ============================================

-- Note: AI staging tables will be empty initially
-- This is intentional as these are working tables for new AI-generated content

-- Reset sequences to continue from current max values
SELECT setval('books_id_seq', (SELECT MAX(id) FROM books));
SELECT setval('chapters_id_seq', (SELECT MAX(id) FROM chapters));
SELECT setval('subchapters_id_seq', (SELECT MAX(id) FROM subchapters));
SELECT setval('questions_id_seq', (SELECT MAX(id) FROM questions));
SELECT setval('answer_options_id_seq', (SELECT MAX(id) FROM answer_options));

-- ============================================
-- VACUUM AND ANALYZE
-- ============================================

VACUUM ANALYZE domains;
VACUUM ANALYZE books;
VACUUM ANALYZE chapters;
VACUUM ANALYZE subchapters;
VACUUM ANALYZE questions;
VACUUM ANALYZE answer_options;
VACUUM ANALYZE ai_question_staging;
VACUUM ANALYZE ai_answer_options_staging;
VACUUM ANALYZE ai_generation_costs;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '🎉 Data seeding completed successfully!';
    RAISE NOTICE '📊 Seeded data:';
    RAISE NOTICE '   • % domains', (SELECT COUNT(*) FROM domains);
    RAISE NOTICE '   • % books', (SELECT COUNT(*) FROM books);
    RAISE NOTICE '   • % chapters', (SELECT COUNT(*) FROM chapters);
    RAISE NOTICE '   • % subchapters', (SELECT COUNT(*) FROM subchapters);
    RAISE NOTICE '   • % questions', (SELECT COUNT(*) FROM questions);
    RAISE NOTICE '   • % answer options', (SELECT COUNT(*) FROM answer_options);
    RAISE NOTICE '';
    RAISE NOTICE '✅ Your fresh database now contains all existing data!';
    RAISE NOTICE '📝 Next: Access Directus admin to verify collections';
END $$;