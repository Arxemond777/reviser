const StorageInterface = {
    setItem: function () {
        throw new Error("setItem method not implemented");
    },

    getItem: function () {
        throw new Error("getItem method not implemented");
    }
}

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

const UIInterface = {
    drawTheDefHints: function() {
        throw new Error("drawTheDefHints method not implemented");
    },

    setBackground: function() {
        throw new Error("setBackground method not implemented");
    },

    init: function() {
        throw new Error("ini method not implemented");
    }
};

class UIDesktop {
    constructor() {
        this.startInfo = $("#startInfo");
        this.setBackground()
    }

    drawTheDefHints() {
        this.startInfo
            .append(
                '* press button "->" (arrow right) to see next word <br>' +
                '* press button "<-" (arrow left) to see the hint for the current words <br><br>'
            );
    }

    init() {
        // init the default window
        this.drawTheDefHints()
    }

    setBackground() {
        $('body').css({'background-color': '#585858'});
    }
}

class UIMobile extends UIDesktop {
    constructor() {
        super();
    }

    drawTheDefWindow() {
        $("#startInfo")
            .append(
                '* swipe right to see next word <br>' +
                '* swipe left to see the hint for the current words <br><br>'
            );
        $('body').css({'background-color': '#585858'});
    }

    init() {
        // init the default window
        this.drawTheDefWindow()
    }
}

