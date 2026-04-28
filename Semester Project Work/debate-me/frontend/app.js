/**
 * app.js
 * Main frontend logic for Debate Me
 * Features:
 * - Debate generation with language and mode selection
 * - Voice input (Web Speech API)
 * - Text to speech (Speech Synthesis API)
 * - Voting system with AI rebuttal
 * - Comments system
 * - Leaderboard with delete
 * - Trending topics
 * - Stats bar
 * - Dark/Light mode toggle
 * - Copy argument
 * - Share debate
 * - Debate timer
 * - Username persistence
 * - Badges system
 *
 * Author: Ahnaf Tahmid
 */

// ===== CONFIGURATION =====
const API_BASE = 'http://localhost:3000/api';

// ===== STATE =====
let currentDebate = null;
let hasVoted = false;
let isSpeaking = false;
let recognition = null;
let timerInterval = null;
let timerSeconds = 30;
let timerRunning = false;

// ===== DOM ELEMENTS =====
const topicInput = document.getElementById('topicInput');
const generateBtn = document.getElementById('generateBtn');
const btnText = document.querySelector('.btn-text');
const btnLoader = document.querySelector('.btn-loader');
const voiceBtn = document.getElementById('voiceBtn');
const voiceStatus = document.getElementById('voiceStatus');
const errorMessage = document.getElementById('errorMessage');
const debateSection = document.getElementById('debateSection');
const debateTopic = document.getElementById('debateTopic');
const debateModeBadge = document.getElementById('debateModeBadge');
const debateLangBadge = document.getElementById('debateLangBadge');
const forArgument = document.getElementById('forArgument');
const againstArgument = document.getElementById('againstArgument');
const forVoteBtn = document.getElementById('forVoteBtn');
const againstVoteBtn = document.getElementById('againstVoteBtn');
const voteResult = document.getElementById('voteResult');
const forBar = document.getElementById('forBar');
const againstBar = document.getElementById('againstBar');
const forVoteCount = document.getElementById('forVoteCount');
const againstVoteCount = document.getElementById('againstVoteCount');
const providerBadge = document.getElementById('providerBadge');
const listenBtn = document.getElementById('listenBtn');
const stopBtn = document.getElementById('stopBtn');
const leaderboardList = document.getElementById('leaderboardList');
const refreshBtn = document.getElementById('refreshBtn');
const usernameInput = document.getElementById('usernameInput');
const commentInput = document.getElementById('commentInput');
const submitCommentBtn = document.getElementById('submitCommentBtn');
const commentsList = document.getElementById('commentsList');
const themeToggle = document.getElementById('themeToggle');
const languageSelect = document.getElementById('languageSelect');
const modeSelect = document.getElementById('modeSelect');
const copyForBtn = document.getElementById('copyForBtn');
const copyAgainstBtn = document.getElementById('copyAgainstBtn');
const shareBtn = document.getElementById('shareBtn');
const shareFeedback = document.getElementById('shareFeedback');
const timerDisplay = document.getElementById('timerDisplay');
const timerCount = document.getElementById('timerCount');
const timerBtn = document.getElementById('timerBtn');
const rebuttalSection = document.getElementById('rebuttalSection');
const rebuttalText = document.getElementById('rebuttalText');
const trendingList = document.getElementById('trendingList');
const badgesSection = document.getElementById('badgesSection');
const badgesList = document.getElementById('badgesList');
const statDebates = document.getElementById('statDebates');
const statVotes = document.getElementById('statVotes');
const statComments = document.getElementById('statComments');
const statMostVoted = document.getElementById('statMostVoted');

// ===== UTILITY FUNCTIONS =====

const showError = (message) => {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
  setTimeout(() => errorMessage.classList.add('hidden'), 4000);
};

