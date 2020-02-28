(($) =>
{
    const SYNTH = new Tone.Synth().toMaster();
    const METRONOME = new Tone.MembraneSynth().toMaster(); 
    const METRONOME_FUNCTION = () => METRONOME.triggerAttackRelease('F2', '16n');

    let BPM = 130;
    let metronomeCanPlay = false;
    let metronomeTapTimer = 0; 
    let metronomeFunctionInterval;  // Stores the metronome interval for later cleaning up

    let currentOctave = 4;
    let highlightedKeyKeys = [];
    let highlightedChordKeys = [];  // The highlighted keys (DOM elements) on the keyboard
    let chordProgressionList = [];  // Chord classes
    let currentChord = null;  // Chord class

    // For the suggester
    const COMMON_CHORD_PROGRESSIONS = [
        'i-iv-v-i', 'i-vii-vi-v', 'i-v-iv-v',
        'i-v-vi-iv', 'ii-v-i-vi', 'i-ii-iii-iv',
        'i-iii-iv-i', 'iv-i-v-vi', 'iv-v-i-iv'
    ];


    const download = (blob, name) =>
    {
        let url = URL.createObjectURL(blob);
        let div = document.createElement('div');
        let anch = document.createElement('a');

        document.body.appendChild(div);
        div.appendChild(anch);

        anch.innerHTML = '&nbsp;';
        div.style.width = '0';
        div.style.height = '0';
        anch.href = url;
        anch.download = name;
        
        let ev = new MouseEvent('click', {});
        anch.dispatchEvent(ev);
        document.body.removeChild(div);
    }

    const createKeyboard = (middleOctave) =>
    {   
        let keyboardString = '';

        for (let oct = middleOctave - 1; oct <= middleOctave + 1; oct++)
        {
            for (let note of NOTES)
            {
                let noteClass = note.toLowerCase();
                let noteType = 'white';

                if (noteClass[noteClass.length - 1] == '#')
                {
                    noteClass = noteClass[0] + '_sharp';
                    noteType = 'black';
                }

                keyboardString += `
                    <div class="key ${noteType} ${noteClass}" data-note="${note + new String(oct)}"></div>
                `;
            }
        }

        return keyboardString;
    }

    $('.keyboard').html(createKeyboard(currentOctave));  // Create the keyboard right before anything

    /**
     * Metronome
     */

    // Set BPM function
    const setBPM = (bpm) =>
    {
        BPM = bpm;
        Tone.Transport.bpm.value = BPM;
        $('#metronome_bpm_input').val(BPM);
    }

    const setOctave = (octave) =>
    {
        currentOctave = octave;
        $('#key_octave_input').val(currentOctave);
        // $('.keyboard').html(createKeyboard(currentOctave));  // Update the keyboard
        // updateCurrentChord();
    }

    // Start or stop the metronome
    $('#metronome_start_btn').on('click', (e) =>
    {
        metronomeCanPlay = !metronomeCanPlay;

        if (metronomeCanPlay)
        {
            setBPM($('#metronome_bpm_input').val());
            metronomeFunctionInterval = setInterval(METRONOME_FUNCTION, 1000 * 60 / BPM);
         
            $('#metronome_start_btn').removeClass('btn-primary');
            $('#metronome_start_btn').addClass('btn-danger');
            $('#metronome_start_btn').html(`
                <i class="far fa-play-circle"></i>
                Stop
            `);
        }
        else 
        {
            clearInterval(metronomeFunctionInterval);
            
            $('#metronome_start_btn').addClass('btn-primary');
            $('#metronome_start_btn').removeClass('btn-danger');
            $('#metronome_start_btn').html(`
                <i class="far fa-play-circle"></i>
                Start
            `);
        }
    });

    // Calculate BPM between tapings
    $('#metronome_tap_btn').on('click', (e) => 
    {
        if (metronomeTapTimer > 0)
        {
            $('#metronome_tap_btn').html(`
                <i class="far fa-hand-point-up"></i>
                Tap
            `);
            $('#metronome_bpm_input').val(Math.floor(60 / ((Date.now() - metronomeTapTimer) / 1000)));
            metronomeTapTimer = 0;
        }
        else
        {
            $('#metronome_tap_btn').html('. . . . . .');
            metronomeTapTimer = Date.now();
        }
    });

    // Plus and minus buttons for BPM
    $('#metronome_bpm_plus_btn').on('click', () =>
    {
        setBPM(++BPM);
    });
    $('#metronome_bpm_minus_btn').on('click', () =>
    {
        setBPM(--BPM);
    });


    /**
     * Keyboard
     */

    // Handle keyboard keypress
    $('.keyboard > .key').on('click', (e) =>
    {
        playNote(e.target.getAttribute('data-note'));
    });

    // Play note with Tone.js
    const playNote = (note) =>
    { 
        SYNTH.triggerAttackRelease(note, '8n');
        /*
        let noteName = note[0];

        if (note[1] == '#')
        {
            noteName += '#';
        }

        SYNTH.triggerAttackRelease(noteName + new String(currentOctave), '8n');
        */
    }


    /**
     * Key box
     */
    const romanizeNumber = (num) => {
        if (isNaN(num))
        {
            return NaN;
        }

        let digits = String(+num).split('');
        let key = [
            "","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
            "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
            "","I","II","III","IV","V","VI","VII","VIII","IX"
        ];
        let roman = '';
        let i = 3;
        
        while (i--)
        {
            roman = (key[+digits.pop() + (i * 10)] || "") + roman;
        }

        return Array(+digits.join("") + 1).join("M") + roman;
    }

    const updateKeyBox = () => 
    {
        let baseNote = $('#key_base_note').val();
        let baseIndex = NOTES.indexOf(baseNote);
        let mode = $('#key_mode_input').val();
        let steps = 'wwwhwwwh';
        let currentIndex = baseIndex;
        let octave = currentOctave;
        let notes = []; 
        let notesOfTheScaleString = '';
        let notesOfTheScaleLevelCounter = 0;

        if (mode == 'Ionian')
        {
            steps = 'wwhwwwh';
        }
        else if (mode == 'Dorian')
        {
            steps = 'whwwwhw';
        }
        else if (mode == 'Phrygian')
        {
            steps = 'hwwwhww';
        }
        else if (mode == 'Lydian')
        {
            steps = 'wwwhwwh';
        }
        else if (mode == 'Mixolydian')
        {
            steps = 'wwhwwhw';
        }
        else if (mode == 'Aeolian')
        {
            steps = 'whwwhww';
        }
        else if (mode == 'Lorcrian')
        {
            steps = 'hwwhwww';
        }

        for (let step of steps)
        {
            if (currentIndex >= 12)
            {
                ++octave;
                currentIndex = currentIndex - 12;
            }

            notes.push(NOTES[currentIndex] + new String(octave));

            if (step == 'w')
            {
                currentIndex += 2;
            }
            else 
            {
                ++currentIndex;
            }
        }

        notes.push(baseNote + new String(parseInt(currentOctave) + 1))  // Adding octave interval

        // Remove highlight from previous keys
        for (let key of highlightedKeyKeys)
        {
            key.removeClass('highlighted-key');
        }
        highlightedKeyKeys = [];

        // Highlight current keys
        for (let note of notes)
        {
            let key = $('#key_keyboard > .key[data-note="' + note + '"]');
            highlightedKeyKeys.push(key);
            key.addClass('highlighted-key');
            notesOfTheScaleString += note + ' (' + new String(romanizeNumber(++notesOfTheScaleLevelCounter)) + '), ';
        
            // Update chord names in the option box
            // $('#current_chord_chord_base_note_input > option[value="' + (note[1] == '#' ? note.substring(0, 2) : note[0]) + '"]').html(note + ' (' + new String(rn) + ')')
            // console.log('#current_chord_chord_base_note_input > option[value="' + (note[1] == '#' ? note.substring(0, 2) : note[0]) + '"]');
        }

        /*
        let optionElements = $('#current_chord_chord_base_note_input > option');
        for (let i = 0; i < notes.length; i++) 
        {
            optionElement.innerHTML = notes[i] + ' (' + new String(romanizeNumber(i)) + ')';
        }
        */

        // Print out notes of the scale
        $('#scale_notes_string').html(notesOfTheScaleString.substring(0, notesOfTheScaleString.length - 2));
    }

    $('#key_base_note').change(updateKeyBox);
    $('#key_mode_input').change(updateKeyBox);

    // Key octave
    $('#key_octave_input').change(() =>
    {
        setOctave(parseInt($('#key_octave_input').val()));
    });

    // Key octave buttons
    $('#key_octave_plus_btn').on('click', () => 
    {
        setOctave(parseInt($('#key_octave_input').val()) + 1);
    });
    $('#key_octave_minus_btn').on('click', () => 
    {
        setOctave(parseInt($('#key_octave_input').val()) - 1);
    });


    /**
     * Current chord
     */
    const updateCurrentChord = () =>
    {
        // Save current chord
        currentChord = new Chord(
            $('#current_chord_chord_base_note_input').val(),
            $('#current_chord_chord_type_input').val(),
            parseInt($('#current_chord_chord_inversion_input').val()),
            currentOctave
        );

        // Remove highlight from previous keys
        for (let key of highlightedChordKeys)
        {
            key.removeClass('highlighted-key');
        }
        highlightedChordKeys = [];

        // Highlight current keys
        for (let note of currentChord.notes)
        {
            let key = $('#chords_keyboard > .key[data-note="' + note + '"]');
            highlightedChordKeys.push(key);
            key.addClass('highlighted-key');
        }
    }

    $('#current_chord_chord_base_note_input').change(updateCurrentChord);
    $('#current_chord_chord_type_input').change(updateCurrentChord);
    $('#current_chord_chord_inversion_input').change(updateCurrentChord);

    // Play the current chord
    $('#current_chord_play_btn').on('click', () =>
    {
        for (let note of currentChord.notes)
        {
            playNote(note);
        }

        /*
        for (let key of highlightedChordKeys)
        {
            playNote(key[0].getAttribute('data-note'));
        }
        */
    });


    /**
     * Chord progression
     */

    // Add current chord to chord progression
    $('#chords_chord_input_add_btn').on('click', () =>
    {
        if (chordProgressionList.length == 0)
        {
            $('#chords-list').html('');
        }

        chordProgressionList.push(currentChord);

        $('#chords-list').append(`
        <li>
            <button class="chord-btn" data-chord-index="${chordProgressionList.length}">${currentChord.name}</button>
        </li>
        `);
    });

    // Plays the current chord progression
    $('#chord_progression_play_btn').on('click', () =>
    {
        let timeout = 1000 * 60 / BPM;

        // Play a chord on each beat 
        for (let currentChordInProgression of chordProgressionList)
        {
            setTimeout(() => 
            {
                for (let note of currentChordInProgression.notes)
                {
                    setTimeout(() => playNote(note), timeout / 3);
                }
            }, timeout);
        }
    });

    // Saves the current chord progression
    $('#chord_progression_save_btn').on('click', () =>
    {
        let textData = 'From https://martinkondor.github.io/SimpleComposer/\n';
        let counter = 1;
        let date = new Date();

        // Save the date
        textData += new String(new Date()) + '\n\n'

        // Save the key
        textData += '# Key\n';
        textData += 'Base note: ' + $('#key_base_note').val() + '\n';
        textData += 'Mode: ' + $('#key_mode_input').val() + '\n\n';

        textData += '# Chord progression\n';

        for (let currentChordInProgression of chordProgressionList)
        {
            textData += new String(counter++) + ': ' +
                    currentChordInProgression.name +
                    ', notes: ' +
                    new String(currentChordInProgression.notes) + '\n';
        }

        let blob = new Blob([textData], {type: 'text/plain'});
        let fileName = new String(date.getFullYear()) + '-' +
                        new String(date.getMonth() + 1) + '-' +
                        new String(date.getDate()) + '#' +
                        new String(date.getHours()) + '_' +
                        new String(date.getMinutes()) + '.txt';
        download(blob, fileName);
    });

    // Removes the current chord progression
    $('#chord_progression_clear_btn').on('click', () =>
    {
        chordProgressionList = [];
        $('#chords-list').html('<i class="text-muted">Chords will appear here ...</i>');
    });


    // Run immediately
    setBPM(BPM);
    setOctave(currentOctave);
    updateCurrentChord();
    updateKeyBox();

})(jQuery);