class Logic {
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
    #timeForHideAmountWords = 5;
    constructor(dict) {
        if (Logic.instance) {
            return Logic.instance;
        }
        this.#dict = dict;
        if (this.#notDesktop)
            this.UI = new UIMobile();
        else
            this.UI = new UIDesktop()

        this.UI.init()
        this.init()

        Logic.instance = this;
    }

    init() {
        $(window).on('keyup', function (event) {
            document.body.style.overflow = 'auto';
            Logic.instance.keyHandler(event.keyCode);
        });

        $("#quantity").toggle(); // hide by def

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

        var randomChoise = Math.round(Math.random() * -1);

        function scrollVectorScroll(vector) {
            vector = vector || 'down';
            if (vector === 'down') { //конвертим в true/false и если не задана vector, то опускаем вниз
                $('body').animate({scrollTop: $(document).height()}, 1100);
            }
        }

        if ((key === 39) && randomChoise === -1) {
            var rand = Math.random(),
                random = Math.round(rand * (words.length - 1));
            log(random);
            $("#wordEnglish").html('<br>' + '<br>');
            $("#wordEnglish").html(words[random][0]);

            // this.curWorld = words[random][0]
            // voice(words[random][0], true);
            this.#currentWord = random;
            this.#storage.setItem(this.#dateNowFormat, ++this.#quantity);
            $("#quantity").html(this.#storage.getItem(this.#dateNowFormat) + ' / ' + (words.length));
            this.#randomER = -1;
            this.#blockRepeatWords = true;

            tokenSearch(words[random][0], true, random);

        }
        if ((key == 39) && randomChoise == -0) {
            var
                rand = Math.random(),
                randomConversely = Math.round(rand * (words.length - 1));
            console.log(randomConversely + " : " + words[randomConversely] + " Math random = " + rand);
            // voice();
            $("#wordEnglish").html('<br>' + '<br>');
            $("#wordEnglish").html(words[randomConversely][1]);
            this.currentWordConversely = randomConversely;
            this.#storage.setItem(this.#dateNowFormat, ++this.#quantity);
            $("#quantity").html(this.#storage.getItem(this.#dateNowFormat) + ' / ' + (words.length));
            this.#randomER = 0;
            this.#blockRepeatWords = true;

            tokenSearch(words[randomConversely][1], true, randomConversely);

        }
        if ((key == 37) && this.#randomER == -1 && !!this.#blockRepeatWords) {
            $("#wordEnglish").append('    ' + '<ins>' + words[this.#currentWord][1] + '</ins>');
            random = null;
            ++this.#prompt;
            this.#blockRepeatWords = false;

            tokenSearch(words[this.#currentWord][1], false, this.#currentWord);
        }
        if ((key == 37 || key == 81) && this.#randomER == 0 && !!this.#blockRepeatWords) {
            console.log(this.currentWordConversely);
            $("#wordEnglish").append('    ' + '<ins>' + words[this.currentWordConversely][0] + ' </ins>');
            this.curWorld = words[this.currentWordConversely][0];
            randomConversely = null;
            ++this.#prompt;
            this.#blockRepeatWords = false;

            tokenSearch(words[this.currentWordConversely][0], false, this.currentWordConversely);
        }

        var sizeText = $("#wordEnglish").css('font-size'); // get the value of font-size dynamically

        if (
            (key == 39 || key == 32) //right
            ||
            (key === 37 || key === 81) //left
        ) {
            $("#wordEnglish").css({'font-size': `${sizeText}px`, 'min-height': '350px'});
            scrollVectorScroll();
        }
        if (key == 27 || this.#reload >= 20 || this.#reloadConversely >= 20) {//top-clear
            $("#wordEnglish").html('');
            $("#quantity").html('');
            $('#prompt').html('');
            this.#prompt = 0; // used prompts
            this.#quantity = 0; // revised words
        }
        // if (key == 69) {//E
        //     reloadConversely = -1;
        //     reload = 0;
        // }


        // if (notDesktop) {
        //     $("#wordEnglish").css({'font-size': '50px', 'margin-bottom': '180px'});
        // }
    }
}

// class EventUtilityClass {
//     static bindKeyCode() {
//
//     }
// }
function main() {
    const logic = new Logic(words)
}

// function keyBinderPreprocessor(keyNumber) {
//     // $(document).keydown(function(e) { // disable space scrolling
//     //     if (e.which === 32) {
//     //         var v;
//     //         try {
//     //             v = disableSpaceScrolling ? true : false;
//     //         } catch (e) {
//     //             if (e instanceof ReferenceError) {
//     //                 v = false;
//     //             }
//     //         }
//     //         return v;
//     //     }
//     // });
//
//     document.body.style.overflow = 'auto';
//     wordRandom(keyNumber);
// }

function shuffleArray(array, start, end) {
    // The Fisher-Yates algorithm but with some changes
    for (var i = start; i > end; i--) {
        var j = 0;
        if (end == 0) // the standard Fisher-Yates`s alg
            j = Math.floor(Math.random() * (i + 1));
        else // the improved not Fisher-Yates`s alg
            j = Math.ceil(Math.random() * (start - end) + end);
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
function tokenSearch(word, right, idx) {
    if (!!!token) return;

    var left_for_token_shuffle = 0;

    if (right) {
        token_search_arr_result = []
    } else { // for token shuffle
        left_for_token_shuffle = token_search_arr_result.length-1;
    }

    tokens_arr = word.split(/[|;,([]/) // remove ; , ( [ todo can't delete by space, because then you'll split "совместная деятельность" on two tokens
        .map((word) =>
            word.replace(/[()]/g, '') // remove () round brackets
                .toLowerCase() // to lower case
                .trim()
        )
        .filter((word) => !!word.length && word[word.length-1] !== "]") // remove empty and []-transcription
        .filter(function(item, pos, self) { // remove duplicates
            return self.indexOf(item) == pos;
        })
    ;

    for (token_idx in tokens_arr) {
        for (word_idx in words) {
            if (word_idx == idx) continue; // the same row
            var cur_word = words[word_idx];
            var cur_token_word = tokens_arr[token_idx];

            try {
                !!new RegExp("(?<=[\\s,.:;\"']|^)" + "ф" + "(?=[\\s,.:;\"']|$)", "igu").exec('bi ф')

                if (
                    !!new RegExp("(?<=[\\s,.:;\"']|^)" + cur_token_word + "(?=[\\s,.:;\"']|$)", "igu").exec(cur_word[0])
                ) {
                    token_search_arr_result.push(cur_word[0] + ' - ' + cur_word[1]);
                }

                if (
                    !!new RegExp("(?<=[\\s,.:;\"']|^)" + cur_token_word + "(?=[\\s,.:;\"']|$)", "igu").exec(cur_word[1])
                ) {
                    token_search_arr_result.push(cur_word[0] + ' - ' + cur_word[1]);
                }
            } catch (error) {
                console.warn(error.message);
            }
        }
    }

    token_search_arr_result = token_search_arr_result
        .filter(function(item, pos, self) { // remove duplicates
            return self.indexOf(item) == pos;
        });

    $("#token").empty();

    if (!!new URL(window.location.href).searchParams.get("shuffle_tokens")) {
        shuffleArray(token_search_arr_result);
    }



    // if (!!new URL(window.location.href).searchParams.get("shuffle_tokens_partial")) {
    //     console.log("shuffle_tokens_partial>>>"+token_search_arr_result + " right:" + right);

    if (right) { // if this the first part of the array - shuffle all
        // console.log("shuffle_tokens_partial right>>>" + left_for_token_shuffle);
        shuffleArray(token_search_arr_result, token_search_arr_result.length - 1, 0);
    } else {
        // console.log("shuffle_tokens_partial left>>>" + left_for_token_shuffle);
        shuffleArray(token_search_arr_result, token_search_arr_result.length - 1, 0 + left_for_token_shuffle);
    }
    // }

    for (token_idx in token_search_arr_result) {
        $("#token").append("* "+ token_search_arr_result[token_idx] +"<br>");
    }
}
