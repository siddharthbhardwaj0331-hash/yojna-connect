const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let backend;
let frontend;

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    autoHideMenuBar: true,
  });

  win.loadURL("http://localhost:3000");
}

app.whenReady().then(() => {

  // backend start
  backend = spawn("python", ["run.py"], {
    cwd: __dirname
  });

  // frontend serve (IMPORTANT FIX)
  frontend = spawn("npx", ["serve", "out"], {
    cwd: path.join(__dirname, "frontend"),
    shell: true
  });

  setTimeout(createWindow, 5000);
});

app.on("window-all-closed", () => {
  if (backend) backend.kill();
  if (frontend) frontend.kill();
  app.quit();
});