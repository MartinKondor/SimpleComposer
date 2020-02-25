(($) =>
{
    const SYNTH = new Tone.Synth().toMaster();
    const METRONOME = new Tone.MembraneSynth().toMaster(); 
    const METRONOME_FUNCTION = () => METRONOME.triggerAttackRelease('F2', '16n');

    let BPM = 130;
    let metronome_can_play = false;
    let metronome_tap_timer = 0;
    let metronome_function_interval;

    let keyboardSvg = `
    <svg class="piano" width="810" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect data-note="C3" class="white-key" height="174.00001" width="39.2" y="81.45" x="0" stroke-width="1.5" stroke="#000" fill="#fff"/>
        <rect data-note="D3" class="white-key" height="174.00001" width="39.2" y="81.45" x="39.20002" stroke-width="1.5" stroke="#000" fill="#fff"/>
        <rect data-note="E3" class="white-key" height="174.00001" width="39.2" y="81.45" x="78.40002" stroke-width="1.5" stroke="#000" fill="#fff"/>
        <rect data-note="F3" class="white-key" height="174.00001" width="39.2" y="81.45" x="117.60005" stroke-width="1.5" stroke="#000" fill="#fff"/>
        <rect data-note="G3" class="white-key" height="174.00001" width="39.2" y="81.45" x="156.80005" stroke-width="1.5" stroke="#000" fill="#fff"/>
        <rect data-note="A3" class="white-key" height="174.00001" width="39.2" y="81.45" x="196.00007" stroke-width="1.5" stroke="#000" fill="#fff"/>
        <rect data-note="B3" class="white-key" height="174.00001" width="39.2" y="81.45" x="235.20007" stroke-width="1.5" stroke="#000" fill="#fff"/>
        <rect data-note="C#3" class="black-key" height="106.39999" width="25" y="82.44969" x="19.80006" stroke-width="1.5" stroke="#000" fill="#000000"/>
        <rect data-note="D#3" class="black-key" height="106.39999" width="25" y="82.44969" x="72.60008" stroke-width="1.5" stroke="#000" fill="#000000"/>
        <rect data-note="F#3" class="black-key" height="106.39999" width="25" y="82.44969" x="138.2001" stroke-width="1.5" stroke="#000" fill="#000000"/>
        <rect data-note="G#3" class="black-key" height="106.39999" width="25" y="82.44969" x="183.00011" stroke-width="1.5" stroke="#000" fill="#000000"/>
        <rect data-note="A#3" class="black-key" height="106.39999" width="25" y="82.44969" x="228.60012" stroke-width="1.5" stroke="#000" fill="#000000"/>
        
        <rect data-note="C4" class="white-key" height="174.00001" width="39.2" y="81.45" x="267.60012" stroke-width="1.5" stroke="#000" fill="#fff"/>
        <rect data-note="D4" class="white-key" height="174.00001" width="39.2" y="81.45" x="306.80014" stroke-width="1.5" stroke="#000" fill="#fff"/>
        <rect data-note="E4" class="white-key" height="174.00001" width="39.2" y="81.45" x="346.00014" stroke-width="1.5" stroke="#000" fill="#fff"/>
        <rect data-note="F4" class="white-key" height="174.00001" width="39.2" y="81.45" x="385.20017" stroke-width="1.5" stroke="#000" fill="#fff"/>
        <rect data-note="G4" class="white-key" height="174.00001" width="39.2" y="81.45" x="424.40017" stroke-width="1.5" stroke="#000" fill="#fff"/>
        <rect data-note="A4" class="white-key" height="174.00001" width="39.2" y="81.45" x="463.60019" stroke-width="1.5" stroke="#000" fill="#fff"/>
        <rect data-note="B4" class="white-key" height="174.00001" width="39.2" y="81.45" x="502.80019000000004" stroke-width="1.5" stroke="#000" fill="#fff"/>
        <rect data-note="C#4" class="black-key" height="106.39999" width="25" y="82.44969" x="287.40018" stroke-width="1.5" stroke="#000" fill="#000000"/>
        <rect data-note="D#4" class="black-key" height="106.39999" width="25" y="82.44969" x="340.2002" stroke-width="1.5" stroke="#000" fill="#000000"/>
        <rect data-note="F#4" class="black-key" height="106.39999" width="25" y="82.44969" x="405.80021999999997" stroke-width="1.5" stroke="#000" fill="#000000"/>
        <rect data-note="G#4" class="black-key" height="106.39999" width="25" y="82.44969" x="450.60023" stroke-width="1.5" stroke="#000" fill="#000000"/>
        <rect data-note="A#4" class="black-key" height="106.39999" width="25" y="82.44969" x="496.20024" stroke-width="1.5" stroke="#000" fill="#000000"/>  

        <rect data-note="C5" class="white-key" height="174.00001" width="39.2" y="81.45" x="535.20024" stroke-width="1.5" stroke="#000" fill="#fff"/>
        <rect data-note="D5" class="white-key" height="174.00001" width="39.2" y="81.45" x="574.40026" stroke-width="1.5" stroke="#000" fill="#fff"/>
        <rect data-note="E5" class="white-key" height="174.00001" width="39.2" y="81.45" x="613.6002599999999" stroke-width="1.5" stroke="#000" fill="#fff"/>
        <rect data-note="F5" class="white-key" height="174.00001" width="39.2" y="81.45" x="652.80029" stroke-width="1.5" stroke="#000" fill="#fff"/>
        <rect data-note="G5" class="white-key" height="174.00001" width="39.2" y="81.45" x="692.00029" stroke-width="1.5" stroke="#000" fill="#fff"/>
        <rect data-note="A5" class="white-key" height="174.00001" width="39.2" y="81.45" x="731.20031" stroke-width="1.5" stroke="#000" fill="#fff"/>
        <rect data-note="B5" class="white-key" height="174.00001" width="39.2" y="81.45" x="770.40031" stroke-width="1.5" stroke="#000" fill="#fff"/>
        <rect data-note="C#5" class="black-key" height="106.39999" width="25" y="82.44969" x="555.0002999999999" stroke-width="1.5" stroke="#000" fill="#000000"/>
        <rect data-note="D#5" class="black-key" height="106.39999" width="25" y="82.44969" x="607.80032" stroke-width="1.5" stroke="#000" fill="#000000"/>
        <rect data-note="F#5" class="black-key" height="106.39999" width="25" y="82.44969" x="673.4003399999999" stroke-width="1.5" stroke="#000" fill="#000000"/>
        <rect data-note="G#5" class="black-key" height="106.39999" width="25" y="82.44969" x="718.2003500000001" stroke-width="1.5" stroke="#000" fill="#000000"/>
        <rect data-note="A#5" class="black-key" height="106.39999" width="25" y="82.44969" x="763.80036" stroke-width="1.5" stroke="#000" fill="#000000"/>  

    </svg>
    `;

    const buildKey = (note, props) => 
    {
        let attrStr = ' data-note=' + note;

        for (let prop in props)
        {
            attrStr += ' ' + prop.replace('_', '-') + '="' + props[prop] + '"';
        }

        return '<rect' + attrStr + '/>';
    }

    const buildKeyboard = (fromOctave=3, toOctave=5, whiteKeyWidth='39.2', whiteKeyHeight='174.00001', blackKeyWidth='25', blackKeyHeight='106.39999') =>
    {
        let keys = '';
        let noteNames = [
            'C', 'D', 'E', 'F', 'G', 'A', 'B',
            'C#', 'D#', 'F#', 'G#', 'A#'
        ];
        let wkwf = parseFloat(whiteKeyWidth);
        let blackNoteXes = {
            'C#': wkwf * 0.505103,  // 19.80006
            'D#': 3.5 * wkwf * 0.505103,
            'F#': 7.1 * wkwf * 0.505103,
            'G#': 9.2 * wkwf * 0.505103,
            'A#': 11.4 * wkwf * 0.505103
        }
        let octave = fromOctave;
        let lastX = 0;

        for (; octave < toOctave + 1; octave++)
        {
            // Draw an octave
            for (let i = 0; i < 12; i++)
            {
                let keyType = noteNames[i].indexOf('#') != -1 ? 'black-key' : 'white-key';

                keys += buildKey(noteNames[i] + new String(octave), {
                    class: keyType,
                    height: keyType == 'black-key' ? blackKeyHeight : whiteKeyHeight,
                    width: keyType == 'black-key' ? blackKeyWidth : whiteKeyWidth,
                    y: keyType == 'black-key' ? '82.44969' : '81.45',
                    x: keyType == 'black-key' ? blackNoteXes[noteNames[i]] : new String(lastX),
                    stroke_width: '0.5',
                    stroke: '#000',
                    fill: '#000000'
                });

                lastX += keyType == 'black-key' ? 0 : parseFloat(whiteKeyWidth) + 2;
            }

            // Place blacks one octave away
            for (let blackNote in blackNoteXes)
            {
                blackNoteXes[blackNote] += parseFloat('267.60012‬');
            }
        }

        return '<svg class="piano" width="' + new String(lastX + 1) + '" height="400" xmlns="http://www.w3.org/2000/svg">' + keys + '</svg>'
    }

    /*
    setInterval(() => {
        console.log($(window).width());
    }, 100);
    */

    // Set BPM function
    const setBPM = (bpm) =>
    {
        BPM = bpm;
        Tone.Transport.bpm.value = BPM;
        $('#metronome_bpm_input').val(BPM);
    }

    // Play note with Tone.js
    const playNote = (note) =>
    {
        SYNTH.triggerAttackRelease(note, '8n');
    }

    // Play sound on piano interaction
    $('.piano rect').on('click', (e) =>
    {
        playNote(e.target.getAttribute('data-note'));
    });

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


    // Run immediately
    setBPM(BPM);

    // Scale the keyboard to the screen size
    if ($(window).width() < 1462)
    {
        

        $('#keyboard').html(buildKeyboard(3, 5, '19.6', '174.00001', '12.5', '106.39999'));
    }
    else
    {
        $('#keyboard').html(buildKeyboard());
    }
    

})(jQuery);
