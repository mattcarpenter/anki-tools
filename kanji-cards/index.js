const parse = require('csv-parse');
const fs = require('fs');
const inputFileName = process.argv[2];
const parser = parse({delimiter: ','});
const input = fs.createReadStream(inputFileName);
const records = [];

parser.on('readable', function(){
    let record;
    while (record = parser.read()) {
        records.push(record);
    }
});

parser.on('error', function(err){
    console.error(err.message)
});

parser.on('end', function(){
    // kanji, book, unit, reading, definition, notes, furigana, tags
    const outputLines = [];
    records.forEach(record => {
        if (record[7].indexOf('kanjionly') === -1) {
            return;
        }

        let kanji = record[0].replace(' (kanji)', '');

        // Find a few words that contain this Kanji
        let words = records
            .filter(r => r[0].indexOf('(kanji)') === -1 && r[0].indexOf(kanji) > -1)
            .map(r => {
                return {
                    reading: r[3],
                    word: r[0]
                }
            })
            .slice(0, 5);

        // output:
        // key, kanji, book, unit, reading, definition, notes, words, tags
        let line = ['kanji-key-' + kanji, kanji, record[1], record[2], record[3], record[4], record[5], words.map(w => w.reading).join('\n'), words.map(w => w.word).join('\n'), 'kanji-writing-' + record[1] + '-' + record[2]].map(field => {
            return field.replace(/"/g,'""').replace(/\n/g,'<br/>');
        });

        outputLines.push(line.map(c => '"' + c + '"').join(','));
    });

    console.log(outputLines.join('\n'));

});

input.pipe(parser);
