const InterfaceStorage = {
    setItem: function () {
        throw new Error("setItem method not implemented");
    },

    getItem: function () {
        throw new Error("getItem method not implemented");
    }
}

/**
 * Impl of @see {@link InterfaceStorage} for the default LocalStorage
 * if you want to use you own storage you can create a new class
 * following {@link InterfaceStorage} interface and substitute it in {@link EventHandlerService}
 * instead of this class
 */
class LocalStorage {
    #storage = localStorage;

    constructor() {
        if (LocalStorage.instance) {
            return LocalStorage.instance;
        }
        LocalStorage.instance = this;
    }

    setItem(key, value) {
        this.#storage.setItem(key, value)
    }

    getItem(key) {
        return this.#storage.getItem(key)
    }
}

const InterfaceUI = {

    wordIdSelector: "#word",
    promptIdSelector: "#prompt",
    tokenIdSelector: "#token",
    quantityIdSelector: "#quantity",
    startIdSelector: "#help",
    audioTranslateIdSelector: "#audioTranslate",

    bodySelector: "body",

    textToAudioTextAttribute: "textToAudioTextAttribute",

    audioTranslateColorDef: "#3498db",
    warningColor: "red",

    drawTheDefHints: function () {
        throw new Error("drawTheDefHints method not implemented");
    },

    setBackground: function () {
        throw new Error("setBackground method not implemented");
    },

    init: function () {
        throw new Error("ini method not implemented");
    },

    html: function () {
        throw new Error("html method not implemented");
    },

    append: function () {
        throw new Error("append method not implemented");
    },

    css: function () {
        throw new Error("css method not implemented");
    },

    toggle: function () {
        throw new Error("toggle method not implemented");
    },

    hide: function () {
        throw new Error("hide method not implemented");
    },

    show: function () {
        throw new Error("show method not implemented");
    },

    scrollVectorScroll: function () {
        throw new Error("show method not implemented");
    }
};

/**
 * Implementation of {@link InterfaceUI} for the desktop version of JQuery
 *
 * Can be created another version for React, Angular and other frameworks
 * based on {@link InterfaceUI}
 */
class DesktopJQueryUI {
    constructor() {
        this.startInfo = $(InterfaceUI.startIdSelector);
        this.setBackground();
    }

    drawTheDefHints() {
        this.append(this.startInfo,
            '* press button "->" (arrow right) to see next word <br>' +
            '* press button "<-" (arrow left) to see the hint for the current words <br><br>' +
            '* press button "v" (arrow down) to see the number of used hints<br>' +
            '* press button "P" to see the number of words revised for today. Will be hidden in ' + EventHandlerService.timeForHideSelectorInSeconds + ' sec <br>' +
            '* press button "O" to see/hide the number of words. Will be hidden in ' + EventHandlerService.timeForHideSelectorInSeconds + ' sec <br><br>'
        );
    }

    setBackground() {
        this.css(InterfaceUI.bodySelector, {'background-color': '#585858'});
    }

    init() { // init the default window
        this.drawTheDefHints()
    }

    html(selector, text) {
        $(selector).html(text);
    }

    css(selector, properties) {
        return $(selector).css(properties);
    }

    append(selector, text) {
        $(selector).append(text);
    }

    toggle(selector) {
        $(selector).toggle();
    }

    hide(selector) {
        $(selector).hide();
    }

    show(selector) {
        $(selector).show();
    }

    scrollVectorScroll(vector) {
        vector = vector || 'down';
        if (vector === 'down') { // convert the vector direction if one doesn't set for IE and drag down
            $(InterfaceUI.bodySelector).animate({scrollTop: $(document).height()}, 1100);
        }
    }
}

/**
 * Inherent of {@link InterfaceUI} for the mobile version of JQuery
 * expanding with some specific features for the mobiles version.
 * (e.g. including the control gestures, such as swipes and the mobile
 * relevant info)
 *
 * Can be created another version for React, Angular and other frameworks
 * based on {@link InterfaceUI}
 */
