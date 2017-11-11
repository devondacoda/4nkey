const dictionary = {};
const definitions = [
  'alardear - to brag',
  'apestar - to stink',
  'araña - spider',
  'bostezar - to yawn',
  'budin - pudding',
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
// ────────────────────────────────────────────────────────────────────────────────
// Word formatting for speech:
const selectedWord = Object.keys(dictionary)[Math.floor(Math.random() * (definitions.length))];
// Removes slashes from upcoming pronounciation
let say = selectedWord.includes('/') ? selectedWord.slice(0, selectedWord.indexOf('/')) :
  selectedWord;
// Removes parenthesized word from being pronounced (e.g. 'sonreir(se)' => 'sonreir')
say = say.includes('(') ? say.slice(0, say.indexOf('(')) : say;

const word = document.querySelector('.word');
const definition = document.querySelector('.definition');
word.textContent = selectedWord;
definition.textContent = dictionary[selectedWord];

// ────────────────────────────────────────────────────────────────────────────────
// Annyang config for speech recognition:
const { annyang } = window;
const [microphone, micOn] = document.querySelectorAll('.img-mic, .img-mic-on');
const score = document.querySelector('.score');
const totalScore = JSON.parse(localStorage.getItem('score'));
score.textContent = totalScore;

annyang.setLanguage('es-US');
annyang.addCallback('result', (res) => {
  let audio = null;
  const results = res.map(recognizedWord => recognizedWord.toLowerCase());
  if (results.includes(say)) {
    audio = new Audio('/sounds/correct.wav');
    audio.play();

    localStorage.setItem('score', JSON.stringify(totalScore + 2));
    const newTotalScore = JSON.parse(localStorage.getItem('score'));
    score.textContent = newTotalScore;
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
    speechSynthesis.speak(utterance);
  },
  recognizeSpeech() {
    annyang.abort();
    annyang.debug();
    annyang.start({ autoRestart: false, continuous: false });
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
});

