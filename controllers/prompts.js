const router = require('express').Router();

const prompts =  [
  {
    "id": 1,
    "content": "In 5 years' time, what would your ideal life look like? What would the worst version look like?  (TODAY)",
    "tag": "goals",
    "date": "2025-01-12"
  },
  {
    "id": 2,
    "content": "Who are you most grateful for and why?",
    "tag": "relationships",
    "date": "2025-01-10"
  },
  {
    "id": 3,
    "content": "Is there a difficult conversation you're avoiding? If so, why?",
    "tag": "relationships",
    "date": "2025-01-08"
  },
];

router.get('/', (request, response) => {
  response.json({ prompts });
});

module.exports = router;