class MobileJQueryUI extends DesktopJQueryUI {
    constructor() {
        super();
    }

    drawTheDefWindow() {
        this.append(InterfaceUI.startIdSelector,
            '* swipe right to see next word <br>' +
            '* swipe left to see the hint for the current words <br><br>'
        );
        this.css(InterfaceUI.startIdSelector, {'background-color': '#585858'});
    }

    init() {
        // init the default window
        this.drawTheDefWindow();
        // download dynamically mobile jquery
        $.getScript("lib/mobile.jquery.js", function (data, textStatus, jqxhr) {
            $(window).on('swipe', function (event) {
                /**
                 * Detect if it was a right or left swipe. If negative then right
                 */
                let direction = Math.sign(event.swipestart.coords[0] - event.swipestop.coords[0]);

                // todo
                if (direction === -1)
                    lalalal(39);
                else
                    lalalal(37);
            });
        });
    }
}

const TextToAudioInterface = {
    preprocessTextForConvertingToAudio: function () {
        throw new Error("preprocessTextForConvertingToAudio method not implemented");
    },

    speak: function () {
        throw new Error("speak method not implemented");
    },

    cancel: function () {
        throw new Error("cancel method not implemented");
    }
}

class TextToAudioService {
    #synth = window.speechSynthesis;
    #isSpeaking = false;
    #currentUtterance = null;
    #abortController = new AbortController();
    #audioToTextSelector;
    _UI;

    constructor(ui, audioToTextSelector) {
        this._UI = ui;
        this.#audioToTextSelector = audioToTextSelector;
    }

    preprocessTextForConvertingToAudio(word, excludeTranscription) {
        TextToAudioUtilClass.preprocessTextForConvertingToAudio(word, excludeTranscription);
    }

    static cnt = 0; // for tests
    async speak(text, options = {}) {
        // console.log(typeof text )
        if (this.#isSpeaking) this.cancel();

        const {voice, rate, pitch} = options;

        const newUtterance = new SpeechSynthesisUtterance(text);
        newUtterance.voice = voice || this.#synth.getVoices()[0];
        newUtterance.rate = rate || 1;
        newUtterance.pitch = pitch || 1;

        this.#currentUtterance = newUtterance;

        const promise = new Promise((resolve, reject) => {
            this.#currentUtterance.onstart = () => {
                this.#isSpeaking = true;
                this.#abortController.signal;
                this.status = 'pending';
            };

            this.#currentUtterance.onend = () => {
                this.#isSpeaking = false;
                this.status = 'fulfilled';
                TextToAudioService.cnt++;
                resolve();
            };

            this.#currentUtterance.onerror = (event) => {
                this.#isSpeaking = false;
                // reject(event);
                console.error(`The previous response was deleted`);
                this.status = 'canceled';
                //todo change the color of the button for a sec in the UI component
            };
        });

        this.#synth.speak(this.#currentUtterance);

        return promise;
    }

    async cancel(warningColor = InterfaceUI.warningColor, defColor = InterfaceUI.audioTranslateColorDef) {
        if (this.#isSpeaking) {
            this._UI.css(this.#audioToTextSelector, {"background": warningColor});
            let $this = this;
            if (this.timeout === undefined) {
                this.timeout = setTimeout(() => {
                    this._UI.css(this.#audioToTextSelector, {"background": defColor});
                    $this.timeout = undefined;
                }, 1000);
            }
            this.#synth.cancel();
            this.#abortController.abort();
        }
    }

    static init(tts, selector) {
        $(selector).on("click", () => {
            tts.speak($('#audioTranslate').attr(InterfaceUI.textToAudioTextAttribute));
        });
    }
}

class TextToAudioUtilClass {
    static preprocessTextForConvertingToAudio(wordForPronunciation,
                                              excludeTranscription = false,
                                              callback =
                                                  function (text, selector = InterfaceUI.audioTranslateIdSelector) {
                                                      $(selector).attr(InterfaceUI.textToAudioTextAttribute, text);
                                                  }) {

        wordForPronunciation =
            !!wordForPronunciation
                ? wordForPronunciation.toLowerCase()
                : "";

        if (!!wordForPronunciation && excludeTranscription === true) // replace all transcription ([lala] -> '') and slash (/ -> '') and minus (- -> '')
            wordForPronunciation = wordForPronunciation.replace(/(\[[^\]]*\])|(\/)|(-)/gm, " ");

        wordForPronunciation = wordForPronunciation.replace(/([ЁёА-я]*)/gm, ""); // replace all russian words

        callback(wordForPronunciation);
    }
}

