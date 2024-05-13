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

async function askYandexGPT() {
  const { text } = await inquirer.prompt([
    {
      message: chalk.bold.yellowBright('You:'),
      type: 'input',
      name: 'text',
    },
  ]);

  const res = await client.generateText({
    modelUri: `gpt://${client.getFolderId()}/yandexgpt-lite`,
    completionOptions: {
      stream: false,
      temperature: 0.6,
      maxTokens: 100,
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
  
  if (messageText) {
    messages.push(alternative.message)
    log(`${chalk.bold.yellowBright('YaGPT:')} ${messageText}`);
    log();
    askYandexGPT();
  }
}


askYandexGPT();
