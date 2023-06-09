"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const fs = tslib_1.__importStar(require("fs"));
const OpenAiService_1 = tslib_1.__importDefault(require("./OpenAiService"));
const nanospinner_1 = require("nanospinner");
const Ask_1 = tslib_1.__importDefault(require("./Ask"));
const writeToFile_1 = tslib_1.__importDefault(require("./writeToFile"));
let spinner;
const run = async () => {
    const answers = await Ask_1.default.start();
    const inputFilePath = path_1.default.join(process.cwd(), answers.inputFileName);
    const outputFilePath = (0, writeToFile_1.default)(answers.inputFileName);
    const data = fs.readFileSync(inputFilePath).toString('utf-8');
    const prompt = `
${answers.prompt}: 

${data}
`;
    spinner = (0, nanospinner_1.createSpinner)('Sending request to GPT...').start();
    let count = 1;
    const intervalUpdater = setInterval(() => {
        spinner.update({
            text: 'Sending request to GPT... ' + count + ' seconds passed.'
        });
        ++count;
    }, 1000);
    const output = await OpenAiService_1.default.outputFromPrompt({
        apiKey: answers.apiKey,
        openaiModel: answers.openAiModel,
        prompt
    });
    clearInterval(intervalUpdater);
    spinner.success();
    fs.writeFileSync(outputFilePath, output.choices[0].message.content);
    console.log(`
The output has been written to ${outputFilePath}.
`);
};
run().catch((err) => {
    spinner.error({ text: 'Something went wrong.' });
    console.error(err.message);
});
