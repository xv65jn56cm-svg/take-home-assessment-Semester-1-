// script.js - quiz logic
let questions = [];
let currentIndex = 0;
let score = 0;
let userName = "";
let answers = []; // store {id, text, given, correct}

const el = id => document.getElementById(id);

async function init() {
  try {
    const res = await fetch('questions.json');
    questions = await res.json();
    el('qTotal').textContent = questions.length;
  } catch (err) {
    console.error('Failed to load questions.json', err);
    alert('Could not load questions.json. Make sure the file exists in your repo.');
    return;
  }

  // wire up buttons
  el('startBtn').addEventListener('click', startQuiz);
  el('trueBtn').addEventListener('click', () => handleAnswer(true));
  el('falseBtn').addEventListener('click', () => handleAnswer(false));
  el('nextBtn').addEventListener('click', nextQuestion);
  el('restartBtn').addEventListener('click', restartQuiz);
  el('downloadBtn').addEventListener('click', downloadAnswers);
}

function startQuiz(){
  userName = el('userName').value.trim();
  if (!userName) {
    alert('Please enter your name to start.');
    return;
  }
  el('start-screen').style.display = 'none';
  el('quiz-screen').style.display = 'block';
  currentIndex = 0;
  score = 0;
  answers = [];
  el('scoreVal').textContent = score;
  showQuestion();
}

function showQuestion(){
  const q = questions[currentIndex];
  el('qIndex').textContent = currentIndex + 1;
  el('questionText').textContent = q.text;
  el('explanation').style.display = 'none';
  el('explanation').textContent = '';
  el('nextBtn').style.display = 'none';
  // enable option buttons
  el('trueBtn').disabled = false;
  el('falseBtn').disabled = false;
}

function handleAnswer(given){
  const q = questions[currentIndex];
  const correct = !!q.answer;
  const isCorrect = (given === correct);
  if (isCorrect) score++;
  el('scoreVal').textContent = score;

  // store answer
  answers.push({
    id: q.id ?? (currentIndex+1),
    text: q.text,
    given: given,
    correct: correct,
    explanation: q.explanation || ""
  });

  // show explanation and mark
  const explanationEl = el('explanation');
  explanationEl.style.display = 'block';
  explanationEl.textContent = (isCorrect ? 'Correct. ' : 'Incorrect. ') + (q.explanation || '');
  explanationEl.className = isCorrect ? 'explanation correct' : 'explanation wrong';

  // disable options until next
  el('trueBtn').disabled = true;
  el('falseBtn').disabled = true;
  el('nextBtn').style.display = 'inline-block';
}

function nextQuestion(){
  currentIndex++;
  if (currentIndex < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
}

function showResult(){
  el('quiz-screen').style.display = 'none';
  el('result-screen').style.display = 'block';
  el('resultText').textContent = `Thanks ${userName}! You scored ${score} out of ${questions.length}.`;
  // Optionally: send results to backend / Google Apps Script
  // sendResultsToSheet({ name: userName, score, answers });
}

// restart
function restartQuiz(){
  el('result-screen').style.display = 'none';
  el('start-screen').style.display = 'block';
  el('userName').value = '';
}

// download answers as JSON
function downloadAnswers(){
  const payload = {
    name: userName,
    score,
    total: questions.length,
    date: new Date().toISOString(),
    answers
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `quiz-results-${userName || 'user'}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Example: how to post results to Google Apps Script (uncomment and set url)
// async function sendResultsToSheet(payload) {
//   try {
//     await fetch('https://script.google.com/macros/s/YOUR_DEPLOYED_SCRIPT_ID/exec', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload)
//     });
//     console.log('Results sent to sheet');
//   } catch (err) {
//     console.error('Error sending to sheet', err);
//   }
// }

window.addEventListener('DOMContentLoaded', init);
