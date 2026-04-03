/// <reference path="../pb_data/types.d.ts" />

/**
 * POST /api/grade-answer
 *
 * Server-side PocketBase hook that grades short_answer and scenario_based quiz
 * responses using OpenAI. The OPENAI_API_KEY env var is accessed only here on
 * the server — it is never sent to or stored on the client app.
 *
 * Expected request body:
 *   { questionId: string, answer: string }
 *
 * Returns:
 *   { is_correct: boolean, feedback: string }
 *
 * Deploy: place this file in pb_hooks/ on your PocketBase server and set
 *   OPENAI_API_KEY=sk-... in the server's environment (e.g. systemd unit,
 *   Docker env, or .env loaded at startup).
 */
routerAdd('POST', '/api/quiz/grade-answer', (e) => {
  // 1. Require authentication — reject unauthenticated requests
  const auth = e.auth;
  if (!auth) {
    return e.json(401, { message: 'Unauthorized' });
  }

  // 2. Parse and validate request body
  const data = e.requestInfo().body;
  const questionId = data['questionId'];
  const answer = data['answer'];

  if (!questionId || typeof questionId !== 'string') {
    return e.json(400, { message: 'questionId is required' });
  }
  if (!answer || typeof answer !== 'string' || answer.trim().length === 0) {
    return e.json(400, { message: 'answer is required' });
  }

  // 3. Fetch the question record to get the reference explanation
  let question;
  try {
    question = $app.findRecordById('quiz_questions', questionId);
  } catch (err) {
    const msg = err?.message || String(err);
    const status = msg.includes('no rows') ? 404 : 500;
    return e.json(status, { message: status === 404 ? 'Question not found' : 'Database error' });
  }

  const explanation = question.get('explanation');
  if (!explanation) {
    return e.json(422, { message: 'Question has no explanation for grading' });
  }

  // 4. Retrieve API key from server environment — never from the client
  const openAiKey = $os.getenv('OPENAI_API_KEY');
  if (!openAiKey) {
    return e.json(500, { message: 'Grading service not configured' });
  }

  // 5. Call OpenAI chat completion
  let resp;
  try {
    resp = $http.send({
      url: 'https://api.openai.com/v1/chat/completions',
      method: 'POST',
      timeout: 30,
      headers: {
        'Authorization': 'Bearer ' + openAiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a quiz grader for a spiritual education app. ' +
              'You receive a reference answer and a student\'s answer. ' +
              'Evaluate whether the student\'s answer captures the core meaning. ' +
              'Be generous with minor phrasing differences but strict on missing key concepts. ' +
              'Respond ONLY with valid JSON in this exact format: ' +
              '{"is_correct": boolean, "feedback": "one or two sentence explanation"}',
          },
          {
            role: 'user',
            content:
              'Reference answer: ' + explanation + '\n\n' +
              'Student answer: ' + answer.trim(),
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 200,
        temperature: 0.2,
      }),
    });
  } catch (err) {
    return e.json(502, { message: 'Grading service unavailable' });
  }

  // 6. Parse OpenAI response
  if (!resp || resp.statusCode !== 200) {
    return e.json(502, { message: 'Grading service returned an error' });
  }

  let result;
  try {
    const choices = resp.json && resp.json['choices'];
    if (!choices || choices.length === 0) {
      return e.json(502, { message: 'Empty response from grading service' });
    }
    const content = choices[0]['message']['content'];
    if (!content) {
      return e.json(502, { message: 'Malformed grading response' });
    }
    result = JSON.parse(content);
  } catch (_) {
    return e.json(502, { message: 'Invalid response from grading service' });
  }

  if (typeof result['is_correct'] !== 'boolean' || typeof result['feedback'] !== 'string') {
    return e.json(502, { message: 'Unexpected grading response format' });
  }

  return e.json(200, {
    is_correct: result['is_correct'],
    feedback: result['feedback'],
  });
});
