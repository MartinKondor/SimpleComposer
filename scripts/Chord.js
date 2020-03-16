const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];


const getNoteByInterval = (baseIndex, interval, baseOctave=4) =>
{
    let octave = new String(baseOctave);

    if (baseIndex + interval >= 12)
    {
        octave = new String(parseInt(octave) + 1);
        baseIndex = baseIndex - 12;
    }

    return NOTES[baseIndex + interval] + octave;
}

class Chord 
{

    constructor(baseNote, type='M', inversion=0, octave=4)
    {
        if (baseNote.length == 0) 
        {
            console.error('No base note provied');
        }
        
        this.baseNote = baseNote;
        this.type = type;
        this.inversion = inversion;
        this.name = baseNote + (type == 'M' ? '' : type) + new String(octave);

        if (inversion == 1)
        {   
            this.name += ' (First inversion)';
        }
        else if (inversion == 2)
        {
            this.name += ' (Second inversion)';
        }
        
        let baseIndex = NOTES.indexOf(baseNote);
        this.notes = [baseNote + (inversion == 0 ? '4' : '5')];

        if (type == 'M')
        {
            this.notes.push(getNoteByInterval(baseIndex, inversion == 2 ? 4 + 12 : 4));
            this.notes.push(getNoteByInterval(baseIndex, 7));
        }
        else if (type == 'm')
        {
            this.notes.push(getNoteByInterval(baseIndex, inversion == 2 ? 3 + 12 : 3));
            this.notes.push(getNoteByInterval(baseIndex, 7));
        }
        else if (type == 'aug')
        {
            this.notes.push(getNoteByInterval(baseIndex, inversion == 2 ? 4 + 12 : 4));
            this.notes.push(getNoteByInterval(baseIndex, 8));
        }
        else if (type == 'dim')
        {
            this.notes.push(getNoteByInterval(baseIndex, inversion == 2 ? 3 + 12 : 3));
            this.notes.push(getNoteByInterval(baseIndex, 8));
        }
    }

}
