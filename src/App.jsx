import { useState, useEffect, useRef } from 'react';
import {
  Play,
  Award,
  RotateCcw,
  Flame,
  BookOpen,
  Keyboard,
  Layers,
  X,
  Check,
  Eye,
  Image as ImageIcon,
  Lightbulb,
  Search,
  ArrowRightLeft,
  List,
  MessageCircle,
  LogOut,
  Plus,
  Settings,
  Trash2,
  Edit,
  Save,
  Download,
  Upload,
  Home,
  Sparkles,
  Loader2,
} from 'lucide-react';

// ==========================================
// 1. Default Data (Initial Deck)
// ==========================================
const TARGET_1900_DATA = [
  {
    id: 1801,
    spelling: 'deduce',
    meaning_jp: 'を推測する，演繹する',
    meaning_simple: '証拠を使って、答えを導き出す',
    phonetic: '/dɪˈduːs/',
    katakana: 'ディデュース',
    etymology: 'de(下へ) + duce(導く) → 結論を引き出す',
    scene: '🕵️‍♂️ 推理',
    story: '探偵が、現場に残された足跡から犯人を推測した。',
    example: 'The detective deduced the truth from the footprint.',
    example_jp: '探偵は足跡から真実を推測した。',
  },
  {
    id: 1802,
    spelling: 'simulate',
    meaning_jp: 'を模擬実験する；を装う；をまねる',
    meaning_simple: 'フリをする、マネをして試す',
    phonetic: '/ˈsɪmjʊleɪt/',
    katakana: 'シミュレイト',
    etymology: 'simul(似ている) + ate(する) → マネをする',
    scene: '🎮 実験・訓練',
    story: 'パイロットがフライトシミュレーターで飛行訓練をする。',
    example: 'We simulated a fire drill at school.',
    example_jp: '学校で避難訓練のシミュレーション（マネ）をした。',
  },
  {
    id: 1803,
    spelling: 'merge',
    meaning_jp: '合併する',
    meaning_simple: '２つが１つになる',
    phonetic: '/mɜːrdʒ/',
    katakana: 'マージ',
    etymology: 'mergere(沈める)',
    scene: '🏢 ビジネス',
    story: '会社が合併した。',
    example: 'Two companies merged.',
    example_jp: '２つの会社が合併した。',
  },
  ...Array.from({ length: 5 }, (_, i) => ({
    id: 1811 + i,
    spelling: `sample${1811 + i}`,
    meaning_jp: 'サンプル',
    meaning_simple: 'サンプル',
    phonetic: '/sæmpl/',
    katakana: 'サンプル',
    example: 'This is a sample.',
    example_jp: 'これはサンプルです。',
  })),
];

const DECK_COLOR_STYLES = {
  indigo: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-600',
  },
  gray: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
  },
  teal: {
    bg: 'bg-teal-100',
    text: 'text-teal-600',
  },
  amber: {
    bg: 'bg-amber-100',
    text: 'text-amber-600',
  },
};

const INITIAL_DECKS = [
  {
    id: 'deck_target1900',
    title: 'ターゲット1900 (1801~1900)',
    description: '大学入試・難関レベルの必須単語',
    words: TARGET_1900_DATA,
    color: 'indigo',
  },
];

const CONFUSING_WORDS = [
  { spelling: 'reduce', meaning_jp: '減らす' },
  { spelling: 'produce', meaning_jp: '生産する' },
  { spelling: 'induce', meaning_jp: '誘発する' },
  { spelling: 'seduce', meaning_jp: '誘惑する' },
  { spelling: 'assent', meaning_jp: '同意する' },
  { spelling: 'ascent', meaning_jp: '上昇' },
];

// ==========================================
// 2. Logic & Helpers
// ==========================================

const shuffle = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

let cachedVoices = [];
const loadVoices = () => {
  cachedVoices = window.speechSynthesis.getVoices();
  if (!cachedVoices.length) {
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
    };
  }
};

const getPreferredVoice = (lang = 'en-US') => {
  if (!cachedVoices.length) loadVoices();
  const exact = cachedVoices.find((v) => v.lang === lang);
  if (exact) return exact;
  const fallback = cachedVoices.find((v) => v.lang?.startsWith('en'));
  return fallback || null;
};

const speak = (text, lang = 'en-US', onEnd) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  if (!cachedVoices.length) loadVoices();
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  const voice = getPreferredVoice(lang);
  if (voice) utterance.voice = voice;
  utterance.rate = 1.0;
  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
};

// ==========================================
// 3. Components
// ==========================================