const setLoading = (loading) => {
  generateBtn.disabled = loading;
  btnText.classList.toggle('hidden', loading);
  btnLoader.classList.toggle('hidden', !loading);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const updateVoteBars = (forVotes, againstVotes) => {
  const total = forVotes + againstVotes;
  const forPercent = total > 0 ? (forVotes / total) * 100 : 50;
  const againstPercent = total > 0 ? (againstVotes / total) * 100 : 50;

  forBar.style.width = `${forPercent}%`;
  againstBar.style.width = `${againstPercent}%`;
  forVoteCount.textContent = forVotes;
  againstVoteCount.textContent = againstVotes;
  voteResult.classList.remove('hidden');
};

// ===== DARK / LIGHT MODE =====

/**
 * Loads saved theme from localStorage on page load
 * Toggles between dark and light mode
 */
const loadTheme = () => {
  const saved = localStorage.getItem('debate-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  themeToggle.textContent = saved === 'dark' ? '🌙' : '☀️';
};

const toggleTheme = () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('debate-theme', next);
  themeToggle.textContent = next === 'dark' ? '🌙' : '☀️';
};

themeToggle.addEventListener('click', toggleTheme);
loadTheme();

// ===== USERNAME PERSISTENCE =====

/**
 * Saves and restores username from localStorage
 * So users don't have to type their name every time
 */
const loadUsername = () => {
  const saved = localStorage.getItem('debate-username');
  if (saved) usernameInput.value = saved;
};

usernameInput.addEventListener('input', () => {
  localStorage.setItem('debate-username', usernameInput.value);
});

loadUsername();

// ===== DEBATE GENERATION =====

const generateDebate = async () => {
  const topic = topicInput.value.trim();
  const language = languageSelect.value;
  const mode = modeSelect.value;

  if (!topic) {
    showError('Please enter a topic to debate.');
    return;
  }

  if (topic.length < 5) {
    showError('Topic is too short. Please be more specific.');
    return;
  }

  // Stop any ongoing speech or timer
  stopSpeech();
  stopTimer();

  setLoading(true);
  errorMessage.classList.add('hidden');

  try {
    const response = await fetch(`${API_BASE}/debate/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, language, mode })
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'Failed to generate debate');

    // Store current debate state
    currentDebate = data;
    hasVoted = false;

    // Populate UI
    debateTopic.textContent = `"${data.topic}"`;
    debateModeBadge.textContent = `${mode}`;
    debateLangBadge.textContent = `🌍 ${language}`;
    forArgument.textContent = data.for;
    againstArgument.textContent = data.against;
    providerBadge.textContent = `⚡ Generated by ${data.provider === 'groq' ? 'Groq (LLaMA 3.3)' : 'Google Gemini'}`;

    // Reset vote state
    forVoteBtn.disabled = false;
    againstVoteBtn.disabled = false;
    forVoteBtn.textContent = '👍 This won';
    againstVoteBtn.textContent = '👍 This won';
    voteResult.classList.add('hidden');
    rebuttalSection.classList.add('hidden');
    shareFeedback.classList.add('hidden');

    // Reset timer
    resetTimer();

    // Show debate section
    debateSection.classList.remove('hidden');

    // Load comments
    loadComments(data.id);

    // Scroll to debate
    debateSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Check and award first debate badge
    checkBadges();

    // Refresh stats and leaderboard
    loadStats();
    loadLeaderboard();
    loadTrending();

  } catch (error) {
    showError(error.message || 'Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
};

generateBtn.addEventListener('click', generateDebate);
topicInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') generateDebate();
});

// ===== VOICE INPUT =====

const startVoiceInput = () => {
  console.log('Voice button clicked');
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  console.log('SpeechRecognition:', SpeechRecognition);

  if (!SpeechRecognition) {
    showError('Voice input is not supported in your browser. Try Chrome.');
    return;
  }

  console.log('Starting recognition...');
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  voiceBtn.classList.add('listening');
  voiceStatus.classList.remove('hidden');
  voiceStatus.textContent = '🎤 Listening... speak now';

  recognition.start();

  recognition.onresult = (event) => {
    console.log('Got result:', event.results);
    const transcript = event.results[0][0].transcript;
    topicInput.value = transcript;
    voiceStatus.textContent = `✅ Got it: "${transcript}"`;
    setTimeout(() => voiceStatus.classList.add('hidden'), 3000);
  };

  recognition.onend = () => {
    console.log('Recognition ended');
    voiceBtn.classList.remove('listening');
  };

  recognition.onerror = (event) => {
    console.log('Recognition error:', event.error);
    voiceBtn.classList.remove('listening');
    voiceStatus.classList.add('hidden');
    if (event.error === 'not-allowed') {
      showError('Microphone access denied. Please allow microphone access.');
    } else {
      showError(`Voice error: ${event.error}`);
    }
  };

  recognition.onspeechstart = () => console.log('Speech detected!');
  recognition.onnomatch = () => console.log('No match found');
};

voiceBtn.addEventListener('click', startVoiceInput);

// ===== TEXT TO SPEECH =====

const listenToDebate = () => {
  if (!currentDebate) return;

  if (!window.speechSynthesis) {
    showError('Text-to-speech is not supported in your browser.');
    return;
  }

  window.speechSynthesis.cancel();

  const script = `
    Topic: ${currentDebate.topic}.
    Argument FOR. ${currentDebate.for}.
    Argument AGAINST. ${currentDebate.against}.
  `;

  const utterance = new SpeechSynthesisUtterance(script);
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;

  utterance.onstart = () => {
    isSpeaking = true;
    listenBtn.classList.add('hidden');
    stopBtn.classList.remove('hidden');
  };

  utterance.onend = () => {
    isSpeaking = false;
    listenBtn.classList.remove('hidden');
    stopBtn.classList.add('hidden');
  };

  window.speechSynthesis.speak(utterance);
};

const stopSpeech = () => {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  isSpeaking = false;
  listenBtn.classList.remove('hidden');
  stopBtn.classList.add('hidden');
};

listenBtn.addEventListener('click', listenToDebate);
stopBtn.addEventListener('click', stopSpeech);

// ===== COPY ARGUMENT =====

/**
 * Copies the FOR or AGAINST argument text to clipboard
 */
const copyToClipboard = async (text, btn) => {
  try {
    await navigator.clipboard.writeText(text);
    const original = btn.textContent;
    btn.textContent = '✅ Copied!';
    setTimeout(() => btn.textContent = original, 2000);
  } catch (error) {
    showError('Failed to copy to clipboard.');
  }
};

copyForBtn.addEventListener('click', () => {
  copyToClipboard(forArgument.textContent, copyForBtn);
});

copyAgainstBtn.addEventListener('click', () => {
  copyToClipboard(againstArgument.textContent, copyAgainstBtn);
});

// ===== SHARE DEBATE =====

/**
 * Copies a shareable URL with the topic as a query parameter
 * Recipient can paste the topic and generate the same debate
 */
const shareDebate = async () => {
  if (!currentDebate) return;

  const url = `${window.location.origin}${window.location.pathname}?topic=${encodeURIComponent(currentDebate.topic)}`;

  try {
    await navigator.clipboard.writeText(url);
    shareFeedback.classList.remove('hidden');
    setTimeout(() => shareFeedback.classList.add('hidden'), 3000);
  } catch (error) {
    showError('Failed to copy link.');
  }
};

shareBtn.addEventListener('click', shareDebate);

/**
 * Auto-fills topic from URL query parameter
 * Allows shared links to pre-fill the topic
 */
const loadTopicFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  const topic = params.get('topic');
  if (topic) {
    topicInput.value = topic;
    topicInput.focus();
  }
};

loadTopicFromURL();

// ===== DEBATE TIMER =====

/**
 * Countdown timer gives users 30 seconds to decide
 * Turns red and urgent when under 10 seconds
 */
const startTimer = () => {
  if (timerRunning) {
    stopTimer();
    return;
  }

  timerRunning = true;
  timerBtn.textContent = 'Stop Timer';
  timerBtn.classList.add('running');

  timerInterval = setInterval(() => {
    timerSeconds--;
    timerCount.textContent = timerSeconds;

    // Urgent state under 10 seconds
    if (timerSeconds <= 10) {
      timerDisplay.classList.add('urgent');
    }

    // Timer finished
    if (timerSeconds <= 0) {
      stopTimer();
      timerDisplay.textContent = '⏰ Time is up! Make your decision!';
    }
  }, 1000);
};

const stopTimer = () => {
  clearInterval(timerInterval);
  timerRunning = false;
  timerBtn.textContent = 'Start Timer';
  timerBtn.classList.remove('running');
};

const resetTimer = () => {
  stopTimer();
  timerSeconds = 30;
  timerCount.textContent = timerSeconds;
  timerDisplay.textContent = `⏱️ `;
  timerDisplay.innerHTML = `⏱️ <span id="timerCount">${timerSeconds}</span>s to decide`;
  timerDisplay.classList.remove('urgent');
};

timerBtn.addEventListener('click', startTimer);

// ===== VOTING SYSTEM =====

const vote = async (side) => {
  if (!currentDebate || hasVoted) return;

  try {
    const response = await fetch(`${API_BASE}/debate/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: currentDebate.id, side })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to record vote');

    hasVoted = true;
    stopTimer();

    // Disable vote buttons
    forVoteBtn.disabled = true;
    againstVoteBtn.disabled = true;

    if (side === 'for') {
      forVoteBtn.textContent = '✅ You voted this';
    } else {
      againstVoteBtn.textContent = '✅ You voted this';
    }

    // Update vote bars
    updateVoteBars(data.for_votes, data.against_votes);

    // Generate AI rebuttal for losing side
    const losingSide = side === 'for' ? 'against' : 'for';
    const losingArgument = side === 'for'
      ? currentDebate.against
      : currentDebate.for;

    generateRebuttal(losingSide, losingArgument);

    // Check voting badge
    checkBadges();

    loadStats();
    loadLeaderboard();

  } catch (error) {
    showError('Failed to record vote. Please try again.');
  }
};