const SynonymsSearchInterface = {
    searchSynonyms: function () {
        throw new Error("searchSynonyms method not implemented");
    },
}

class SynonymsSearchService {
    #token;
    #UI;
    #dict;

    constructor(token, UI, dict) {
        this.#token = token;
        this.#UI = UI;
        this.#dict = dict;
    }

    searchSynonyms(word, right, idx) {
        if (!!!this.#token) return;

        var leftForTokenShuffle = 0;

        if (right) {
            this.tokenSearchArrResult = []
        } else { // for token shuffle
            leftForTokenShuffle = this.tokenSearchArrResult.length - 1;
        }

        this.tokensArr = word.split(/[|;,([]/) // remove ; , ( [ can't delete by space, because then you'll split "совместная деятельность" on two tokens
            .map((word) =>
                word.replace(/[()]/g, '') // remove () round brackets
                    .toLowerCase() // to lower case
                    .trim()
            )
            .filter((word) => !!word.length && word[word.length - 1] !== "]") // remove empty and []-transcription
            .filter(function (item, pos, self) { // remove duplicates
                return self.indexOf(item) == pos;
            })
        ;

        for (let tokenIdx in this.tokensArr) {
            for (let wordIdx in this.#dict) {
                if (wordIdx == idx) continue; // the same row
                let curWord = this.#dict[wordIdx];
                let curTokenWord = this.tokensArr[tokenIdx];

                try {
                    !!new RegExp("(?<=[\\s,.:;\"']|^)" + "ф" + "(?=[\\s,.:;\"']|$)", "igu").exec('bi ф')

                    if (
                        !!new RegExp("(?<=[\\s,.:;\"']|^)" + SynonymsSearchService.escapeRegExp(curTokenWord) + "(?=[\\s,.:;\"']|$)", "igu").exec(curWord[0])
                    ) {
                        this.tokenSearchArrResult.push(curWord[0] + ' - ' + curWord[1]);
                    }

                    if (
                        !!new RegExp("(?<=[\\s,.:;\"']|^)" + SynonymsSearchService.escapeRegExp(curTokenWord) + "(?=[\\s,.:;\"']|$)", "igu").exec(curWord[1])
                    ) {
                        this.tokenSearchArrResult.push(curWord[0] + ' - ' + curWord[1]);
                    }
                } catch (error) {
                    console.error(error.message);
                }
            }
        }

        this.tokenSearchArrResult = this.tokenSearchArrResult
            .filter(function (item, pos, self) { // remove duplicates
                return self.indexOf(item) == pos;
            });

        $(InterfaceUI.tokenIdSelector).empty();

        if (right) { // if this the first part of the array - shuffle all
            SynonymsSearchService.shuffleArray(this.tokenSearchArrResult, this.tokenSearchArrResult.length - 1, 0);
        } else { // if this the 2nd one shuffle only the 2nd one untouching the 1st one
            SynonymsSearchService.shuffleArray(this.tokenSearchArrResult, this.tokenSearchArrResult.length - 1, 0 + leftForTokenShuffle);
        }

        for (let tokenIdx in this.tokenSearchArrResult) {
            this.#UI.append(InterfaceUI.tokenIdSelector, "* " + this.tokenSearchArrResult[tokenIdx] + "<br>");
        }
    }

    static escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapes these characters: . * + ? ^ $ { } ( ) | [ ] \
    }

    static shuffleArray(array, start, end) {
        // The Fisher-Yates algorithm but with some changes
        for (let i = start; i > end; i--) {
            var j = 0;
            // the standard Fisher-Yates`s alg
            if (end == 0)
                j = Math.floor(Math.random() * (i + 1));
            else
                j = Math.ceil(Math.random() * (start - end) + end);
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
}

class EventHandlerService {
    #notDesktop = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    #prompt = 0;
    #storage = new LocalStorage();
    #dateNow = new Date();
    #dateNowFormat =
        ((this.#dateNow.getMonth() + 1).toString().padStart(2, '0'))
        + "/" + (this.#dateNow.getDate()).toString().padStart(2, '0')
        + "/" + this.#dateNow.getFullYear();
    #quantity = this.#storage.getItem(this.#dateNowFormat);
    #reloadConversely = -1;
    #dict;
    #reload = 0;
    #randomER = null;
    #blockRepeatWords = false;
    #currentWord = null;
    #token = false;
    #UI = null;
    #textToAudio;
    #synonymsSearch;
    static timeForHideSelectorInSeconds = 5;

    constructor(dict) {
        if (EventHandlerService.instance) {
            return EventHandlerService.instance;
        }
        this.#dict = dict;
        if (this.#notDesktop)
            this.#UI = new MobileJQueryUI();
        else
            this.#UI = new DesktopJQueryUI();

        this.#UI.init();

        this.init();

        this.#textToAudio = new TextToAudioService(this.#UI, InterfaceUI.audioTranslateIdSelector);
        TextToAudioService.init(this.#textToAudio, InterfaceUI.audioTranslateIdSelector);

        this.#synonymsSearch = new SynonymsSearchService(this.#token, this.#UI, this.#dict);

        EventHandlerService.instance = this;
    }

    init() {
        $(window).on('keyup', function (event) {
            document.body.style.overflow = 'auto';
            EventHandlerService.instance.keyHandler(event.keyCode);
        });

        this.#UI.toggle(InterfaceUI.quantityIdSelector); // hide by def

        // ?token=true search synonyms
        if (!!(new URL(window.location.href).searchParams.get("token"))) {
            this.#token = true;
        } else {
            this.#token = false;
        }
    }

    keyHandler(key) {

        function log(i) {
            console.log(i)
        }

        this.#UI.html(InterfaceUI.promptIdSelector, ""); // clear
        var randomChoose = Math.round(Math.random() * -1);

        if ((key === 39) && randomChoose === -1) {
            var random = Math.round(Math.random() * (this.#dict.length - 1));
            log(random);
            this.#UI.html(InterfaceUI.wordIdSelector, '<br><br>' + this.#dict[random][0]);

            this.#textToAudio.preprocessTextForConvertingToAudio(this.#dict[random][0], true);
            this.#currentWord = random;
            this.#storage.setItem(this.#dateNowFormat, ++this.#quantity);
            this.#UI.html(InterfaceUI.quantityIdSelector, this.#storage.getItem(this.#dateNowFormat) + ' / ' + (this.#dict.length));
            this.#randomER = -1;
            this.#blockRepeatWords = true;

            this.#synonymsSearch.searchSynonyms(this.#dict[random][0], true, random);
        }
        if ((key === 39) && randomChoose == 0) {
            var
                rand = Math.random(),
                randomConversely = Math.round(rand * (this.#dict.length - 1));
            log(randomConversely + " : " + this.#dict[randomConversely] + " Math random = " + rand);
            this.#textToAudio.preprocessTextForConvertingToAudio();
            this.#UI.html(InterfaceUI.wordIdSelector, '<br><br>' + this.#dict[randomConversely][1]);
            this.currentWordConversely = randomConversely;
            this.#storage.setItem(this.#dateNowFormat, ++this.#quantity);
            this.#UI.html(InterfaceUI.quantityIdSelector, this.#storage.getItem(this.#dateNowFormat) + ' / ' + (this.#dict.length));
            this.#randomER = 0;
            this.#blockRepeatWords = true;

            this.#synonymsSearch.searchSynonyms(this.#dict[randomConversely][1], true, randomConversely);

        }
        if ((key === 37) && this.#randomER == -1 && !!this.#blockRepeatWords) {
            this.#UI.append(InterfaceUI.wordIdSelector, '    ' + '<ins>' + this.#dict[this.#currentWord][1] + '</ins>');
            random = null;
            ++this.#prompt;
            this.#blockRepeatWords = false;

            this.#synonymsSearch.searchSynonyms(this.#dict[this.#currentWord][1], false, this.#currentWord);
        }
        if ((key === 37 || key === 81) && this.#randomER == 0 && !!this.#blockRepeatWords) {
            log(this.currentWordConversely);
            this.#UI.append(InterfaceUI.wordIdSelector,
                '    <ins>' + this.#dict[this.currentWordConversely][0] + ' </ins>');
            this.#currentWord = this.#dict[this.currentWordConversely][0];
            this.#textToAudio.preprocessTextForConvertingToAudio(this.#dict[this.currentWordConversely][0], true);
            randomConversely = null;
            ++this.#prompt;
            this.#blockRepeatWords = false;

            this.#synonymsSearch.searchSynonyms(this.#dict[this.currentWordConversely][0], false, this.currentWordConversely);
        }

        const sizeText = this.#UI.css(InterfaceUI.wordIdSelector, 'font-size'); // get the value of font-size dynamically

        if (
            (key === 39 || key === 32) //right
            ||
            (key === 37 || key === 81) //left
        ) {
            this.#UI.css(InterfaceUI.wordIdSelector, {'font-size': `${sizeText}px`, 'min-height': '350px'});
            this.#UI.scrollVectorScroll();
        }
        if (key === 27 || this.#reload >= 20 || this.#reloadConversely >= 20) {//top-clear
            for (let selector in [InterfaceUI.wordIdSelector, InterfaceUI.quantityIdSelector, InterfaceUI.promptIdSelector])
                this.#UI.html('');
            this.#prompt = 0; // used prompts
            this.#quantity = 0; // revised words
        }

        if (key === 79) { // key: O. show the cnt
            this.#UI.toggle(InterfaceUI.quantityIdSelector);
        }

        if (key === 80) { // key: P. hide in timeForHideAmountWords (5) secs
            this.#UI.show(InterfaceUI.quantityIdSelector);
            setTimeout(() => {
                this.#UI.hide(InterfaceUI.quantityIdSelector);
            }, EventHandlerService.timeForHideSelectorInSeconds * 1000);
        }

        if (key === 40) { // key arrow down: the percent of used hints
            const percentagePrompt = (this.#prompt / this.#quantity) * 100;
            this.#UI.html(InterfaceUI.promptIdSelector, this.#prompt + ' / ' + this.#quantity + ' (' + percentagePrompt.toFixed(1) + '% hints)');
            setTimeout(() => {
                this.#UI.html(InterfaceUI.promptIdSelector, "");
            }, EventHandlerService.timeForHideSelectorInSeconds * 10000000);
        }

        if (this.#notDesktop) {
            this.#UI.css(InterfaceUI.wordIdSelector, {'font-size': '50px', 'margin-bottom': '180px'});
        }
    }
}

function main() {
    new EventHandlerService(words)
}

// Export all functions, classes, or objects
// module.exports = {
//     DesktopJQueryUI,
//     InterfaceUI,
//     TextToAudioService,
//     SpeechSynthesisUtterance,
// };

class MySpeechSynthesis {
    constructor() {
        this.utterance = new SpeechSynthesisUtterance('Hello, world!');
    }
}

exports.MySpeechSynthesis = MySpeechSynthesis;
exports.DesktopJQueryUI = DesktopJQueryUI
exports.InterfaceUI = InterfaceUI
exports.TextToAudioService = TextToAudioService
// exports.SpeechSynthesisUtterance = window.SpeechSynthesisUtterance