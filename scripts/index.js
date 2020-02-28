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
    let highlightedChordKeys = [];  // The highlighted keys (DOM elements) on the keyboard
    let chordProgressionList = [];  // Chord classes
    let currentChord = null;  // Chord class


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
        let noteName = note[0];

        if (note[1] == '#')
        {
            noteName += '#';
        }

        SYNTH.triggerAttackRelease(noteName + new String(currentOctave), '8n');
    }


    /**
     * Key box
     */
     
    $('#key_box_hider').on('click', () =>
    {
        $('#key-box').toggleClass('hidden');
        $('#key_box_shower').toggleClass('hidden');
    });

    $('#key_box_shower').on('click', () =>
    {
        $('#key-box').toggleClass('hidden');
        $('#key_box_shower').toggleClass('hidden');
    });

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
        // TODO
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
    $('#key-box').draggable();
    updateCurrentChord();

})(jQuery);