forVoteBtn.addEventListener('click', () => vote('for'));
againstVoteBtn.addEventListener('click', () => vote('against'));

// ===== AI REBUTTAL =====

/**
 * After voting, generates an AI rebuttal for the losing side
 * Adds drama and keeps the debate going
 */
const generateRebuttal = async (side, argument) => {
  if (!currentDebate) return;

  try {
    const response = await fetch(`${API_BASE}/debate/rebuttal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: currentDebate.topic,
        side,
        argument
      })
    });

    const data = await response.json();
    if (!response.ok) return;

    rebuttalText.textContent = `"${data.rebuttal}"`;
    rebuttalSection.classList.remove('hidden');

  } catch (error) {
    // Rebuttal is optional — fail silently
    console.log('Rebuttal generation skipped');
  }
};

// ===== COMMENTS SYSTEM =====

const loadComments = async (debateId) => {
  commentsList.innerHTML = '<p class="loading-text">Loading comments...</p>';

  try {
    const response = await fetch(`${API_BASE}/comments/${debateId}`);
    const data = await response.json();

    if (!response.ok) throw new Error('Failed to load comments');

    if (data.length === 0) {
      commentsList.innerHTML = '<p class="no-comments">No comments yet. Be the first!</p>';
      return;
    }

    commentsList.innerHTML = data.map(comment => `
      <div class="comment-card">
        <div class="comment-meta">
          <span class="comment-username">👤 ${comment.username}</span>
          <span class="comment-date">${formatDate(comment.created_at)}</span>
        </div>
        <p class="comment-text">${comment.comment}</p>
      </div>
    `).join('');

  } catch (error) {
    commentsList.innerHTML = '<p class="no-comments">Failed to load comments.</p>';
  }
};

const submitComment = async () => {
  if (!currentDebate) return;

  const comment = commentInput.value.trim();
  const username = usernameInput.value.trim() || 'Anonymous';

  if (!comment) {
    showError('Please write a comment before posting.');
    return;
  }

  submitCommentBtn.disabled = true;
  submitCommentBtn.textContent = 'Posting...';

  try {
    const response = await fetch(`${API_BASE}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        debate_id: currentDebate.id,
        username,
        comment
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to post comment');

    commentInput.value = '';
    loadComments(currentDebate.id);
    loadStats();

  } catch (error) {
    showError('Failed to post comment. Please try again.');
  } finally {
    submitCommentBtn.disabled = false;
    submitCommentBtn.textContent = 'Post Comment';
  }
};

submitCommentBtn.addEventListener('click', submitComment);

// ===== DELETE DEBATE =====

/**
 * Deletes a debate and all its comments
 * Asks for confirmation before deleting
 */
const deleteDebate = async (id) => {
  if (!confirm('Are you sure you want to delete this debate?')) return;

  try {
    const response = await fetch(`${API_BASE}/debate/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to delete');

    // If current debate was deleted, hide debate section
    if (currentDebate && currentDebate.id === id) {
      debateSection.classList.add('hidden');
      currentDebate = null;
    }

    loadLeaderboard();
    loadTrending();
    loadStats();

  } catch (error) {
    showError('Failed to delete debate. Please try again.');
  }
};

window.deleteDebate = deleteDebate;

// ===== LEADERBOARD =====

const loadLeaderboard = async () => {
  try {
    const response = await fetch(`${API_BASE}/leaderboard`);
    const data = await response.json();

    if (!response.ok) throw new Error('Failed to load leaderboard');

    if (data.length === 0) {
      leaderboardList.innerHTML = '<p class="loading-text">No debates yet. Be the first!</p>';
      return;
    }

    leaderboardList.innerHTML = data.map((debate, index) => `
      <div class="leaderboard-item">
        <span class="leaderboard-rank">${index + 1}</span>
        <span class="leaderboard-topic" onclick="loadDebateFromLeaderboard('${debate.id}', '${debate.topic.replace(/'/g, "\\'")}')">
          ${debate.topic}
        </span>
        <span class="leaderboard-votes">👍 ${debate.for_votes} · 👎 ${debate.against_votes}</span>
        <button class="delete-btn" onclick="deleteDebate('${debate.id}')">🗑️ Delete</button>
      </div>
    `).join('');

  } catch (error) {
    leaderboardList.innerHTML = '<p class="loading-text">Failed to load leaderboard.</p>';
  }
};

const loadDebateFromLeaderboard = (id, topic) => {
  topicInput.value = topic;
  topicInput.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.loadDebateFromLeaderboard = loadDebateFromLeaderboard;
refreshBtn.addEventListener('click', loadLeaderboard);

// ===== TRENDING TOPICS =====

const loadTrending = async () => {
  try {
    const response = await fetch(`${API_BASE}/trending`);
    const data = await response.json();

    if (!response.ok) throw new Error('Failed to load trending');

    if (data.length === 0) {
      trendingList.innerHTML = '<p class="loading-text">No trending topics yet.</p>';
      return;
    }

    trendingList.innerHTML = data.map(debate => `
      <div class="trending-item" onclick="loadDebateFromLeaderboard('${debate.id}', '${debate.topic.replace(/'/g, "\\'")}')">
        ${debate.topic}
        <span class="trending-votes">${debate.total_votes} votes</span>
      </div>
    `).join('');

  } catch (error) {
    trendingList.innerHTML = '<p class="loading-text">Failed to load trending.</p>';
  }
};

// ===== STATS BAR =====

const loadStats = async () => {
  try {
    const response = await fetch(`${API_BASE}/stats`);
    const data = await response.json();

    if (!response.ok) return;

    statDebates.textContent = `💬 ${data.total_debates} Debates`;
    statVotes.textContent = `👍 ${data.total_votes} Votes`;
    statComments.textContent = `🗨️ ${data.total_comments} Comments`;
    statMostVoted.textContent = data.most_voted
      ? `🏆 ${data.most_voted.topic.substring(0, 30)}...`
      : '🏆 —';

  } catch (error) {
    console.log('Stats load failed silently');
  }
};

// ===== BADGES SYSTEM =====

/**
 * Checks and awards badges based on user activity
 * Badges are stored in localStorage
 * Available badges:
 * - First Debate: generated first debate
 * - Voter: cast first vote
 * - Debater: generated 5 debates
 */
const BADGES = {
  first_debate: { icon: '🎯', name: 'First Debate' },
  voter: { icon: '🗳️', name: 'Voter' },
  debater: { icon: '⚔️', name: 'Debater (5 debates)' }
};

const checkBadges = () => {
  const earned = JSON.parse(localStorage.getItem('debate-badges') || '[]');
  const debateCount = parseInt(localStorage.getItem('debate-count') || '0') + 1;
  localStorage.setItem('debate-count', debateCount);

  // First debate badge
  if (debateCount >= 1 && !earned.includes('first_debate')) {
    earned.push('first_debate');
    showBadgeNotification('first_debate');
  }

  // Debater badge — 5 debates
  if (debateCount >= 5 && !earned.includes('debater')) {
    earned.push('debater');
    showBadgeNotification('debater');
  }

  // Voter badge — after voting
  if (hasVoted && !earned.includes('voter')) {
    earned.push('voter');
    showBadgeNotification('voter');
  }

  localStorage.setItem('debate-badges', JSON.stringify(earned));
  renderBadges(earned);
};

const showBadgeNotification = (badgeKey) => {
  const badge = BADGES[badgeKey];
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed; bottom: 24px; right: 24px;
    background: var(--primary); color: white;
    padding: 16px 24px; border-radius: 16px;
    font-weight: 600; font-size: 0.95rem;
    box-shadow: 0 8px 32px rgba(108,99,255,0.4);
    z-index: 9999; animation: fadeIn 0.3s ease;
  `;
  notification.textContent = `🏅 New Badge: ${badge.icon} ${badge.name}`;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 4000);
};

const renderBadges = (earned) => {
  if (earned.length === 0) return;

  badgesSection.classList.remove('hidden');
  badgesList.innerHTML = earned.map(key => `
    <div class="badge-item">
      <span class="badge-icon">${BADGES[key].icon}</span>
      <span class="badge-name">${BADGES[key].name}</span>
    </div>
  `).join('');
};

// Load existing badges on page load
const savedBadges = JSON.parse(localStorage.getItem('debate-badges') || '[]');
if (savedBadges.length > 0) renderBadges(savedBadges);

// ===== INIT =====
// Load all data when page first opens
loadStats();
loadLeaderboard();
loadTrending();