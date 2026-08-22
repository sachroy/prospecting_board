# AI-Driven Revenue Command — Setup Guide for New Users

> No technical experience required. Follow these steps in order.

---

## One-time setup (do this once, then skip to "Starting the app" each time)

### Step 1 — Accept the GitHub invitation

1. You will receive an email from GitHub with the subject **"You've been invited to collaborate"**
2. Click **View invitation** in the email
3. If you don't have a GitHub account, click **Create an account** and sign up for free. If you already have one, sign in
4. Click **Accept invitation**

> **Didn't get the email?** Check your spam folder. The invitation comes from `noreply@github.com`

---

### Step 2 — Download the project files

1. Go to: **github.com/sachroy/prospecting_board**
2. Click the green **Code** button near the top right
3. Click **Download ZIP**
4. Find the ZIP in your **Downloads** folder and double-click it to unzip
5. Move the resulting folder (`prospecting_board-main`) to your **Desktop**

---

### Step 3 — Install Node.js

The app needs a small free program called Node.js to run a local web server on your computer.

1. Go to **[nodejs.org](https://nodejs.org)**
2. Click the big **LTS** download button (labelled "Recommended for most users")
3. Open the downloaded file and follow the installer — just click **Next** through all the steps
4. When it finishes, close and reopen any Terminal windows you had open

> If you installed Node.js before, skip this step.

---

### Step 4 — Set up your API keys

The app comes with working API keys already configured. All you need to do is copy one file.

1. Open **Terminal** (press **Command + Space**, type `Terminal`, press Enter)
2. Type the following and press Enter:

```
cd ~/Desktop/prospecting_board-main
```

3. Then type this and press Enter:

```
cp js/api-keys.local.js.example js/api-keys.local.js
```

That's it — the keys are pre-filled and the app is ready to use.

---

## Starting the app (do this every time)

1. Open **Terminal** (Command + Space → type `Terminal` → press Enter)
2. Type the following and press Enter:

```
cd ~/Desktop/prospecting_board-main
```

3. Type the following and press Enter:

```
npx serve . -p 8000
```

4. When you see **"Accepting connections at http://localhost:8000"** in the Terminal, open your browser and go to:

```
http://localhost:8000
```

> **Keep the Terminal window open** while using the app. Closing it will stop the server.  
> To stop the server intentionally, press **Control + C** in the Terminal.

---

## Every time — quick reference

| Step | Command |
|------|---------|
| 1. Open Terminal | Command + Space → type Terminal → Enter |
| 2. Go to the folder | `cd ~/Desktop/prospecting_board-main` |
| 3. Start the server | `npx serve . -p 8000` |
| 4. Open the app | Go to **http://localhost:8000** in your browser |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "command not found: npx" | Node.js isn't installed — go back to Step 3 |
| Browser shows "This site can't be reached" | The Terminal server isn't running — go back to "Starting the app" and make sure the Terminal window is open |
| App loads but AI responses don't work | Make sure you ran the `cp` command in Step 4 to create `api-keys.local.js` |
| Port 8000 already in use | Use a different port: `npx serve . -p 8001` and visit **http://localhost:8001** instead |

---

## Getting updates

When a new version is available:

1. Go to **github.com/sachroy/prospecting_board**
2. Click **Code → Download ZIP**
3. Unzip and replace your existing `prospecting_board-main` folder on your Desktop
4. Run the `cp` command from Step 4 again (your `api-keys.local.js` file does not transfer automatically)

---

*Questions? Reach out to [sachinroy@outlook.com](mailto:sachinroy@outlook.com)*
