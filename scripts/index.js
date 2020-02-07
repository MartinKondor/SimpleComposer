(($) =>
{
    const SYNTH = new Tone.Synth().toMaster();
    let BPM = 130;

    // Setup
    Tone.Transport.bpm.value = BPM;

    let playNote = (note) =>
    {
        SYNTH.triggerAttackRelease(note, '8n');
    }

    $('.piano rect').on('click', (e) =>
    {
        playNote(e.target.getAttribute('data-note'));
    });

})(jQuery);
