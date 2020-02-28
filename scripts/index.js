(($) =>
{
    const SYNTH = new Tone.Synth().toMaster();
    const METRONOME = new Tone.MembraneSynth().toMaster(); 
    const METRONOME_FUNCTION = () => METRONOME.triggerAttackRelease('F2', '16n');

    let BPM = 130;
    let metronome_can_play = false;
    let metronome_tap_timer = 0; 
    let metronome_function_interval;  // Stores the metronome interval for later cleaning up

    let highlightedChordKeys = [];  // The highlighted keys (DOM elements) on the keyboard
    let chordProgressionList = [];  // Chord classes
    let currentChord = null;  // Chord class


    // Load keyboards
    $('.keyboard').html(`
        <div class="key white c" data-note="C3"></div>
        <div class="key black c_sharp" data-note="C#3"></div>
        <div class="key white d" data-note="D3"></div>
        <div class="key black d_sharp" data-note="D#3"></div>
        <div class="key white e" data-note="E3"></div>
        <div class="key white f" data-note="F3"></div>
        <div class="key black f_sharp" data-note="F#3"></div>
        <div class="key white g" data-note="G3"></div>
        <div class="key black g_sharp" data-note="G#3"></div>
        <div class="key white a" data-note="A3"></div>
        <div class="key black a_sharp" data-note="A#3"></div>
        <div class="key white b" data-note="B3"></div>
        <div class="key white c" data-note="C4"></div>
        <div class="key black c_sharp" data-note="C#4"></div>
        <div class="key white d" data-note="D4"></div>
        <div class="key black d_sharp" data-note="D#4"></div>
        <div class="key white e" data-note="E4"></div>
        <div class="key white f" data-note="F4"></div>
        <div class="key black f_sharp" data-note="F#4"></div>
        <div class="key white g" data-note="G4"></div>
        <div class="key black g_sharp" data-note="G#4"></div>
        <div class="key white a" data-note="A4"></div>
        <div class="key black a_sharp" data-note="A#4"></div>
        <div class="key white b" data-note="B4"></div>
        <div class="key white c" data-note="C5"></div>
        <div class="key black c_sharp" data-note="C#5"></div>
        <div class="key white d" data-note="D5"></div>
        <div class="key black d_sharp" data-note="D#5"></div>
        <div class="key white e" data-note="E5"></div>
        <div class="key white f" data-note="F5"></div>
        <div class="key black f_sharp" data-note="F#5"></div>
        <div class="key white g" data-note="G5"></div>
        <div class="key black g_sharp" data-note="G#5"></div>
        <div class="key white a" data-note="A5"></div>
        <div class="key black a_sharp" data-note="A#5"></div>
        <div class="key white b" data-note="B5"></div>
    `);


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

    // Start or stop the metronome
    $('#metronome_start_btn').on('click', (e) =>
    {
        metronome_can_play = !metronome_can_play;

        if (metronome_can_play)
        {
            setBPM($('#metronome_bpm_input').val());
            metronome_function_interval = setInterval(METRONOME_FUNCTION, 1000 * 60 / BPM);
         
            $('#metronome_start_btn').removeClass('btn-primary');
            $('#metronome_start_btn').addClass('btn-danger');
            $('#metronome_start_btn').html(`
                <i class="far fa-play-circle"></i>
                Stop
            `);
        }
        else 
        {
            clearInterval(metronome_function_interval);
            
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
        if (metronome_tap_timer > 0)
        {
            $('#metronome_tap_btn').html(`
                <i class="far fa-hand-point-up"></i>
                Tap
            `);
            $('#metronome_bpm_input').val(Math.floor(60 / ((Date.now() - metronome_tap_timer) / 1000)));
            metronome_tap_timer = 0;
        }
        else
        {
            $('#metronome_tap_btn').html('. . . . . .');
            metronome_tap_timer = Date.now();
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


    /**
     * Current chord
     */
    function updateCurrentChord()
    {
        // Save current chord
        currentChord = new Chord(
            $('#current_chord_chord_base_note_input').val(),
            $('#current_chord_chord_type_input').val(),
            parseInt($('#current_chord_chord_inversion_input').val()),
            4
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
                    playNote(note);
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
    $('#key-box').draggable();
    updateCurrentChord();

})(jQuery);
