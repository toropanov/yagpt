import { YandexGPT } from 'yandex-gpt-node';
import inquirer from 'inquirer';
import chalk from 'chalk';

const apiKey = "AQVN0uKgvQJWMAI_heCgbn-iCX6GDPNuxDSwh8xg";
const folderId = "b1gs33v5aedlnm93hh4l";

const client = new YandexGPT(apiKey, folderId);

const messages = [];

const log = console.log;

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
    console.log(`${chalk.bold.yellowBright('YaGPT:')} ${messageText}`)
    askYandexGPT();
  }
}


askYandexGPT();
