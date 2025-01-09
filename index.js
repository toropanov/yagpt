import Conf from 'conf';
import { YandexGPT } from 'yandex-gpt-node';
import inquirer from 'inquirer';
import chalk from 'chalk';

const config = new Conf({ projectName: 'YaGPT'} );

const log = console.log;

const apiKey = config.get('api-key');
const folderId = config.get('folder-id')

if (!apiKey) {
  const { apiKey, folderId } = await inquirer.prompt([
    {
      message: 'YaGPT Api Key',
      type: 'password',
      name: 'apiKey',
    },
    {
      message: 'Folder ID',
      type: 'password',
      name: 'folderId',
    },
  ]);

  config.set('api-key', apiKey );
  config.set('folder-id', folderId );

  log(chalk.white('✅ Credentials saved!'));
}

const client = new YandexGPT(apiKey, folderId);

const messages = [];

async function askYandexGPT(question) {
  let text = question;

  if (!text) {
    ({ text } = await inquirer.prompt([
      {
        message: chalk.bold.yellowBright('You:'),
        type: 'input',
        name: 'text',
      },
    ]));
  }

  const res = await client.generateText({
    modelUri: `gpt://${client.getFolderId()}/yandexgpt-lite`,
    completionOptions: {
      stream: false,
    },
    messages: [
      ...messages,
      {
        role: "user",
        text,
      },
    ],
  });
  
  const [alternative] = res?.result?.alternatives;
  const { text: messageText } = alternative?.message;

  if (!messageText) return;
  
  messages.push(alternative.message);
  
  if (question) {
    log(messageText)
    return messageText;
  } else {
    log(`${chalk.bold.yellowBright('YaGPT:')} ${messageText}`);
    log();
    askYandexGPT();
  }
}


askYandexGPT(process.argv.slice(2)[0]);
