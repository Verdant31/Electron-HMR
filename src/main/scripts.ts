import childProcess from 'child_process';

const process = {
  terminal: childProcess.spawn('/bin/sh'),
  handler: console.log,
  send: (data: any) => {
    process.terminal.stdin.write(`${data}\n`);
  },
};
process.terminal.stdout.on('data', (buffer) => {
  process.handler({ type: 'data', data: buffer });
});

export function openNewBrowserTab() {
  process.send('google-chrome --app-url https://www.google.com/');
}

export function Hehe() {}
