const fs = require('fs');
const inputFileName = process.argv[2];
const data = JSON.parse(fs.readFileSync(inputFileName).toString());

// english, japanese, syntax, description, tags
let outputLines = [];

data.forEach(lesson => {
    lesson.topics.forEach(topic => {
        // Examples
        if (topic.content.examples && topic.content.examples.length) {
            outputLines = outputLines.concat(topic.content.examples.map(example => {
                return [example['en-US'], example['ja-JP-furi'], topic.content.syntaxHtml, topic.content.description,  'lesson-' + lesson.lessonNumber + '-sentence sentence' + (example['tags'] ? ' ' + example['tags'].split(' ').map(t => 'has-' + t).join(' ') : '')];
            }));
        }

        (topic.content.uses || []).forEach(use => {
            if (!use.examples) {
                return;
            }
            outputLines = outputLines.concat(use.examples.map(example => {
                return [example['en-US'], example['ja-JP-furi'], use.syntax || topic.content.syntaxHtml, use.description || topic.content.description, 'lesson-' + lesson.lessonNumber + '-sentence sentence' + (example['tags'] ? ' ' + example['tags'].split(' ').map(t => 'has-' + t).join(' ') : '')];
            }));
        });
    });
});

console.log(outputLines.map(line => line.map(field => {
    return '"' + (field || '').replace(/"/g,'""').replace(/\n/g,'<br/>') + '"';
})).join('\n'));
