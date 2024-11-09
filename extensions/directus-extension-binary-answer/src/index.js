import { InvalidPayloadError } from "@directus/errors";

export default ({ filter }) => {
  // Filter for item creation in the "quiz_questions" collection
  filter("items.create", async (input, { collection }) => {
    console.log("-----------\ninput---------", input);
    console.log("-----------\ncollection---------", collection);
    if (collection !== "Questions") return input;
    const choices = ["a", "b", "c", "d", "e"];
    const { question_type, selected_answers } = input;

    if (!selected_answers || !choices) {
      throw new InvalidPayloadError({
        reason: "Both selected_answers and choices fields are required.",
      });
    }

    // Initialize binary answer array
    let binaryAnswer = Array(choices.length).fill("0");

    // Convert selected answers to binary format
    choices.forEach((choice, index) => {
      if (selected_answers.includes(choice)) {
        binaryAnswer[index] = "1";
      } else {
        binaryAnswer[index] = "0";
      }
    });

    const binaryString = binaryAnswer.join("");
    const countOnes = binaryString.split("1").length - 1;

    // Validate based on question type
    if (question_type === "single_answer" && countOnes !== 1) {
      throw new InvalidPayloadError({
        reason: "Single Answer questions must have exactly one correct answer.",
      });
    }

    if (
      question_type === "multiple_answers" &&
      (countOnes < 2 || countOnes > 4)
    ) {
      throw new InvalidPayloadError({
        reason:
          "Multiple Answer questions must have between 2 and 4 correct answers.",
      });
    }

    // Set the binary string as the answer
    console.log("-----------\ninput.answer---------", binaryString);
    input.answer = binaryString;


    return input;
  });

  // Filter for item updates in the "quiz_questions" collection
  filter("items.update", async (input, { collection }) => {
    console.log("-----------\ninput---------", input);
    if (collection !== "Questions") return input;
    const choices = ["a", "b", "c", "d", "e"];
    console.log("-----------\nchoices---------", choices);
    const { question_type, selected_answers } = input;

    if (!selected_answers || !choices) {
      throw new InvalidPayloadError({
        reason: "Both selected_answers and choices fields are required.",
      });
    }

    // Initialize binary answer array
    let binaryAnswer = Array(choices.length).fill("0");

    // Convert selected answers to binary format
    choices.forEach((choice, index) => {
      if (selected_answers.includes(choice)) {
        binaryAnswer[index] = "1";
      } else {
        binaryAnswer[index] = "0";
      }
    });

    const binaryString = binaryAnswer.join("");
    const countOnes = binaryString.split("1").length - 1;
    console.log('CountONes', countOnes)

    // Validate based on question type
    if (question_type === "single_answer" && countOnes !== 1) {
      throw new InvalidPayloadError({
        reason: "Single Answer questions must have exactly one correct answer.",
      });
    }

    if (
      question_type === "multiple_answers" &&
      (countOnes < 2 || countOnes > 4)
    ) {
      throw new InvalidPayloadError({
        reason:
          "Multiple Answer questions must have between 2 and 4 correct answers.",
      });
    }

    // Set the binary string as the answer
    console.log("-----------\ninput.answer---------", binaryString);
    input.answer = binaryString;

    return input;
  });
};
