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
  'enbiablado/a - mischievous',
  'esmalte de uñas - nail polish',
  'estar llanto - to be crying',
  'fantasma - ghost',
  'flirtear - to flirt',
  'guiñar - to wink',
  'llave - key',
  'mago/a - wizard',
  'me da repaso - i am embarrassed',
  'mentir - to lie',
  'palillo - toothpick',
  'plegar - to fold',
  'pomelo - grapefruit',
  'rimar con - to rhyme with',
  'sonreir(se) - to smile',
  'tener hipo - to have hiccups',
  'trenzar - to braid',
  'zumbar - to buzz',
];

definitions.forEach((entry) => {
  const [entryWord, entryDefinition] = entry.split(' - ');
  dictionary[entryWord] = entryDefinition;
});

const selectedWord = Object.keys(dictionary)[Math.floor(Math.random() * (definitions.length))];

const word = document.querySelector('.word');
const definition = document.querySelector('.definition');
word.textContent = selectedWord;
definition.textContent = dictionary[selectedWord];

// ────────────────────────────────────────────────────────────────────────────────
// Annyang config for speech recognition
const { annyang } = window;
const [microphone, micOn] = document.querySelectorAll('.img-talk, .img-speak');
const score = document.querySelector('.score');
const totalScore = JSON.parse(localStorage.getItem('score'));
score.textContent = totalScore;
// localStorage.clear();
// score.textContent = 0;


annyang.setLanguage('es-US');
annyang.addCallback('result', (res) => {
  let audio = null;
  if (res.includes(selectedWord)) {
    audio = new Audio('/sounds/correct.wav');
    audio.play();

    localStorage.setItem('score', JSON.stringify(totalScore + 2));
    score.textContent = totalScore;
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
// jQuery event handlers
const eventHandlers = {
  speak() {
    speechSynthesis.cancel();
    // Remove slashes from being pronounced
    let say = selectedWord.includes('/') ? selectedWord.slice(0, selectedWord.indexOf('/')) :
      selectedWord;
    // Remove parenthesized word from being pronounced (e.g. 'sonreir(se)' => 'sonreir')
    say = say.includes('(') ? say.slice(0, say.indexOf('(')) : say;
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
// jQuery
const { $ } = window;
$(document).ready(() => {
  $(document).click((e) => {
    const firstClassName = e.target.attributes.class.value.split(' ')[0];
    if (firstClassName === 'img-talk') {
      eventHandlers.recognizeSpeech();
      return;
    }
    if (firstClassName === 'img-listen') {
      eventHandlers.speak();
      return; // return early so it doesn't scroll
    }

    $(window).scroll();
    if (window.scrollY === 0) {
      $('body, html').animate({ scrollTop: $(window).height() - ($(this).outerHeight(true) / 2) }, 200);
    }
  });

  $(window).scroll(() => {
    eventHandlers.speak();
  });
});

