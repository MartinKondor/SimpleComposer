(($) =>
{
    const SYNTH = new Tone.Synth().toMaster();
    const METRONOME = new Tone.MembraneSynth().toMaster(); 
    const METRONOME_FUNCTION = () => METRONOME.triggerAttackRelease('F2', '16n');
    const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    let BPM = 130;
    let metronome_can_play = false;
    let metronome_tap_timer = 0;
    let metronome_function_interval;
    let highlightedChordKeys = [];


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
        $('#metronome_start_btn').toggleClass('btn-outline-primary');
        $('#metronome_start_btn').toggleClass('btn-outline-danger');

        if (metronome_can_play)
        {
            setBPM($('#metronome_bpm_input').val());
            metronome_function_interval = setInterval(METRONOME_FUNCTION, 1000 * 60 / BPM);
            $('#metronome_start_btn').html('STOP');
        }
        else 
        {
            clearInterval(metronome_function_interval);
            $('#metronome_start_btn').html('START');
        }
    });

    // Calculate BPM between tapings
    $('#metronome_tap_btn').on('click', (e) => 
    {
        if (metronome_tap_timer > 0)
        {
            $('#metronome_tap_btn').html('TAP');
            $('#metronome_bpm_input').val(Math.floor(60 / ((Date.now() - metronome_tap_timer) / 1000)));
            metronome_tap_timer = 0;
        }
        else
        {
            $('#metronome_tap_btn').html('. . . .');
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

    // Add a chord to the chord progression list
    $('#chords_chord_input_add_btn').on('click', () =>
    {
        $('#chords-list').append(`
        <li>
            ${$('#chords_chord_input').val()}
        </li>
        `);
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


    // Key box functions
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
    function getNoteByInterval(baseIndex, interval, baseOctave=4)
    {
        let octave = new String(baseOctave);

        if (baseIndex + interval >= 12)
        {
            octave = new String(parseInt(octave) + 1);
            baseIndex = baseIndex - 12;
        }
    
        return NOTES[baseIndex + interval] + octave;
    }

    function updateCurrentChord()
    {
        let baseNote = $('#current_chord_chord_base_note_input').val();
        let type = $('#current_chord_chord_type_input').val();

        let baseIndex = NOTES.indexOf(baseNote);
        let notes = [baseNote + '4'];

        if (type == 'M')
        {
            notes.push(getNoteByInterval(baseIndex, 4));
            notes.push(getNoteByInterval(baseIndex, 7));
        }
        else if (type == 'm')
        {
            notes.push(getNoteByInterval(baseIndex, 3));
            notes.push(getNoteByInterval(baseIndex, 7));
        }
        else if (type == 'aug')
        {
            notes.push(getNoteByInterval(baseIndex, 4));
            notes.push(getNoteByInterval(baseIndex, 8));
        }
        else if (type == 'dim')
        {
            notes.push(getNoteByInterval(baseIndex, 3));
            notes.push(getNoteByInterval(baseIndex, 8));
        }

        for (let key of highlightedChordKeys)
        {
            key.removeClass('highlighted-key');
        }

        for (let note of notes)
        {
            let key = $('#chords_keyboard > .key[data-note="' + note + '"]');
            highlightedChordKeys.push(key);
            key.addClass('highlighted-key');
        }

        console.log(notes);
    }

    $('#current_chord_chord_base_note_input').change(updateCurrentChord);
    $('#current_chord_chord_type_input').change(updateCurrentChord);


    // Run immediately
    setBPM(BPM);
    $('#key-box').draggable();

})(jQuery);