const ProgressBar = ({ current, total, label, isReview }) => (
  <div className="w-full mb-4">
    <div className="flex justify-between text-sm text-gray-500 mb-1 font-bold">
      <span className={isReview ? 'text-red-500 flex items-center gap-1' : ''}>
        {isReview && <Flame className="w-4 h-4 fill-red-500" />}
        {label}
      </span>
      <span>
        {current} / {total}
      </span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full transition-all duration-300 ${isReview ? 'bg-red-500' : 'bg-indigo-600'}`}
        style={{ width: `${Math.min(100, (current / total) * 100)}%` }}
      ></div>
    </div>
  </div>
);

const QuitModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-6 animate-in fade-in">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogOut className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">学習を中断しますか？</h3>
        <p className="text-gray-500 mb-6">現在の進捗は保存されません。</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition"
          >
            続ける
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition"
          >
            中断する
          </button>
        </div>
      </div>
    </div>
  );
};

const MistakeResolver = ({ isOpen, onClose, targetWord, onResolved, allWords }) => {
  const [status, setStatus] = useState('idle');
  const [userInput, setUserInput] = useState('');
  const [candidateWords, setCandidateWords] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setUserInput('');
      setCandidateWords([]);
      setSelectedWord(null);
    }
  }, [isOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    analyzeMistake(userInput);
  };

  const analyzeMistake = (input) => {
    setStatus('analyzing');
    const dictionary = [...allWords, ...CONFUSING_WORDS];
    const cleanInput = input.trim();

    const candidates = dictionary
      .map((word) => {
        let score = 0;
        const meanings = [word.meaning_jp, word.meaning_simple || ''].join(' ');
        if (meanings.includes(cleanInput)) score += 20;
        let matchCount = 0;
        for (const char of cleanInput) {
          if (meanings.includes(char)) matchCount += 1;
        }
        const matchRate = matchCount / cleanInput.length;
        if (matchRate >= 0.5) score += matchRate * 10;
        return { word, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.word);

    const uniqueCandidates = Array.from(new Map(candidates.map((item) => [item.spelling, item])).values());

    setTimeout(() => {
      if (uniqueCandidates.length > 0) {
        setCandidateWords(uniqueCandidates);
        if (uniqueCandidates.length === 1) {
          setSelectedWord(uniqueCandidates[0]);
          setStatus('comparison');
        } else {
          setStatus('list');
        }
      } else {
        setStatus('not_found');
      }
    }, 500);
  };

  const handleSelectCandidate = (word) => {
    setSelectedWord(word);
    setStatus('comparison');
  };

  const handleBackToList = () => {
    setStatus('list');
    setSelectedWord(null);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-6 animate-in fade-in">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl relative flex flex-col max-h-[80vh]">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 z-10">
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center justify-center gap-2 flex-shrink-0">
          <Search className="w-5 h-5" /> 勘違いチェック
        </h3>

        {status === 'idle' && (
          <form onSubmit={handleSearch} className="w-full">
            <p className="text-gray-600 mb-4 text-sm">何という意味だと思いましたか？</p>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="例: 減らす"
              className="w-full border-2 border-gray-300 rounded-xl p-3 mb-4 focus:border-indigo-600 outline-none text-center font-bold"
              autoFocus
            />
            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-indigo-700 transition">
              検索する
            </button>
          </form>
        )}

        {status === 'analyzing' && (
          <div className="py-12 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-indigo-600 font-bold animate-pulse">辞書を検索中...</p>
          </div>
        )}

        {status === 'list' && (
          <div className="flex-1 overflow-y-auto min-h-0 w-full text-left">
            <p className="text-xs text-gray-500 mb-2 text-center">該当する単語が複数見つかりました</p>
            <div className="flex flex-col gap-2">
              {candidateWords.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectCandidate(word)}
                  className="bg-gray-50 hover:bg-indigo-50 border border-gray-200 p-3 rounded-xl flex justify-between items-center transition-colors"
                >
                  <div>
                    <p className="font-bold text-gray-800">{word.spelling}</p>
                    <p className="text-xs text-gray-500">{word.meaning_jp}</p>
                  </div>
                  <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {status === 'comparison' && selectedWord && (
          <div className="animate-in zoom-in duration-300 flex-1 overflow-y-auto">
            {candidateWords.length > 1 && (
              <button
                onClick={handleBackToList}
                className="text-xs text-indigo-500 mb-2 underline text-left w-full flex items-center gap-1"
              >
                <List className="w-3 h-3" /> リストに戻る
              </button>
            )}
            <div className="bg-gray-100 p-3 rounded-xl mb-4 border-2 border-gray-300">
              <p className="text-xs text-gray-500 font-bold mb-1">あなたのイメージ</p>
              <p className="text-2xl font-black text-gray-800">{selectedWord.spelling}</p>
              <p className="text-gray-600 font-bold">{selectedWord.meaning_jp}</p>
            </div>
            <div className="flex items-center justify-center gap-2 my-2 text-indigo-600">
              <ArrowRightLeft className="w-5 h-5" />
              <span className="font-bold text-xs">VS</span>
            </div>
            <div className="bg-indigo-50 p-3 rounded-xl mb-4 border-2 border-indigo-200">
              <p className="text-xs text-indigo-400 font-bold mb-1">今回の正解</p>
              <p className="text-2xl font-black text-indigo-700">{targetWord.spelling}</p>
              <p className="text-indigo-900 font-bold">{targetWord.meaning_jp}</p>
            </div>
            <button onClick={onResolved} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl mt-auto">
              なるほど！次へ
            </button>
          </div>
        )}

        {status === 'not_found' && (
          <div className="py-4">
            <p className="text-gray-500 mb-4">
              "{userInput}" に該当する単語が
              <br />学習リストに見つかりませんでした。
            </p>
            <button onClick={onResolved} className="w-full bg-gray-200 text-gray-700 font-bold py-3 rounded-xl">
              次へ進む
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 4. Main App Component
// ==========================================

export default function App() {
  const [appPhase, setAppPhase] = useState('home');
  const [decks, setDecks] = useState(() => {
    if (typeof window === 'undefined') return INITIAL_DECKS;
    try {
      const saved = window.localStorage.getItem('espartan_decks_v2');
      if (!saved) return INITIAL_DECKS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_DECKS;
    } catch (error) {
      console.error('Failed to load decks from storage', error);
      return INITIAL_DECKS;
    }
  });
  const [currentDeck, setCurrentDeck] = useState(null);
  const [editingDeckId, setEditingDeckId] = useState(null);
  const [studyMode, setStudyMode] = useState('learn');
  const [completionMode, setCompletionMode] = useState('learn');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('espartan_decks_v2', JSON.stringify(decks));
    } catch (error) {
      console.error('Failed to save decks to storage', error);
    }
  }, [decks]);

  const [settings, setSettings] = useState({ start: 1, end: 25 });
  const [inputMethod, setInputMethod] = useState('flashcard');
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [blockWords, setBlockWords] = useState([]);
  const [blockIndex, setBlockIndex] = useState(0);
  const [blockPhase, setBlockPhase] = useState('pronounce');
  const [feedback, setFeedback] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isMistakeResolverOpen, setIsMistakeResolverOpen] = useState(false);
  const [mistakeResolverWord, setMistakeResolverWord] = useState(null);
  const [mistakeResolverContext, setMistakeResolverContext] = useState('learn');
  const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);
  const [testQueue, setTestQueue] = useState([]);
  const [testIndex, setTestIndex] = useState(0);
  const [testStreak, setTestStreak] = useState(0);
  const [testFeedback, setTestFeedback] = useState(null);
  const [testInputValue, setTestInputValue] = useState('');
  const [testAttempt, setTestAttempt] = useState(1);
  const [testWrongWord, setTestWrongWord] = useState(null);
  const [isTestCardFlipped, setIsTestCardFlipped] = useState(false);

  const wrongTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const testInputRef = useRef(null);
  const testResetTimeoutRef = useRef(null);

  const handleCreateDeck = () => {
    const newDeck = {
      id: `deck_${Date.now()}`,
      title: '新規単語帳',
      description: '新しい単語セット',
      words: [],
      color: 'gray',
    };
    setDecks([...decks, newDeck]);
    setEditingDeckId(newDeck.id);
    setAppPhase('deck_editor');
  };

  const handleDeleteDeck = (deckId) => {
    if (window.confirm('本当にこの単語帳を削除しますか？')) {
      setDecks(decks.filter((d) => d.id !== deckId));
    }
  };

  const handleSaveDeck = (updatedDeck) => {
    setDecks(decks.map((d) => (d.id === updatedDeck.id ? updatedDeck : d)));
    setAppPhase('admin');
  };

  const handleSelectDeck = (deck) => {
    setCurrentDeck(deck);
    if (deck.words.length > 0) {
      const minId = Math.min(...deck.words.map((w) => w.id));
      const maxId = Math.max(...deck.words.map((w) => w.id));
      setSettings({ start: minId, end: Math.min(minId + 24, maxId) });
    } else {
      setSettings({ start: 0, end: 0 });
    }
    setAppPhase('setup');
  };

  const handleStudyModeChange = (mode) => {
    setStudyMode(mode);
  };

  const startTestSession = (words) => {
    const prepared = shuffle(words);
    setTestQueue(prepared);
    setTestIndex(0);
    setTestStreak(0);
    setTestFeedback(null);
    setTestInputValue('');
    setTestWrongWord(null);
    setTestAttempt(1);
    setIsTestCardFlipped(false);
    setAppPhase('test');
  };

  const startCourse = () => {
    if (!currentDeck || currentDeck.words.length === 0) {
      alert('学習する単語がありません。管理画面で単語を追加してください。');
      return;
    }
    const targetWords = currentDeck.words.filter((w) => w.id >= settings.start && w.id <= settings.end);
    if (targetWords.length === 0) {
      alert('指定された範囲に単語が見つかりません。IDを確認してください。');
      return;
    }
    setQueue(targetWords);
    if (studyMode === 'test') {
      startTestSession(targetWords);
      return;
    }
    setCurrentIndex(0);
    loadBlock(0, targetWords);
    setAppPhase('learning');
  };

  const restartTestRun = () => {
    setTestQueue((prev) => shuffle([...prev]));
    setTestIndex(0);
    setTestStreak(0);
    setTestFeedback(null);
    setTestWrongWord(null);
    setTestInputValue('');
    setTestAttempt((prev) => prev + 1);
    setIsTestCardFlipped(false);
  };

  const handleTestCorrect = () => {
    setTestFeedback(null);
    setTestWrongWord(null);
    setTestInputValue('');
    setIsTestCardFlipped(false);
    setTestStreak((prev) => prev + 1);
    const nextIndex = testIndex + 1;
    if (nextIndex >= testQueue.length) {
      setCompletionMode('test');
      setAppPhase('complete');
    } else {
      setTestIndex(nextIndex);
    }
  };

  const handleTestWrong = (currentWord) => {
    setTestFeedback('wrong');
    setTestStreak(0);
    setTestWrongWord(currentWord);
    setIsTestCardFlipped(false);
    setTestInputValue('');
    if (testResetTimeoutRef.current) clearTimeout(testResetTimeoutRef.current);
    testResetTimeoutRef.current = setTimeout(() => {
      restartTestRun();
    }, 2500);
  };

  const handleTestSelfJudge = (result) => {
    const currentWord = testQueue[testIndex];
    if (!currentWord) return;
    if (result === 'correct') handleTestCorrect();
    else handleTestWrong(currentWord);
  };

  const handleTestSubmit = (e) => {
    e.preventDefault();
    if (!testQueue[testIndex]) return;
    const currentWord = testQueue[testIndex];
    const cleanInput = testInputValue.trim();
    const isCorrect = cleanInput.length > 0 && currentWord.meaning_jp.includes(cleanInput);

    if (isCorrect) handleTestCorrect();
    else handleTestWrong(currentWord);
  };

  const handleQuitRequest = () => setIsQuitModalOpen(true);
  const confirmQuit = () => {
    setIsQuitModalOpen(false);
    if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current);
    setAppPhase('setup');
  };
  const cancelQuit = () => setIsQuitModalOpen(false);

  const loadBlock = (startIndex, currentQueue) => {
    const slice = currentQueue.slice(startIndex, startIndex + 5);
    if (slice.length === 0) {
      setCompletionMode('learn');
      setAppPhase('complete');
      return;
    }
    setBlockWords(shuffle(slice));
    setBlockIndex(0);
    setBlockPhase('meaning');
    setFeedback(null);
    setInputValue('');
    setIsCardFlipped(false);
  };

  const checkAnswer = (input) => {
    const currentWord = blockWords[blockIndex];
    const targetMeaning = currentWord.meaning_jp;
    const cleanInput = input.trim();
    let isCorrect = false;
    if (cleanInput.length > 0 && targetMeaning.includes(cleanInput)) isCorrect = true;

    if (isCorrect) handleCorrect();
    else handleWrong();
  };

  const handleKeyboardSubmit = (e) => {
    e.preventDefault();
    checkAnswer(inputValue);
  };
  const handleFlip = () => setIsCardFlipped(true);
  const handleSelfJudge = (result) => {
    if (result === 'correct') handleCorrect();
    else handleWrong();
  };

  const handleOpenMistakeResolver = (word, context = 'learn') => {
    if (!word) return;
    if (context === 'learn') {
      if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current);
    } else if (context === 'test') {
      if (testResetTimeoutRef.current) clearTimeout(testResetTimeoutRef.current);
    }
    setMistakeResolverWord(word);
    setMistakeResolverContext(context);
    setIsMistakeResolverOpen(true);
  };

  const handleMistakeResolverClose = () => {
    setIsMistakeResolverOpen(false);
    const context = mistakeResolverContext;
    setMistakeResolverWord(null);
    setMistakeResolverContext('learn');
    if (context === 'learn') {
      handleWrong(true);
    } else {
      restartTestRun();
    }
  };

  const handleCorrect = () => {
    setFeedback('correct');
    setTimeout(nextInBlock, 1000);
  };

  const handleWrong = (skipDelay = false) => {
    setFeedback('wrong');
    if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current);
    const delay = skipDelay ? 100 : 3000;
    wrongTimeoutRef.current = setTimeout(() => {
      setFeedback(null);
      setInputValue('');
      setIsCardFlipped(false);
      setBlockWords((prev) => shuffle([...prev]));
      setBlockIndex(0);
    }, delay);
  };

  const nextInBlock = () => {
    setFeedback(null);
    setInputValue('');
    setIsCardFlipped(false);
    if (blockIndex < blockWords.length - 1) {
      setBlockIndex((prev) => prev + 1);
    } else {
      checkNextPhase();
    }
  };

  const checkNextPhase = () => {
    if (appPhase === 'review') {
      const reviewEndIndex = currentIndex;
      if (reviewEndIndex >= queue.length) {
        setCompletionMode('learn');
        setAppPhase('complete');
      } else {
        setAppPhase('learning');
        loadBlock(currentIndex, queue);
      }
      return;
    }
    const nextGlobalIndex = currentIndex + 5;
    const isReviewTime = (nextGlobalIndex > 0 && nextGlobalIndex % 25 === 0) || nextGlobalIndex >= queue.length;
    if (isReviewTime) {
      startReviewPhase(nextGlobalIndex);
    } else {
      setCurrentIndex(nextGlobalIndex);
      loadBlock(nextGlobalIndex, queue);
    }
  };

  const startReviewPhase = (nextTotalIndex) => {
    let startIndex = nextTotalIndex - 25;
    if (startIndex < 0) startIndex = 0;
    const reviewTarget = queue.slice(startIndex, nextTotalIndex);
    setAppPhase('review');
    setBlockWords(shuffle(reviewTarget));
    setBlockIndex(0);
    setFeedback(null);
    setInputValue('');
    setIsCardFlipped(false);
    setCurrentIndex(nextTotalIndex);
  };

  useEffect(() => {
    if (blockWords[blockIndex]) {
      if (['keyboard', 'flashcard'].includes(inputMethod)) {
        const timer = setTimeout(() => {
          speak(blockWords[blockIndex].spelling, 'en-US');
        }, 300);
        if (inputMethod === 'keyboard') {
          setInputValue('');
          setTimeout(() => {
            inputRef.current?.focus();
          }, 100);
        }
        return () => clearTimeout(timer);
      }
    }
    return undefined;
  }, [blockIndex, blockWords, inputMethod]);

  useEffect(() => {
    if (appPhase !== 'test') return undefined;
    if (!testQueue[testIndex]) return undefined;
    const speakTimer = setTimeout(() => {
      speak(testQueue[testIndex].spelling, 'en-US');
    }, 300);
    let focusTimer;
    if (inputMethod === 'keyboard') {
      focusTimer = setTimeout(() => {
        testInputRef.current?.focus();
      }, 100);
    }
    return () => {
      clearTimeout(speakTimer);
      if (focusTimer) clearTimeout(focusTimer);
    };
  }, [appPhase, testIndex, testQueue, inputMethod]);

  useEffect(() => () => {
    if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current);
  }, []);

  useEffect(() => () => {
    if (testResetTimeoutRef.current) clearTimeout(testResetTimeoutRef.current);
  }, []);

  const renderMistakeResolver = currentDeck ? (
    <MistakeResolver
      isOpen={isMistakeResolverOpen}
      onClose={handleMistakeResolverClose}
      targetWord={mistakeResolverWord}
      onResolved={handleMistakeResolverClose}
      allWords={currentDeck.words}
    />
  ) : null;

  if (appPhase === 'home') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 font-sans">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-8 mt-4">
            <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
              <Award className="w-8 h-8 text-indigo-600" /> E-Spartan
            </h1>
            <button
              onClick={() => setAppPhase('admin')}
              className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 text-gray-600"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <div className="grid gap-4">
            {decks.map((deck) => (
              <div
                key={deck.id}
                onClick={() => handleSelectDeck(deck)}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                      {deck.title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">{deck.description}</p>
                  </div>
                  {(() => {
                    const palette = DECK_COLOR_STYLES[deck.color] || DECK_COLOR_STYLES.indigo;
                    return (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${palette.bg} ${palette.text}`}>
                        <Play className="w-5 h-5 fill-current" />
                      </div>
                    );
                  })()}
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-400">
                  <Layers className="w-4 h-4" />
                  {deck.words.length} words
                </div>
              </div>
            ))}

            <button
              onClick={() => setAppPhase('admin')}
              className="bg-gray-100 border-2 border-dashed border-gray-300 p-5 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-200 hover:border-gray-400 transition-all"
            >
              <Plus className="w-8 h-8 mb-1" />
              <span className="font-bold text-sm">単語帳を追加・管理</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (appPhase === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 font-sans">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <button onClick={() => setAppPhase('home')} className="text-gray-500 hover:text-gray-800">
              <ArrowRightLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">単語帳管理</h2>
          </div>

          <div className="space-y-4">
            {decks.map((deck) => (
              <div key={deck.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-800">{deck.title}</h3>
                  <p className="text-xs text-gray-500">{deck.words.length} words</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingDeckId(deck.id);
                      setAppPhase('deck_editor');
                    }}
                    className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDeck(deck.id)}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleCreateDeck}
            className="w-full mt-6 bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> 新規作成
          </button>
        </div>
      </div>
    );
  }

  if (appPhase === 'deck_editor') {
    const deckToEdit = decks.find((d) => d.id === editingDeckId);
    return <DeckEditor initialDeck={deckToEdit} onSave={handleSaveDeck} onCancel={() => setAppPhase('admin')} />;
  }

  if (appPhase === 'setup') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-800">
        <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full relative">
          <button onClick={() => setAppPhase('home')} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600">
            <Home className="w-6 h-6" />
          </button>

          <div className="flex justify-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <Award className="w-10 h-10 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-center mb-1">{currentDeck.title}</h1>
          <p className="text-gray-500 text-center text-xs mb-6">{currentDeck.description}</p>

          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleStudyModeChange('learn')}
                className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 ${studyMode === 'learn' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-400'}`}
              >
                <BookOpen className="w-6 h-6" />
                <span className="text-sm font-bold">通常学習</span>
              </button>
              <button
                onClick={() => handleStudyModeChange('test')}
                className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 ${studyMode === 'test' ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200 text-gray-400'}`}
              >
                <Flame className="w-6 h-6" />
                <span className="text-sm font-bold">テストモード</span>
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">
              {studyMode === 'test'
                ? 'テストモードでは、選んだ回答方法で指定範囲すべてを連続正解するまで終了できません。'
                : '通常学習では5問ブロック + 復習で進みます。'}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Answer Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setInputMethod('flashcard')}
                className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 ${inputMethod === 'flashcard' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-400'}`}
              >
                <Layers className="w-6 h-6" />
                <span className="text-sm font-bold">Flashcard</span>
              </button>
              <button
                onClick={() => setInputMethod('keyboard')}
                className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 ${inputMethod === 'keyboard' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-400'}`}
              >
                <Keyboard className="w-6 h-6" />
                <span className="text-sm font-bold">Type (JP)</span>
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">
              {inputMethod === 'flashcard'
                ? 'フラッシュカード：答えを見て自分で正誤を判定します。'
                : 'キーボード入力：英単語に対して日本語を入力します。'}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Range (ID)</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={settings.start}
                onChange={(e) => setSettings({ ...settings, start: Number(e.target.value) })}
                className="w-full border rounded-lg p-3 text-center"
              />
              <span className="text-gray-400">~</span>
              <input
                type="number"
                value={settings.end}
                onChange={(e) => setSettings({ ...settings, end: Number(e.target.value) })}
                className="w-full border rounded-lg p-3 text-center"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">Total words in deck: {currentDeck.words.length}</p>
          </div>
          <button
            onClick={startCourse}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Play className="w-5 h-5" /> Start
          </button>
        </div>
      </div>
    );
  }

  if (appPhase === 'test') {
    const currentWord = testQueue[testIndex];
    const isTestKeyboard = inputMethod !== 'flashcard';
    const badgeClasses = isTestKeyboard ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-600';
    const badgeLabel = isTestKeyboard ? 'keyboard' : 'flashcard';
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 font-sans">
        <QuitModal isOpen={isQuitModalOpen} onClose={cancelQuit} onConfirm={confirmQuit} />
        {renderMistakeResolver}
        <div className="w-full max-w-md mt-4">
          <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
            <span>Attempt #{testAttempt}</span>
            <span>
              連続正解 {testStreak}/{testQueue.length}
            </span>
          </div>
          <ProgressBar current={testIndex + 1} total={testQueue.length} label="Test Progress" isReview />
          <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
            <span className="font-bold flex items-center gap-2 text-red-600">
              <Flame className="w-5 h-5" />
              PERFECT TEST MODE
            </span>
            <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${badgeClasses}`}>{badgeLabel}</span>
          </div>
        </div>

        <div className="mt-6 w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden min-h-[520px] relative flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <span className="text-gray-400 text-sm mb-2">ID: {currentWord?.id}</span>
            <h2 className="text-6xl font-black text-gray-800 mb-2 tracking-tight">{currentWord?.spelling}</h2>
            <div className="mb-6">
              <p className="text-2xl font-bold text-indigo-600 mb-1">{currentWord?.katakana}</p>
              <p className="text-gray-400 text-sm font-mono">{currentWord?.phonetic}</p>
            </div>

            {isTestKeyboard ? (
              <form onSubmit={handleTestSubmit} className="w-full flex flex-col gap-3 animate-in fade-in">
                <input
                  ref={testInputRef}
                  type="text"
                  value={testInputValue}
                  onChange={(e) => setTestInputValue(e.target.value)}
                  placeholder="日本語で入力..."
                  className="w-full border-2 border-red-200 rounded-xl p-4 text-center text-xl font-bold focus:outline-none focus:border-red-500"
                  autoComplete="off"
                />
                <button type="submit" className="bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition">
                  判定する
                </button>
              </form>
            ) : (
              <div className="w-full animate-in fade-in">
                {!isTestCardFlipped ? (
                  <button
                    onClick={() => setIsTestCardFlipped(true)}
                    className="w-full h-32 border-4 border-dashed border-indigo-200 rounded-2xl flex flex-col items-center justify-center text-indigo-400 hover:bg-indigo-50 hover:border-indigo-400 transition-all"
                  >
                    <Eye className="w-10 h-10 mb-2" />
                    <span className="font-bold text-lg">答えを表示する</span>
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-left">
                      <p className="text-sm text-indigo-400 font-bold mb-1">MEANING</p>
                      <p className="text-2xl font-bold text-indigo-800">{currentWord?.meaning_jp}</p>
                      {currentWord?.meaning_simple && (
                        <p className="text-indigo-600 mt-2 text-sm font-bold">💡 {currentWord.meaning_simple}</p>
                      )}
                    </div>
                    {currentWord?.example && (
                      <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-left">
                        <p className="text-xs text-green-600 font-bold mb-1 flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" /> EXAMPLE
                        </p>
                        <p className="text-lg font-medium text-gray-800">{currentWord.example}</p>
                        <p className="text-xs text-gray-500 mt-1">{currentWord.example_jp}</p>
                      </div>
                    )}
                    {(currentWord?.etymology || currentWord?.scene) && (
                      <div className="grid grid-cols-2 gap-2 text-left">
                        {currentWord?.etymology && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-400 font-bold flex items-center gap-1">
                              <Lightbulb className="w-3 h-3" /> ETYMOLOGY
                            </p>
                            <p className="text-xs text-gray-600 mt-1">{currentWord.etymology}</p>
                          </div>
                        )}
                        {currentWord?.scene && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-400 font-bold flex items-center gap-1">
                              <Layers className="w-3 h-3" /> SCENE
                            </p>
                            <p className="text-xs text-gray-600 mt-1">{currentWord.scene}</p>
                          </div>
                        )}
                      </div>
                    )}
                    <a
                      href={`https://www.google.com/search?tbm=isch&q=${currentWord?.spelling}+meaning`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-indigo-500 transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" /> Google画像検索
                    </a>
                    <div className="grid grid-cols-2 gap-4 h-32">
                      <button
                        onClick={() => handleTestSelfJudge('wrong')}
                        className="bg-red-100 hover:bg-red-200 text-red-700 rounded-2xl flex flex-col items-center justify-center transition-transform active:scale-95 border-2 border-red-200"
                      >
                        <X className="w-8 h-8 mb-1" />
                        <span className="font-bold">分からなかった</span>
                      </button>
                      <button
                        onClick={() => handleTestSelfJudge('correct')}
                        className="bg-green-100 hover:bg-green-200 text-green-700 rounded-2xl flex flex-col items-center justify-center transition-transform active:scale-95 border-2 border-green-200"
                      >
                        <Check className="w-8 h-8 mb-1" />
                        <span className="font-bold">分かった！</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {testFeedback === 'wrong' && (
              <div className="mt-6 w-full bg-red-50 border border-red-200 rounded-2xl p-4 text-left animate-in fade-in">
                <p className="text-red-500 text-xs font-bold mb-1">正解</p>
                <p className="text-2xl font-black text-red-600">{testWrongWord?.meaning_jp}</p>
                <p className="text-xs text-red-400 mt-2">全単語を連続正解するまでテストは終了しません。順番をシャッフルして最初からやり直します。</p>
                <button
                  onClick={() => handleOpenMistakeResolver(testWrongWord, 'test')}
                  className="mt-3 w-full bg-white border-2 border-red-200 text-red-600 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-red-50 transition shadow-sm"
                >
                  <Search className="w-4 h-4" />勘違いをチェック
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-[11px] text-gray-400 mt-4 text-center">
          間違えると即リセット。集中してパーフェクトを目指しましょう！
        </p>
      </div>
    );
  }

  if (appPhase === 'complete') {
    const isTestClear = completionMode === 'test';
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isTestClear ? 'bg-red-50' : 'bg-green-50'}`}>
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4">
          <Award className={`w-20 h-20 mx-auto ${isTestClear ? 'text-red-500' : 'text-green-500'}`} />
          <h2 className="text-3xl font-bold text-gray-800">
            {isTestClear ? 'Perfect Streak Achieved!' : 'Mission Complete!'}
          </h2>
          <p className="text-sm text-gray-500">
            {isTestClear ? '指定範囲のすべてを連続正解しました。最強の記憶力です。' : 'ブロック学習とレビューをやり切りました。よく頑張りました！'}
          </p>
          <button onClick={() => setAppPhase('home')} className={`w-full ${isTestClear ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'} text-white font-bold py-3 rounded-xl`}>
            ホームへ戻る
          </button>
        </div>
      </div>
    );
  }

  const currentWord = blockWords[blockIndex];
  const isWrong = feedback === 'wrong';
  const isReview = appPhase === 'review';
  const showMeaning = inputMethod === 'flashcard' && isCardFlipped;

  return (
    <div
      className={`min-h-screen flex flex-col items-center p-4 font-sans transition-colors duration-500 ${isReview ? 'bg-orange-50' : 'bg-gray-100'}`}
    >
      <QuitModal isOpen={isQuitModalOpen} onClose={cancelQuit} onConfirm={confirmQuit} />
      {renderMistakeResolver}

      <div className="w-full max-w-md mt-4">
        <div className="flex justify-end mb-2">
          <button
            onClick={handleQuitRequest}
            className="text-gray-400 hover:text-red-500 text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <LogOut className="w-4 h-4" /> 中断
          </button>
        </div>
        <ProgressBar
          current={blockIndex + 1}
          total={blockWords.length}
          label={isReview ? '25-Word Challenge' : 'Block Progress'}
          isReview={isReview}
        />
        <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
          <span className={`font-bold flex items-center gap-2 ${isReview ? 'text-red-600' : 'text-indigo-600'}`}>
            {isReview ? <Flame className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
            {isReview ? 'SPARTAN REVIEW' : 'Meaning Check'}
          </span>
          <span className="text-xs font-bold uppercase bg-gray-100 px-2 py-1 rounded text-gray-500">{inputMethod}</span>
        </div>
      </div>

      <div
        className={`mt-6 w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden min-h-[550px] relative flex flex-col transition-colors duration-300 ${isWrong ? 'bg-red-50 border-2 border-red-200' : ''}`}
      >
        {isWrong && (
          <div className="absolute top-4 right-4 text-orange-500 animate-spin-slow z-10">
            <RotateCcw className="w-8 h-8" />
          </div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center w-full relative">
          <span className="text-gray-400 text-sm mb-2">ID: {currentWord?.id}</span>
          <h2 className="text-6xl font-black text-gray-800 mb-2 tracking-tight">{currentWord?.spelling}</h2>
          <div className="mb-6">
            <p className="text-2xl font-bold text-indigo-600 mb-1">{currentWord?.katakana}</p>
            <p className="text-gray-400 text-sm font-mono">{currentWord?.phonetic}</p>
          </div>

          {showMeaning && (
            <div className="mb-4 animate-in fade-in zoom-in duration-300 w-full">
              <div className="bg-indigo-50 p-4 rounded-xl mb-4 border border-indigo-100">
                <p className="text-sm text-indigo-400 font-bold mb-1">MEANING</p>
                <p className="text-2xl font-bold text-indigo-800">{currentWord?.meaning_jp}</p>
                {currentWord?.meaning_simple && (
                  <p className="text-indigo-600 mt-2 text-sm font-bold">💡 {currentWord.meaning_simple}</p>
                )}
              </div>
              {currentWord?.example && (
                <div className="bg-green-50 p-3 rounded-lg mt-2 border border-green-100 text-left">
                  <p className="text-xs text-green-600 font-bold mb-1 flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" /> EXAMPLE
                  </p>
                  <p className="text-lg font-medium text-gray-800">{currentWord.example}</p>
                  <p className="text-xs text-gray-500 mt-1">{currentWord.example_jp}</p>
                </div>
              )}
              {(currentWord?.etymology || currentWord?.scene) && (
                <div className="grid grid-cols-2 gap-2 text-left mt-2">
                  {currentWord.etymology && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-400 font-bold flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" /> ETYMOLOGY
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{currentWord.etymology}</p>
                    </div>
                  )}
                  {currentWord.scene && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-400 font-bold flex items-center gap-1">
                        <Layers className="w-3 h-3" /> SCENE
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{currentWord.scene}</p>
                    </div>
                  )}
                </div>
              )}
              <a
                href={`https://www.google.com/search?tbm=isch&q=${currentWord?.spelling}+meaning`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-indigo-500 transition-colors"
              >
                <ImageIcon className="w-4 h-4" /> Google画像検索
              </a>
            </div>
          )}

          {!isWrong && (
            <div className="w-full mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {inputMethod === 'flashcard' && (
                <div className="w-full">
                  {!isCardFlipped ? (
                    <button
                      onClick={handleFlip}
                      className="w-full h-32 border-4 border-dashed border-indigo-200 rounded-2xl flex flex-col items-center justify-center text-indigo-400 hover:bg-indigo-50 hover:border-indigo-400 transition-all"
                    >
                      <Eye className="w-10 h-10 mb-2" />
                      <span className="font-bold text-lg">Tap to Show Meaning</span>
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 h-32">
                      <button
                        onClick={() => handleSelfJudge('wrong')}
                        className="bg-red-100 hover:bg-red-200 text-red-700 rounded-2xl flex flex-col items-center justify-center transition-transform active:scale-95 border-2 border-red-200"
                      >
                        <X className="w-8 h-8 mb-1" />
                        <span className="font-bold">分からなかった</span>
                        <span className="text-xs opacity-70">やり直し</span>
                      </button>
                      <button
                        onClick={() => handleSelfJudge('correct')}
                        className="bg-green-100 hover:bg-green-200 text-green-700 rounded-2xl flex flex-col items-center justify-center transition-transform active:scale-95 border-2 border-green-200"
                      >
                        <Check className="w-8 h-8 mb-1" />
                        <span className="font-bold">分かった</span>
                        <span className="text-xs opacity-70">次へ</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
              {inputMethod === 'keyboard' && (
                <form onSubmit={handleKeyboardSubmit} className="flex flex-col gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="日本語で入力..."
                    className="w-full border-2 border-indigo-200 rounded-xl p-4 text-center text-xl font-bold focus:outline-none focus:border-indigo-600"
                    autoComplete="off"
                    disabled={feedback === 'correct'}
                  />
                  <button type="submit" className="bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition">
                    Check
                  </button>
                </form>
              )}
              {feedback === 'correct' && <p className="text-green-600 font-bold mt-4 animate-bounce">Correct!</p>}
            </div>
          )}

          {isWrong && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl animate-in fade-in slide-in-from-bottom-2 w-full">
              <p className="text-red-500 font-bold text-sm mb-1">正解</p>
              <p className="text-red-700 text-xl font-bold mb-4">{currentWord?.meaning_jp}</p>
              <button
                onClick={() => handleOpenMistakeResolver(currentWord, 'learn')}
                className="w-full bg-white border-2 border-red-200 text-red-600 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-red-50 transition shadow-sm"
              >
                <Search className="w-4 h-4" />勘違いをチェック
              </button>
              <p className="text-xs text-red-400 mt-2">ブロックの最初からやり直し！</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
const DeckEditor = ({ initialDeck, onSave, onCancel }) => {
  const [deck, setDeck] = useState(initialDeck);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialDeck) setDeck(initialDeck);
  }, [initialDeck]);

  if (!initialDeck || !deck) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center space-y-4">
          <p className="text-gray-600 font-bold">単語帳の読み込み中...</p>
          <button
            onClick={onCancel}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  const handleJsonImport = () => {
    try {
      const data = JSON.parse(jsonInput);
      if (Array.isArray(data)) {
        if (data.some((w) => !w.id || !w.spelling || !w.meaning_jp)) {
          throw new Error('Invalid data format. id, spelling, meaning_jp are required.');
        }
        setDeck({ ...deck, words: [...deck.words, ...data] });
        alert(`${data.length} words imported successfully!`);
      } else if (data && typeof data === 'object' && Array.isArray(data.words)) {
        setDeck({
          ...deck,
          title: data.title || deck.title,
          description: data.description || deck.description,
          color: data.color || deck.color,
          words: data.words,
        });
        alert('Deck imported successfully!');
      } else {
        throw new Error('Invalid data format. Provide an array or deck object.');
      }
      setJsonInput('');
      setJsonError(null);
    } catch (e) {
      setJsonError(e.message);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === 'string') setJsonInput(text);
    };
    reader.readAsText(file);
  };

  const handleExportDeck = () => {
    const payload = {
      title: deck.title,
      description: deck.description,
      color: deck.color,
      words: deck.words,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTitle = deck.title?.replace(/[^a-z0-9_-]/gi, '_') || 'deck';
    link.href = url;
    link.download = `${safeTitle}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const handleAiImport = async () => {
    if (!jsonInput.trim()) return;
    setIsGenerating(true);
    setJsonError(null);

    try {
      let inputWords = [];
      try {
        inputWords = JSON.parse(jsonInput);
      } catch (e) {
        throw new Error('まずは正しいJSON形式（配列）で入力してください。必須項目: id, spelling');
      }

      if (!Array.isArray(inputWords)) throw new Error('データは配列形式（[]）である必要があります。');

      const apiKey = '';
      const prompt = `
        あなたは英単語学習アプリのデータジェネレーターです。
        以下の入力データにある英単語について、不足している情報を補完し、完全なJSONデータを生成してください。

        【必須要件】
        - 入力された id, spelling, meaning_jp は維持する（meaning_jpがない場合は生成する）。
        - 以下のフィールドを必ず含めること:
          - meaning_simple: 小学生でもわかる簡単な意味（ひらがな多め、直感的）
          - phonetic: 発音記号
          - katakana: カタカナ読み
          - etymology: 語源（簡潔に。"接頭辞 + 語根 → 意味" の形式推奨）
          - scene: その単語が使われる場面（絵文字1つ + 場面名。例: 🏢 ビジネス）
          - story: その場面の短いストーリー（主語と目的語を入れる。例: "部長が会議で計画を提案した。"）
          - example: 簡単な英語例文
          - example_jp: 例文の和訳
        - 出力は JSON 配列のみ。Markdown記法は不要。

        【入力データ】
        ${JSON.stringify(inputWords)}
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        },
      );

      if (!response.ok) throw new Error('AI生成に失敗しました。時間をおいて再度お試しください。');

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) throw new Error('AIからの応答が空でした。');

      const completedWords = JSON.parse(generatedText);

      setDeck({ ...deck, words: [...deck.words, ...completedWords] });
      setJsonInput('');
    } catch (e) {
      setJsonError(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteWord = (wordId) => {
    if (window.confirm('この単語を削除しますか？')) {
      setDeck({ ...deck, words: deck.words.filter((w) => w.id !== wordId) });
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">単語帳の編集</h2>
          <div className="flex gap-2">
            <button onClick={onCancel} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              キャンセル
            </button>
            <button
              onClick={handleExportDeck}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> JSON書き出し
            </button>
            <button
              onClick={() => onSave(deck)}
              className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> 保存
            </button>
          </div>
        </div>

        <div className="mb-8 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">タイトル</label>
            <input
              type="text"
              value={deck.title}
              onChange={(e) => setDeck({ ...deck, title: e.target.value })}
              className="w-full border-2 border-gray-200 rounded-lg p-3"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">説明</label>
            <input
              type="text"
              value={deck.description}
              onChange={(e) => setDeck({ ...deck, description: e.target.value })}
              className="w-full border-2 border-gray-200 rounded-lg p-3"
            />
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
          <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Upload className="w-5 h-5" /> 共有 / インポート
          </h3>
          <p className="text-xs text-gray-500 mb-2">
            手入力のほか、JSONファイルを読み込んだり、書き出したJSONを友だちに渡して共有できます。Deck JSONにはタイトルや説明も含まれます。
          </p>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='[{"id": 1901, "spelling": "modify", "meaning_jp": "修正する"}]'
            className="w-full h-32 border border-gray-300 rounded-lg p-3 font-mono text-xs mb-3 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          {jsonError && <p className="text-red-500 text-xs font-bold mb-3">{jsonError}</p>}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleJsonImport}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition"
            >
              通常インポート
            </button>
            <button
              onClick={handleAiImport}
              disabled={isGenerating}
              className={`bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-200 transition flex items-center gap-2 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              AI完全補完インポート
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition"
            >
              ファイルから読み込む
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileUpload} />
        </div>

        <div>
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <List className="w-5 h-5" /> 登録済み単語 ({deck.words.length})
          </h3>
          {deck.words.length === 0 ? (
            <p className="text-center text-gray-400 py-8">まだ単語がありません。</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {deck.words
                .slice()
                .sort((a, b) => a.id - b.id)
                .map((word) => (
                  <div
                    key={word.id}
                    className="flex items-center justify-between bg-white border border-gray-100 p-3 rounded-lg shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-gray-400 w-10">{word.id}</span>
                      <div>
                        <p className="font-bold text-gray-800">{word.spelling}</p>
                        <p className="text-xs text-gray-500">{word.meaning_jp}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteWord(word.id)} className="text-gray-300 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
