const parse = require('csv-parse');
const fs = require('fs');
const inputFileName = process.argv[2];
const parser = parse({delimiter: ','});
const input = fs.createReadStream(inputFileName);
var records = [];

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
    records = records.filter(record => record[7].indexOf('kanjionly') === -1);

    const books = records.reduce((acc, curr) => {
        const book = curr[1];
        const unit = curr[2];

        acc[book] = acc[book] || {};
        acc[book][unit] = acc[book][unit] || [];

        acc[book][unit].push({
            word: curr[0],
            reading: curr[3],
            definition: curr[4],
            notes: curr[5]
        });

        return acc;
    }, {});

    Object.keys(books).forEach(book => {
        const dir = './out/' + book;
        !fs.existsSync(dir) && fs.mkdirSync(dir, { recursive: true });

        Object.keys(books[book]).forEach(unit => {
           const html = render(books[book][unit]);
           fs.writeFileSync(dir + '/' + unit + '.html', html, 'utf8');
        });
    });
});

input.pipe(parser);

function render(words) {
    const head = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style type="text/css">
        td {
            padding: 15px;
            border: solid 1px #AAA;
        }
        table {
            min-width: 30%;
        }

        body {
            font-size: 1.3em;
            font-family: 'Noto Sans CJK JP'
        }

        tr:nth-child(even) {
            background-color: #F0F0F0;
        }
        
        .answer {
            cursor: pointer;
        }

        .answer span {
            visibility: hidden;
        }

        .answer:hover span {
            visibility: visible;
        }
    </style>
</head>
<body>
<table>
`;
    const foot = `
</table>
</body>  
</html>  
`;

    const mid = words.map((word, index) => {
        let hint = word.word.split('').reduce((acc, curr) => {
            if (isKanji(curr)) {
                acc += '__';
            } else {
                acc += curr;
            }

            return acc;
        }, '');
        return `<tr><td>${index}</td><td>${word.reading}</td><td>${hint}</td><td class="answer"><span>${word.word}</span></td></tr>`
    });

    return head + mid + foot;
}

function isKanji(ch) {
    return (ch >= "\u4e00" && ch <= "\u9faf") ||
        (ch >= "\u3400" && ch <= "\u4dbf");
}
