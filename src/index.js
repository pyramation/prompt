import 'colors';
import * as inquirer from 'inquirer';
import args, { validateArgs, processArgPaths } from '@pyramation/args';

inquirer.registerPrompt(
  'autocomplete',
  require('inquirer-autocomplete-prompt')
);

export const required = questions => {
  return questions.map(q => {
    if (q.required && !q.validate) {
      q.validate = value => {
        if (!value) {
          return `${q.name} is required`;
        }
        return true;
      };
    }
    return q;
  });
};

export const names = questions => {
  return questions.map(q => {
    q.message = `${'['.white}${q.name.blue}${']'.white} ${
      (q.message || q.name).green
    }`;
    return q;
  });
};

// TODO test arrays
const getAnswered = answers => {
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

export const prompt = async (questions, argv) => {
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
