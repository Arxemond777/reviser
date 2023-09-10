const jsdom = require('jsdom');
const { JSDOM } = jsdom;
// const { describe, it, expect } = require('jasmine');


// Create a DOM environment
const dom = new JSDOM('<!doctype html><html><body></body></html>');

// Make $ available in the global scope
const { window } = dom;
global.$ = require('jquery')(window);
// Create a global 'window' object
global.window = dom.window;
global.document = dom.window.document;

// class SpeechSynthesisUtterance {
//     constructor(text) {
//         this.text = text;
//         this.onend = null;
//     }
// }

// Make the mock class globally available
// global.SpeechSynthesisUtterance = SpeechSynthesisUtterance;

const myModule = require('../service/variables.js');
describe('Reviser', () => {
    it('normal flow pronunciation', (done) => {
        const ui = new myModule.DesktopJQueryUI();

        ui.init();
        const ttas = new myModule.TextToAudioService(ui, myModule.InterfaceUI.audioTranslateIdSelector);
        ttas.init()
        expect(myModule.TextToAudioService.cnt).toBe(0);
        ttas.speak("aaaa");
        ttas.speak("aaaa");

        setTimeout(() => {
            done();
            expect(myModule.TextToAudioService.cnt).toBe(1);
        }, 1000);
    });
});