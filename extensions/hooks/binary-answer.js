module.exports = function registerHook({ filter }) {
  filter('items.create', 'quiz_questions', async (input) => {
    const { answer_type, selected_answers, choices } = input;

    if (selected_answers && choices) {
      // Initialize binary string with 0s
      let binaryAnswer = choices.map(() => '0');

      // Set "1" in positions corresponding to selected answers
      choices.forEach((choice, index) => {
        if (selected_answers.includes(choice)) {
          binaryAnswer[index] = '1';
        }
      });

      // Convert the array to a string
      const binaryString = binaryAnswer.join('');

      // Validation: Single Answer type should have exactly one "1"
      if (answer_type === 'Single Answer' && binaryString.split('1').length - 1 !== 1) {
        throw new Error('Single Answer questions must have exactly one correct answer.');
      }

      // Validation: Multiple Answers type should have between 2 and 4 "1"s
      if (answer_type === 'Multiple Answers') {
        const countOnes = binaryString.split('1').length - 1;
        if (countOnes < 2 || countOnes > 4) {
          throw new Error('Multiple Answer questions must have between 2 and 4 correct answers.');
        }
      }

      // Set the binary answer
      input.answer = binaryString;
    }

    return input;
  });
};
