# Savorly — Deploy Guide

This is your complete Savorly app. Follow these steps in order and you'll have it
live on your phone within about 30 minutes. No developer required.

---

## What you need (all free)

1. A computer with internet access
2. A free account at **github.com**
3. A free account at **vercel.com**
4. A free account at **supabase.com**
5. Your **Anthropic API key** from console.anthropic.com

---

## Step 1 — Install Node.js (one time only)

1. Go to **nodejs.org**
2. Click the big green "LTS" download button
3. Open the downloaded file and click through the installer
4. When it's done, open **Terminal** (Mac: search "Terminal" in Spotlight)
5. Type this and press Enter:
   ```
   node --version
   ```
   You should see a version number like `v20.11.0`. That means it worked.

---

## Step 2 — Put your project on GitHub

GitHub is where your code lives. Vercel (the hosting service) reads directly from it.

1. Go to **github.com** and create a free account if you don't have one
2. Click the **+** button → **New repository**
3. Name it `savorly`, leave everything else as default, click **Create repository**
4. GitHub will show you a page with instructions. Copy the repository URL
   (it looks like `https://github.com/YOUR_USERNAME/savorly.git`)

Now in Terminal, navigate to this project folder:
```bash
cd /path/to/this/savorly/folder
```
(Tip: type `cd ` then drag the folder from Finder into Terminal — it fills the path in automatically)

Then run these commands one by one:
```bash
npm install
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/savorly.git
git push -u origin main
```

Your code is now on GitHub.

---

## Step 3 — Set up Supabase (your database)

Supabase stores your profile, inventory, meal bank, and weekly plan.

1. Go to **supabase.com** and create a free account
2. Click **New project**
3. Give it a name: `savorly`
4. Choose a region close to you (e.g. US East, EU West)
5. Create a strong password and save it somewhere — you won't need it often
6. Wait about 2 minutes for the project to be ready

**Create the database tables:**

7. In your Supabase project, click **SQL Editor** in the left sidebar
8. Click **New query**
9. Open the file `supabase-schema.sql` from this project (in any text editor)
10. Copy the entire contents and paste them into the Supabase SQL editor
11. Click **Run** (the green button)
12. You should see "Success. No rows returned." — that means it worked.

**Get your Supabase keys:**

13. Click **Settings** (gear icon) in the left sidebar → **API**
14. You'll see two values you need:
    - **Project URL** (looks like `https://abcdefgh.supabase.co`)
    - **anon public** key (a long string starting with `eyJ`)
15. Copy both and keep them open — you'll need them in Step 5.

---

## Step 4 — Get your Anthropic API key

This powers the AI recipe generation and URL recipe extraction.

1. Go to **console.anthropic.com**
2. Sign in or create an account
3. Click **API Keys** in the left sidebar
4. Click **Create Key**
5. Name it `savorly` and click Create
6. Copy the key immediately — it starts with `sk-ant-` and you can only see it once
7. Add a small amount of credit (Settings → Billing) — $5 is plenty to start.
   Recipe generation costs about $0.003 per request.

---

## Step 5 — Deploy to Vercel

Vercel hosts your app and handles the AI API routes securely.

1. Go to **vercel.com** and create a free account (sign up with GitHub — easiest)
2. Click **Add New Project**
3. You'll see your GitHub repositories listed — click **Import** next to `savorly`
4. Vercel will detect it's a Vite project automatically. Don't change anything.
5. Before clicking Deploy, click **Environment Variables** and add these three:

   | Name | Value |
   |------|-------|
   | `ANTHROPIC_API_KEY` | Your key starting with `sk-ant-` |
   | `VITE_SUPABASE_URL` | Your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

6. Click **Deploy**
7. Wait about 90 seconds
8. Vercel will give you a URL like `savorly.vercel.app`

Your app is live.

---

## Step 6 — Add it to your iPhone home screen

This makes it look and feel like a native app.

1. Open **Safari** on your iPhone (must be Safari, not Chrome)
2. Go to your Vercel URL (e.g. `savorly.vercel.app`)
3. Tap the **Share** button (the box with an arrow pointing up)
4. Scroll down and tap **"Add to Home Screen"**
5. Name it `Savorly` and tap **Add**

It will appear on your home screen with a full-screen experience — no browser bar,
no address bar. It looks like a native app.

---

## Step 7 — Enable email sign-up in Supabase

By default, Supabase requires email confirmation. For your own use, you can turn this off:

1. In Supabase → **Authentication** → **Providers** → **Email**
2. Turn off **"Confirm email"**
3. Save

Now you can sign up and sign in immediately.

---

## Making updates

Whenever you want to change the app, edit the files, then run:
```bash
git add .
git commit -m "Describe what you changed"
git push
```

Vercel automatically detects the push and redeploys within 90 seconds.
Your live URL stays the same.

---

## Costs

| Service | Free tier | You'll pay when |
|---------|-----------|-----------------|
| Vercel | Unlimited personal projects | Never, at this scale |
| Supabase | 500MB, unlimited users | Never, unless you scale |
| Anthropic | Pay per use | ~$0.003 per AI recipe · $5 lasts a very long time |
| GitHub | Free for public/private repos | Never |

**Total monthly cost at personal use: effectively $0.**

---

## Something broke?

- **"Cannot find module"** → Run `npm install` again in the project folder
- **AI recipes not generating** → Check your ANTHROPIC_API_KEY in Vercel → Settings → Environment Variables
- **Data not saving** → Check your Supabase URL and anon key in Vercel environment variables
- **White screen** → Go to Vercel dashboard, click your deployment, look at the build logs

---

## File structure reference

```
savorly/
├── src/
│   ├── App.jsx          ← The entire app (UI + logic)
│   └── lib/
│       └── supabase.js  ← Database read/write functions
├── api/
│   ├── generate-recipes.js  ← AI recipe generation (runs on Vercel, key is safe here)
│   └── parse-recipe.js      ← Recipe URL extraction (runs on Vercel, key is safe here)
├── public/
│   └── manifest.json    ← Makes it installable as a PWA
├── index.html           ← Entry point
├── vite.config.js       ← Build config
├── vercel.json          ← Vercel routing
├── supabase-schema.sql  ← Database tables (paste into Supabase SQL editor)
├── .env.example         ← Template for your environment variables
└── README.md            ← This file
```
