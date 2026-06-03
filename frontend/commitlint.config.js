// commitlint.config.js — enforces Conventional Commits on every commit
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // new feature
        'fix', // bug fix
        'docs', // documentation only
        'style', // formatting, no logic change
        'refactor', // code change that is neither fix nor feature
        'perf', // performance improvement
        'test', // adding or fixing tests
        'build', // build system or external dependencies
        'ci', // CI/CD configuration
        'chore', // maintenance (no production code change)
        'revert', // revert a previous commit
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 120],
  },
};
