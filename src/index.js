import 'colors';
import * as inquirer from 'inquirer';
import args, { validateArgs, processArgPaths } from '@pyramation/args';
import { filter as fuzzy } from 'fuzzy';

inquirer.registerPrompt(
  'autocomplete',
  require('inquirer-autocomplete-prompt')
);

export const required = (questions) => {
  return questions.map((q) => {
    if (q.required && !q.validate) {
      q.validate = (value) => {
        if (!value) {
          return `${q.name} is required`;
        }
        return true;
      };
    }
    return q;
  });
};

export const names = (questions) => {
  return questions.map((q) => {
    q.message = `${'['.white}${q.name.blue}${']'.white} ${
      (q.message || q.name).green
    }`;
    return q;
  });
};

// TODO test arrays
const getAnswered = (answers) => {
  return Object.entries(answers).reduce((m, [name, answer]) => {
    if (typeof answer === 'undefined') return m;
    m[name] = answer;
    return m;
  }, {});
};

export const filter = (questions, answers) => {
  const answered = Object.keys(getAnswered(answers));
  return questions.reduce((questions, question) => {
    if (answered.includes(question.name)) return questions;
    return questions.concat(question);
  }, []);
};

export const getFuzzySearch = (list) => {
  return (answers, input) => {
    input = input || '';
    return new Promise(function (resolve) {
      setTimeout(function () {
        const fuzzyResult = fuzzy(input, list);
        resolve(
          fuzzyResult.map(function (el) {
            return el.original;
          })
        );
      }, 25);
    });
  };
};

export const transform = (questions) => {
  return questions.map((q) => {
    if (q.type === 'fuzzy') {
      const choices = q.choices;
      delete q.choices;
      return {
        ...q,
        type: 'autocomplete',
        source: getFuzzySearch(choices)
      };
    } else {
      return q;
    }
  });
};

export const prompt = async (questions, argv) => {
  questions = transform(questions);
  argv = args(questions, ...argv);
  argv = getAnswered(argv);
  const result = await inquirer.prompt(
    names(required(filter(questions, argv)))
  );
  const final = {
    ...result,
    ...argv
  };
  processArgPaths(questions, final);
  validateArgs(questions, final);
  return final;
};
