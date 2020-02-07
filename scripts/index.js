(function ($)
{

    function playNote(note)
    {
        
    }

    $('.piano rect').on('click', function (e)
    {
        playNote(e.target.getAttribute('data-note'));
    });

})(jQuery);
