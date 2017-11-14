let dictionary = {};
const wordsCorrectlySaid = {};
const definitions = [
  'alardear - to brag',
  'apestar - to stink',
  'araña - spider',
  'bostezar - to yawn',
  'budín - pudding',
  'burbuja - bubble',
  'cacahuete - peanut',
  'calabaza - pumpkin',
  'cuero - leather',
  'desafinar - to sing out of tune',
  'desvariar - to talk nonsense',
  'endiablado/a - mischievous',
  'esmalte de uñas - nail polish',
  'estar llanto - to be crying',
  'fantasma - ghost',
  'flirtear - to flirt',
  'guiñar - to wink',
  'llave - key',
  'mago/a - wizard',
  'estoy avergonzado - i am embarrassed',
  'mentir - to lie',
  'palillo - toothpick',
  'plegar - to fold',
  'pomelo - grapefruit',
  'rimar con - to rhyme with',
  'sonreír(se) - to smile',
  'tener hipo - to have hiccups',
  'trenzar - to braid',
  'zumbar - to buzz',
];

definitions.forEach((entry) => {
  const [entryWord, entryDefinition] = entry.split(' - ');
  dictionary[entryWord] = entryDefinition;
});

let browserDictionary = JSON.parse(localStorage.getItem('dictionary'));
if (!browserDictionary) browserDictionary = dictionary;
const getSetStore = (wordCollection = dictionary) => {
  localStorage.setItem('dictionary', JSON.stringify(wordCollection));
  dictionary = JSON.parse(localStorage.getItem('dictionary'));
};
getSetStore(browserDictionary);
// ────────────────────────────────────────────────────────────────────────────────
// Word formatting for speech:
const word = document.querySelector('.word');
const definition = document.querySelector('.definition');
let selectedWord = null;
let say = null;
const getFormatSetWord = (foreignWord) => {
  selectedWord = !foreignWord
    ? Object.keys(dictionary)[Math.floor(Math.random() * (definitions.length))]
    : foreignWord;
  // Removes slashes from upcoming pronounciation
  say = selectedWord.includes('/') ? selectedWord.slice(0, selectedWord.indexOf('/')) :
    selectedWord;
  // Removes parenthesized word from being pronounced (e.g. 'sonreir(se)' => 'sonreir')
  say = say.includes('(') ? say.slice(0, say.indexOf('(')) : say;
  say = say.replace(/[.,/#!$%^&*;:{}=\-_`~()?¿\\]/g, '').toLowerCase();
  word.textContent = selectedWord;
  definition.textContent = dictionary[selectedWord];
};
getFormatSetWord();

// ────────────────────────────────────────────────────────────────────────────────
// Annyang config for speech recognition and score update + persist:
const { annyang } = window;
const [microphone, micOn] = document.querySelectorAll('.img-mic, .img-mic-on');

const score = document.querySelector('.score');
let totalScore = JSON.parse(localStorage.getItem('score'));
score.textContent = totalScore || 0;
const updateScore = () => {
  totalScore = JSON.parse(localStorage.getItem('score'));
  localStorage.setItem('score', JSON.stringify(totalScore + 2));
  const newTotalScore = JSON.parse(localStorage.getItem('score'));
  score.textContent = newTotalScore;
};

annyang.setLanguage('es-US');
annyang.addCallback('result', (res) => {
  let audio = null;
  const results = res.map(recognizedWord => recognizedWord.toLowerCase());
  if (results.includes(say)) {
    audio = new Audio('/sounds/correct.wav');
    audio.play();
    updateScore();
    wordsCorrectlySaid[selectedWord] = dictionary[selectedWord];
    // delete dictionary[selectedWord];
    localStorage.setItem('dictionary', JSON.stringify({ hola: 'hello' }));
    getSetStore();
    getFormatSetWord();
  } else {
    audio = new Audio('/sounds/try-again.wav');
    audio.play();
  }
});

annyang.addCallback('start', () => {
  microphone.setAttribute('hidden', true);
  micOn.removeAttribute('hidden');
  const audio = new Audio('/sounds/start.wav');
  audio.play();
});

annyang.addCallback('end', () => {
  micOn.setAttribute('hidden', true);
  microphone.removeAttribute('hidden');
});

// ────────────────────────────────────────────────────────────────────────────────
// jQuery event handlers:
const eventHandlers = {
  speak() {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(say);
    utterance.lang = 'es-US';
    const englishUtterance = new SpeechSynthesisUtterance(`. ${dictionary[selectedWord]}`);
    englishUtterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
    speechSynthesis.speak(englishUtterance);
  },
  recognizeSpeech() {
    speechSynthesis.cancel();
    annyang.abort();
    annyang.start({ autoRestart: false, continuous: false });
  },
  translate(userWordInput) {
    const { requirejs } = window;
    requirejs(['./secrets'], (file) => {
      const k = file.yandexApiKey;
      fetch(`https://translate.yandex.net/api/v1.5/tr.json/translate?key=${k}&text=${userWordInput}&lang=en-es`)
        .then(res => res.text())
        .then((translation) => {
          const { text } = JSON.parse(translation);
          const [translatedWord] = text;
          dictionary[translatedWord] = userWordInput;
          getFormatSetWord(translatedWord, userWordInput);
          getSetStore();
        });
    });
  },
};

// ────────────────────────────────────────────────────────────────────────────────
// jQuery:
const { $ } = window;
$(document).ready(() => {
  $(document).click((e) => {
    if (microphone.hasAttribute('hidden')) return;

    const firstClassName = e.target.attributes.class.value.split(' ')[0];
    if (firstClassName === 'img-mic') {
      eventHandlers.recognizeSpeech();
      return;
    }
    if (firstClassName === 'img-listen') {
      eventHandlers.speak();
      return; // return early so it doesn't scroll
    }

    if (window.scrollY === 0) {
      $('body, html').animate({ scrollTop: $(window).height() - ($(this).outerHeight(true) / 2) }, 200);
      window.scrollY = 1;
    } else {
      $('body, html').animate({ scrollTop: 0 }, 200);
      window.scrollY = 0;
    }
  });

  $(document).keyup((e) => {
    if (e.keyCode === 39) return getFormatSetWord();
    if (e.keyCode === 13) {
      const searchBox = document.querySelector('.search-box');

      if (searchBox.hasAttribute('hidden')) {
        searchBox.removeAttribute('hidden');
        searchBox.value = '';
        $('.search-box').focus();
      } else {
        searchBox.setAttribute('hidden', true);
      }
    }
    return null;
  });

  $('.search-box').on('change', (e) => {
    eventHandlers.translate(e.target.value.toLowerCase());
  });
});

